from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.utils import timezone

from apps.chat.models import Message
from apps.chat.serializers import MessageSerializer
from apps.notifications.services import create_notification


def chat_group_name(connection_id: int) -> str:
    return f"chat_connection_{connection_id}"


def create_chat_message(connection, sender, body: str) -> Message:
    message = Message.objects.create(connection=connection, sender=sender, body=body, delivered_at=timezone.now())
    broadcast_chat_message(message)
    recipient = connection.user_high if connection.user_low_id == sender.id else connection.user_low
    create_notification(recipient, kind="message_received", actor=sender, data={"connection_id": connection.id, "message_id": message.id}, content_object=message)
    return message


def broadcast_chat_message(message: Message) -> None:
    channel_layer = get_channel_layer()
    if channel_layer is None:
        return
    async_to_sync(channel_layer.group_send)(
        chat_group_name(message.connection_id),
        {"type": "chat.message", "message": MessageSerializer(message).data},
    )


def broadcast_connection_closed(connection_id: int, reason: str = "closed") -> None:
    channel_layer = get_channel_layer()
    if channel_layer is None:
        return
    async_to_sync(channel_layer.group_send)(
        chat_group_name(connection_id),
        {"type": "chat.connection_closed", "connection_id": connection_id, "reason": reason},
    )
