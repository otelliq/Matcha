from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers

from apps.accounts.models import PasswordResetToken, User
from apps.core.serializers import PlainTextSerializerMixin


class PublicUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "first_name", "last_name", "date_joined"]


class MeUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "email", "username", "first_name", "last_name", "date_joined", "email_verified_at"]
        read_only_fields = ["id", "date_joined", "email_verified_at"]


class TokenPairSerializer(serializers.Serializer):
    access = serializers.CharField()
    refresh = serializers.CharField()


class RegistrationSerializer(PlainTextSerializerMixin, serializers.Serializer):
    email = serializers.EmailField()
    username = serializers.CharField(max_length=150)
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
    password = serializers.CharField(write_only=True, min_length=12, trim_whitespace=False)
    plain_text_fields = ("username", "first_name", "last_name")

    def validate_email(self, value):
        return value.strip().lower()

    def validate_password(self, value):
        try:
            validate_password(value)
        except DjangoValidationError as exc:
            raise serializers.ValidationError(list(exc.messages)) from exc
        return value


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, trim_whitespace=False)

    def validate_email(self, value):
        return value.strip().lower()


class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField()


class EmailVerificationSerializer(PlainTextSerializerMixin, serializers.Serializer):
    token = serializers.CharField()
    plain_text_fields = ("token",)


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        return value.strip().lower()


class PasswordResetConfirmSerializer(PlainTextSerializerMixin, serializers.Serializer):
    token = serializers.CharField()
    password = serializers.CharField(write_only=True, min_length=12, trim_whitespace=False)
    plain_text_fields = ("token",)

    def validate_password(self, value):
        try:
            validate_password(value)
        except DjangoValidationError as exc:
            raise serializers.ValidationError(list(exc.messages)) from exc
        return value


class PasswordResetTokenSerializer(serializers.ModelSerializer):
    class Meta:
        model = PasswordResetToken
        fields = ["token", "expires_at", "consumed_at"]


class RegistrationResponseSerializer(serializers.Serializer):
    user = PublicUserSerializer()
    verification_sent = serializers.BooleanField()


class MeResponseSerializer(serializers.Serializer):
    user = MeUserSerializer()
