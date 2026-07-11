from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.exceptions import NotFound, PermissionDenied, ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.pagination import StandardLimitOffsetPagination
from apps.core.permissions import users_are_blocked
from apps.interactions.models import Connection, Like
from apps.interactions.serializers import (
    BlockOutcomeSerializer,
    BlockSerializer,
    ConnectionSummarySerializer,
    LikeOutcomeSerializer,
    LikeSerializer,
    ReportOutcomeSerializer,
    ReportSerializer,
)
from apps.interactions.services import deactivate_block, disconnect_users, ensure_block, ensure_connection, ensure_like
from apps.profiles.models import Profile
from apps.profiles.serializers import ProfilePublicSerializer
from apps.notifications.services import create_notification

User = get_user_model()


def _get_profile(user):
    profile, _ = Profile.objects.get_or_create(user=user)
    return profile


def _target_user(user_id: int):
    user = User.objects.select_related("profile").filter(pk=user_id).first()
    if user is None:
        raise NotFound("User not found.")
    return user


def _require_profile_picture(user):
    profile = _get_profile(user)
    if not profile.pictures.exists():
        raise ValidationError({"profile": "You need at least one profile picture to like other users."})


class LikeActionAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, user_id: int):
        target_user = _target_user(user_id)
        if target_user == request.user:
            raise ValidationError({"user_id": "You cannot like your own profile."})
        if users_are_blocked(request.user, target_user):
            raise PermissionDenied("You cannot interact with this user.")
        _require_profile_picture(request.user)
        like = ensure_like(request.user, target_user)
        reciprocal_like = Like.objects.filter(sender=target_user, recipient=request.user, is_active=True).first()
        connection = None
        connection_created = False
        if reciprocal_like:
            connection, connection_created = ensure_connection(request.user, target_user)
            create_notification(request.user, kind="mutual_like", actor=target_user, data={"connection_id": connection.id})
            create_notification(target_user, kind="mutual_like", actor=request.user, data={"connection_id": connection.id})
        else:
            create_notification(target_user, kind="profile_liked", actor=request.user, data={"from_user_id": request.user.id})
        payload = {"like": like, "connection_created": bool(connection), "connection": None}
        if connection:
            payload["connection"] = {
                "id": connection.id,
                "profile": ProfilePublicSerializer(_get_profile(target_user)).data,
                "created_at": connection.created_at,
                "closed_at": connection.closed_at,
            }
        return Response(LikeOutcomeSerializer(payload).data, status=status.HTTP_201_CREATED if connection_created else status.HTTP_200_OK)

    def delete(self, request, user_id: int):
        target_user = _target_user(user_id)
        if target_user == request.user:
            raise ValidationError({"user_id": "You cannot unlike your own profile."})
        if users_are_blocked(request.user, target_user):
            raise PermissionDenied("You cannot interact with this user.")
        like = Like.objects.filter(sender=request.user, recipient=target_user).first()
        if like is None:
            raise NotFound("Like not found.")
        like.is_active = False
        like.save(update_fields=["is_active", "updated_at"])
        disconnect_users(request.user, target_user)
        create_notification(target_user, kind="unliked", actor=request.user, data={"from_user_id": request.user.id})
        return Response(LikeOutcomeSerializer({"like": like, "connection_created": False, "connection": None}).data)


class BlockActionAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, user_id: int):
        target_user = _target_user(user_id)
        if target_user == request.user:
            raise ValidationError({"user_id": "You cannot block your own profile."})
        block = ensure_block(request.user, target_user)
        disconnect_users(request.user, target_user)
        return Response(BlockOutcomeSerializer({"block": block, "disconnected": True}).data, status=status.HTTP_201_CREATED)

    def delete(self, request, user_id: int):
        target_user = _target_user(user_id)
        block = deactivate_block(request.user, target_user)
        if block is None:
            raise NotFound("Block not found.")
        return Response(BlockOutcomeSerializer({"block": block, "disconnected": False}).data)


class ReportCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, user_id: int):
        target_user = _target_user(user_id)
        if target_user == request.user:
            raise ValidationError({"user_id": "You cannot report your own profile."})
        serializer = ReportSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        report = serializer.save(reporter=request.user, reported=target_user)
        return Response(ReportOutcomeSerializer({"report": report}).data, status=status.HTTP_201_CREATED)


class ConnectionListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        queryset = Connection.objects.filter(is_active=True).filter(user_low=request.user) | Connection.objects.filter(is_active=True).filter(user_high=request.user)
        queryset = queryset.select_related("user_low__profile", "user_high__profile").order_by("-created_at")
        items = []
        for connection in queryset:
            other_user = connection.user_high if connection.user_low_id == request.user.id else connection.user_low
            if users_are_blocked(request.user, other_user) or not hasattr(other_user, "profile"):
                continue
            items.append({
                "id": connection.id,
                "profile": ProfilePublicSerializer(other_user.profile).data,
                "created_at": connection.created_at,
                "closed_at": connection.closed_at,
            })
        paginator = StandardLimitOffsetPagination()
        page = paginator.paginate_queryset(items, request, view=self)
        return paginator.get_paginated_response(page)
