from rest_framework import serializers

from apps.notifications.models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    actor_username = serializers.CharField(source="actor.username", read_only=True)

    class Meta:
        model = Notification
        fields = [
            "id",
            "recipient",
            "actor",
            "actor_username",
            "kind",
            "data",
            "read_at",
            "delivered_at",
            "created_at",
        ]
        read_only_fields = ["recipient", "actor", "actor_username", "delivered_at", "created_at"]


class UnreadCountSerializer(serializers.Serializer):
    unread_count = serializers.IntegerField()
from rest_framework import serializers

from apps.notifications.models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    actor_username = serializers.CharField(source="actor.username", read_only=True)

    class Meta:
        model = Notification
        fields = [
            "id",
            "recipient",
            "actor",
            "actor_username",
            "kind",
            "data",
            "read_at",
            "delivered_at",
            "created_at",
        ]
        read_only_fields = ["recipient", "actor", "actor_username", "delivered_at", "created_at"]


class UnreadCountSerializer(serializers.Serializer):
    unread_count = serializers.IntegerField()
