from django.contrib.auth import authenticate
from rest_framework import status
from rest_framework.exceptions import AuthenticationFailed, NotFound
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from rest_framework_simplejwt.tokens import RefreshToken

from apps.accounts.models import User
from apps.accounts.services import consume_email_verification_token, consume_password_reset_token, create_email_verification_token, create_password_reset_token
from apps.accounts.serializers import (
    EmailVerificationSerializer,
    LoginSerializer,
    LogoutSerializer,
    MeResponseSerializer,
    PasswordResetConfirmSerializer,
    PasswordResetRequestSerializer,
    RegistrationResponseSerializer,
    RegistrationSerializer,
    TokenPairSerializer,
)
from apps.accounts.tasks import send_password_reset_email, send_verification_email
from apps.profiles.models import Profile


class RegistrationAPIView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "auth_register"

    def post(self, request):
        serializer = RegistrationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = User.objects.create_user(**serializer.validated_data)
        Profile.objects.get_or_create(user=user)
        token = create_email_verification_token(user)
        send_verification_email.delay(user.email, token.token)
        return Response(RegistrationResponseSerializer({"user": user, "verification_sent": True}).data, status=status.HTTP_201_CREATED)


class LoginAPIView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "auth_login"

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = authenticate(request, email=serializer.validated_data["email"], password=serializer.validated_data["password"])
        if not user:
            raise AuthenticationFailed("Invalid email or password.")
        refresh = RefreshToken.for_user(user)
        return Response(TokenPairSerializer({"access": str(refresh.access_token), "refresh": str(refresh)}).data)


class LogoutAPIView(APIView):
    def post(self, request):
        serializer = LogoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            token = RefreshToken(serializer.validated_data["refresh"])
            token.blacklist()
        except TokenError as exc:
            raise AuthenticationFailed("The refresh token is invalid or expired.") from exc
        return Response(status=status.HTTP_204_NO_CONTENT)


class EmailVerificationAPIView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "auth_verify_email"

    def get(self, request, token: str):
        serializer = EmailVerificationSerializer(data={"token": token})
        serializer.is_valid(raise_exception=True)
        verification = consume_email_verification_token(serializer.validated_data["token"])
        if verification is None:
            raise NotFound("Verification token not found or already consumed.")
        return Response(status=status.HTTP_204_NO_CONTENT)


class PasswordResetRequestAPIView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "auth_password_reset"

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = User.objects.filter(email=serializer.validated_data["email"]).first()
        if user:
            token = create_password_reset_token(user)
            send_password_reset_email.delay(user.email, token.token)
        return Response(status=status.HTTP_204_NO_CONTENT)


class PasswordResetConfirmAPIView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "auth_password_reset"

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        reset = consume_password_reset_token(serializer.validated_data["token"])
        if reset is None:
            raise NotFound("Password reset token not found or already consumed.")
        reset.user.set_password(serializer.validated_data["password"])
        reset.user.save(update_fields=["password", "updated_at"])
        return Response(status=status.HTTP_204_NO_CONTENT)


class TokenRefreshAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = TokenRefreshSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data)


class MeAPIView(APIView):
    def get(self, request):
        return Response(MeResponseSerializer({"user": request.user}).data)
