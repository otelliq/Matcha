from rest_framework import status
from rest_framework.exceptions import NotFound
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.pagination import StandardLimitOffsetPagination
from apps.notifications.models import Notification
from apps.notifications.serializers import NotificationSerializer, UnreadCountSerializer
from apps.notifications.services import mark_all_notifications_read, mark_notification_read


class NotificationListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        queryset = Notification.objects.filter(recipient=request.user).select_related("actor").order_by("-created_at")
        paginator = StandardLimitOffsetPagination()
        page = paginator.paginate_queryset(queryset, request, view=self)
        return paginator.get_paginated_response(NotificationSerializer(page, many=True).data)


class UnreadCountAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        unread_count = Notification.objects.filter(recipient=request.user, read_at__isnull=True).count()
        return Response(UnreadCountSerializer({"unread_count": unread_count}).data)


class NotificationReadAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk: int):
        notification = Notification.objects.filter(pk=pk, recipient=request.user).first()
        if notification is None:
            raise NotFound("Notification not found.")
        mark_notification_read(notification)
        return Response(NotificationSerializer(notification).data, status=status.HTTP_200_OK)

    def post(self, request, pk: int):
        return self.patch(request, pk)


class NotificationMarkAllReadAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        updated = mark_all_notifications_read(request.user)
        return Response({"marked_read": updated}, status=status.HTTP_200_OK)

