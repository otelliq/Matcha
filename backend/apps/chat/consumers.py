from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncJsonWebsocketConsumer

from apps.chat.services import chat_group_name, create_chat_message
from apps.core.permissions import users_are_blocked
from apps.interactions.models import Connection


class ChatConsumer(AsyncJsonWebsocketConsumer):
    close_code_unauthenticated = 4401
    close_code_forbidden = 4403

    async def connect(self):
        self.connection_id = self.scope["url_route"]["kwargs"]["connection_id"]
        self.connection = await self._get_connection()
        if self.connection is None:
            await self.close(code=self.close_code_forbidden)
            return
        self.group_name = chat_group_name(self.connection.id)
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, "group_name"):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive_json(self, content, **kwargs):
        if not await self._is_connection_active():
            await self.close(code=self.close_code_forbidden)
            return
        body = (content or {}).get("body", "").strip()
        if not body:
            await self.send_json({"error": {"code": "validation_error", "message": "Body is required."}})
            return
        await self._create_message(body)

    async def chat_message(self, event):
        await self.send_json(event["message"])

    async def chat_connection_closed(self, event):
        await self.close(code=self.close_code_forbidden)

    @database_sync_to_async
    def _get_connection(self):
        connection = Connection.objects.select_related("user_low", "user_high").filter(pk=self.connection_id, is_active=True).first()
        if connection is None:
            return None
        user = self.scope["user"]
        if user.is_anonymous or user not in {connection.user_low, connection.user_high}:
            return None
        peer = connection.user_high if connection.user_low_id == user.id else connection.user_low
        if users_are_blocked(user, peer):
            return None
        return connection

    @database_sync_to_async
    def _create_message(self, body: str):
        return create_chat_message(self.connection, self.scope["user"], body)

    @database_sync_to_async
    def _is_connection_active(self):
        connection = Connection.objects.filter(pk=self.connection_id, is_active=True).select_related("user_low", "user_high").first()
        if connection is None:
            return False
        user = self.scope["user"]
        if user.is_anonymous or user not in {connection.user_low, connection.user_high}:
            return False
        peer = connection.user_high if connection.user_low_id == user.id else connection.user_low
        if users_are_blocked(user, peer):
            return False
        self.connection = connection
        return True
