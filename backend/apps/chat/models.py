from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models


class Message(models.Model):
    connection = models.ForeignKey("interactions.Connection", on_delete=models.CASCADE, related_name="messages")
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="sent_messages")
    body = models.TextField()
    read_at = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "chat_message"
        ordering = ["created_at"]

    def clean(self):
        super().clean()
        connection = self.connection
        if not connection or not self.sender_id:
            return
        allowed_senders = {connection.user_low_id, connection.user_high_id}
        if self.sender_id not in allowed_senders:
            raise ValidationError({"sender": "Only connected users can send messages in this conversation."})
