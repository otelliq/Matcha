from django.db.models import Q
from django.utils import timezone
from rest_framework import status
from rest_framework.exceptions import NotFound, PermissionDenied, ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.chat.models import Message
from apps.chat.serializers import ConversationSerializer, MessageCreateSerializer, MessageSerializer
from apps.chat.services import create_chat_message
from apps.core.pagination import StandardLimitOffsetPagination
from apps.core.permissions import users_are_blocked
from apps.interactions.models import Connection
from apps.notifications.models import Notification
from apps.profiles.models import Profile
from apps.profiles.serializers import ProfilePublicSerializer


def _get_profile(user) -> Profile:
    profile, _ = Profile.objects.get_or_create(user=user)
    return profile


def _get_connection(connection_id: int, user):
    connection = Connection.objects.select_related("user_low__profile", "user_high__profile").filter(pk=connection_id, is_active=True).first()
    if connection is None:
        raise NotFound("Connection not found.")
    if user not in {connection.user_low, connection.user_high}:
        raise PermissionDenied("You are not allowed to access this conversation.")
    peer = connection.user_high if connection.user_low_id == user.id else connection.user_low
    if users_are_blocked(user, peer):
        raise PermissionDenied("You are not allowed to access this conversation.")
    return connection, peer


class ConversationListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        queryset = Connection.objects.filter(is_active=True).filter(Q(user_low=request.user) | Q(user_high=request.user)).select_related("user_low__profile", "user_high__profile").order_by("-created_at")
        items = []
        for connection in queryset:
            peer = connection.user_high if connection.user_low_id == request.user.id else connection.user_low
            if users_are_blocked(request.user, peer) or not hasattr(peer, "profile"):
                continue
            last_message = Message.objects.filter(connection=connection).order_by("-created_at").first()
            unread_count = Message.objects.filter(connection=connection, sender=peer, read_at__isnull=True).count()
            items.append({
                "connection_id": connection.id,
                "profile": ProfilePublicSerializer(peer.profile).data,
                "last_message": MessageSerializer(last_message).data if last_message else None,
                "unread_count": unread_count,
                "created_at": connection.created_at,
                "updated_at": connection.created_at,
            })
        paginator = StandardLimitOffsetPagination()
        page = paginator.paginate_queryset(items, request, view=self)
        return paginator.get_paginated_response(page)


class MessageListCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, connection_id: int):
        connection, _ = _get_connection(connection_id, request.user)
        queryset = Message.objects.filter(connection=connection).select_related("sender").order_by("created_at")
        paginator = StandardLimitOffsetPagination()
        page = paginator.paginate_queryset(queryset, request, view=self)
        return paginator.get_paginated_response(MessageSerializer(page, many=True).data)

    def post(self, request, connection_id: int):
        connection, _ = _get_connection(connection_id, request.user)
        serializer = MessageCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        message = create_chat_message(connection, request.user, serializer.validated_data["body"])
        return Response(MessageSerializer(message).data, status=status.HTTP_201_CREATED)


class MessageMarkReadAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, connection_id: int):
        connection, peer = _get_connection(connection_id, request.user)
        marked_read = Message.objects.filter(connection=connection, sender=peer, read_at__isnull=True).update(read_at=timezone.now())
        return Response({"marked_read": marked_read}, status=status.HTTP_200_OK)

