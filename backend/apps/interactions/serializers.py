from rest_framework import serializers

from apps.core.serializers import PlainTextSerializerMixin
from apps.interactions.models import Block, Connection, Like, Report
from apps.profiles.serializers import ProfilePublicSerializer


class LikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Like
        fields = ["id", "sender", "recipient", "is_active", "created_at", "updated_at"]
        read_only_fields = ["sender", "recipient", "created_at", "updated_at"]


class BlockSerializer(PlainTextSerializerMixin, serializers.ModelSerializer):
    plain_text_fields = ("reason",)

    class Meta:
        model = Block
        fields = ["id", "blocker", "blocked", "reason", "is_active", "created_at"]
        read_only_fields = ["blocker", "blocked", "created_at"]


class ReportSerializer(PlainTextSerializerMixin, serializers.ModelSerializer):
    plain_text_fields = ("details",)

    class Meta:
        model = Report
        fields = ["id", "reporter", "reported", "reason", "details", "reviewed_by", "reviewed_at", "created_at"]
        read_only_fields = ["reporter", "reported", "reviewed_by", "reviewed_at", "created_at"]


class ConnectionSummarySerializer(serializers.Serializer):
    id = serializers.IntegerField()
    profile = ProfilePublicSerializer()
    created_at = serializers.DateTimeField()
    closed_at = serializers.DateTimeField(allow_null=True)


class LikeOutcomeSerializer(serializers.Serializer):
    like = LikeSerializer()
    connection_created = serializers.BooleanField()
    connection = ConnectionSummarySerializer(allow_null=True)


class BlockOutcomeSerializer(serializers.Serializer):
    block = BlockSerializer()
    disconnected = serializers.BooleanField()


class ReportOutcomeSerializer(serializers.Serializer):
    report = ReportSerializer()
