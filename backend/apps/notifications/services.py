from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.contrib.contenttypes.models import ContentType
from django.utils import timezone

from apps.notifications.models import Notification
from apps.notifications.serializers import NotificationSerializer


def notification_group_name(user_id: int) -> str:
    return f"notifications_{user_id}"


def create_notification(recipient, kind: str, actor=None, data: dict | None = None, content_object=None) -> Notification:
    notification = Notification.objects.create(
        recipient=recipient,
        actor=actor,
        kind=kind,
        data=data or {},
        delivered_at=timezone.now(),
        content_type=ContentType.objects.get_for_model(content_object) if content_object is not None else None,
        object_id=getattr(content_object, "pk", None),
    )
    broadcast_notification(notification)
    return notification


def broadcast_notification(notification: Notification) -> None:
    channel_layer = get_channel_layer()
    if channel_layer is None:
        return
    async_to_sync(channel_layer.group_send)(
        notification_group_name(notification.recipient_id),
        {
            "type": "notification.event",
            "notification": NotificationSerializer(notification).data,
        },
    )


def mark_notification_read(notification: Notification) -> Notification:
    if notification.read_at is None:
        notification.read_at = timezone.now()
        notification.save(update_fields=["read_at"])
    return notification


def mark_all_notifications_read(recipient) -> int:
    return Notification.objects.filter(recipient=recipient, read_at__isnull=True).update(read_at=timezone.now())
