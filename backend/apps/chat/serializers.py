from rest_framework import serializers

from apps.chat.models import Message
from apps.core.serializers import PlainTextSerializerMixin
from apps.profiles.serializers import ProfilePublicSerializer


class MessageSerializer(PlainTextSerializerMixin, serializers.ModelSerializer):
    plain_text_fields = ("body",)
    sender_username = serializers.CharField(source="sender.username", read_only=True)

    class Meta:
        model = Message
        fields = ["id", "connection", "sender", "sender_username", "body", "read_at", "delivered_at", "created_at", "updated_at"]
        read_only_fields = ["sender", "read_at", "delivered_at", "created_at", "updated_at"]


class MessageCreateSerializer(PlainTextSerializerMixin, serializers.Serializer):
    body = serializers.CharField()
    plain_text_fields = ("body",)


class ConversationSerializer(serializers.Serializer):
    connection_id = serializers.IntegerField()
    profile = ProfilePublicSerializer()
    last_message = MessageSerializer(allow_null=True)
    unread_count = serializers.IntegerField()
    created_at = serializers.DateTimeField()
    updated_at = serializers.DateTimeField()
from rest_framework import serializers

from apps.chat.models import Message
from apps.core.serializers import PlainTextSerializerMixin


class MessageSerializer(PlainTextSerializerMixin, serializers.ModelSerializer):
    plain_text_fields = ("body",)
    sender_username = serializers.CharField(source="sender.username", read_only=True)

    class Meta:
        model = Message
        fields = [
            "id",
            "connection",
            "sender",
            "sender_username",
            "body",
            "read_at",
            "delivered_at",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["sender", "read_at", "delivered_at", "created_at", "updated_at"]


class ConversationSerializer(serializers.Serializer):
    connection_id = serializers.IntegerField()
    participants = serializers.ListField(child=serializers.CharField(), read_only=True)
    last_message = serializers.CharField(read_only=True)
    unread_count = serializers.IntegerField(read_only=True)
