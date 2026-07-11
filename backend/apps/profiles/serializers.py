from django.contrib.auth import get_user_model
from django.core.files.images import ImageFile
from django.utils import timezone
from django.utils.text import slugify
from rest_framework import serializers

from PIL import Image, UnidentifiedImageError

from apps.accounts.serializers import PublicUserSerializer
from apps.accounts.services import create_email_verification_token
from apps.accounts.tasks import send_verification_email
from apps.core.serializers import PlainTextSerializerMixin, ensure_plain_text
from apps.profiles.models import Profile, ProfilePicture, Tag

User = get_user_model()


class TagSerializer(PlainTextSerializerMixin, serializers.ModelSerializer):
    plain_text_fields = ("name", "slug")

    class Meta:
        model = Tag
        fields = ["id", "name", "slug", "created_at"]
        read_only_fields = ["id", "created_at"]

    def validate_name(self, value):
        if not value.strip():
            raise serializers.ValidationError("Tag name cannot be empty.")
        return value

    def validate_slug(self, value):
        return value.strip().lower()

    def create(self, validated_data):
        validated_data.setdefault("slug", slugify(validated_data["name"]))
        return super().create(validated_data)


class ProfilePictureSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProfilePicture
        fields = ["id", "image", "is_primary", "position", "alt_text", "created_at"]
        read_only_fields = ["id", "created_at"]


class ProfilePublicSerializer(PlainTextSerializerMixin, serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    first_name = serializers.CharField(source="user.first_name", read_only=True)
    last_name = serializers.CharField(source="user.last_name", read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    pictures = ProfilePictureSerializer(many=True, read_only=True)
    plain_text_fields = ("biography", "city", "neighborhood")

    class Meta:
        model = Profile
        fields = [
            "id",
            "username",
            "first_name",
            "last_name",
            "gender",
            "sexual_preference",
            "biography",
            "date_of_birth",
            "latitude",
            "longitude",
            "city",
            "neighborhood",
            "location_source",
            "fame_rating",
            "fame_rating_components",
            "fame_rating_recalculated_at",
            "last_seen_at",
            "tags",
            "pictures",
        ]
        read_only_fields = ["fame_rating", "fame_rating_components", "fame_rating_recalculated_at", "last_seen_at"]


class ProfileMeSerializer(ProfilePublicSerializer):
    email = serializers.EmailField(source="user.email")
    username = serializers.CharField(source="user.username")
    first_name = serializers.CharField(source="user.first_name")
    last_name = serializers.CharField(source="user.last_name")
    tag_ids = serializers.PrimaryKeyRelatedField(source="tags", queryset=Tag.objects.all(), many=True, required=False, write_only=True)

    class Meta(ProfilePublicSerializer.Meta):
        fields = ProfilePublicSerializer.Meta.fields + ["email", "tag_ids"]

    def validate(self, attrs):
        attrs = super().validate(attrs)
        user_data = attrs.get("user", {})
        if user_data.get("email"):
            user_data["email"] = user_data["email"].strip().lower()
        return attrs

    def validate_username(self, value):
        return ensure_plain_text(value.strip(), "username")

    def validate_first_name(self, value):
        return ensure_plain_text(value.strip(), "first_name")

    def validate_last_name(self, value):
        return ensure_plain_text(value.strip(), "last_name")

    def validate_date_of_birth(self, value):
        today = timezone.now().date()
        age = today.year - value.year - ((today.month, today.day) < (value.month, value.day))
        if age < 18:
            raise serializers.ValidationError("Users must be at least 18 years old.")
        return value

    def update(self, instance, validated_data):
        user_data = validated_data.pop("user", {})
        tags = validated_data.pop("tags", None)
        previous_email = instance.user.email
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if user_data:
            for attr, value in user_data.items():
                setattr(instance.user, attr, value)
        instance.user.save()
        instance.save()
        if tags is not None:
            instance.tags.set(tags)
        new_email = instance.user.email.strip().lower()
        if new_email != previous_email.strip().lower():
            instance.user.email_verified_at = None
            instance.user.save(update_fields=["email_verified_at", "updated_at"])
            token = create_email_verification_token(instance.user)
            send_verification_email.delay(instance.user.email, token.token)
        return instance


class ProfileLocationSerializer(PlainTextSerializerMixin, serializers.Serializer):
    latitude = serializers.DecimalField(max_digits=9, decimal_places=6, required=False, allow_null=True)
    longitude = serializers.DecimalField(max_digits=9, decimal_places=6, required=False, allow_null=True)
    city = serializers.CharField(required=False, allow_blank=True)
    neighborhood = serializers.CharField(required=False, allow_blank=True)
    plain_text_fields = ("city", "neighborhood")

    def validate(self, attrs):
        if (attrs.get("latitude") is None) ^ (attrs.get("longitude") is None):
            raise serializers.ValidationError("Latitude and longitude must be provided together.")
        return attrs



class ProfilePictureUploadSerializer(PlainTextSerializerMixin, serializers.ModelSerializer):
    MAX_UPLOAD_SIZE = 5 * 1024 * 1024
    plain_text_fields = ("alt_text",)

    class Meta:
        model = ProfilePicture
        fields = ["image", "is_primary", "position", "alt_text"]

    def validate_image(self, value):
        content_type = getattr(value, "content_type", "") or ""
        if value.size > self.MAX_UPLOAD_SIZE:
            raise serializers.ValidationError("Image size must be 5 MB or less.")

        if content_type == "image/svg+xml" or getattr(value, "name", "").lower().endswith(".svg"):
            raise serializers.ValidationError("SVG files are not allowed.")

        header = value.read(512)
        value.seek(0)
        if header.lstrip().startswith((b"MZ", b"ZM", b"ELF", b"PK")):
            raise serializers.ValidationError("Executable or archive files are not allowed.")
        if b"<svg" in header.lower() or b"<!doctype svg" in header.lower():
            raise serializers.ValidationError("SVG files are not allowed.")

        try:
            with Image.open(value) as image:
                image.verify()
        except (UnidentifiedImageError, OSError):
            value.seek(0)
            raise serializers.ValidationError("Only valid raster image uploads are allowed.")

        value.seek(0)
        return value

    def validate_alt_text(self, value):
        return ensure_plain_text(value, "alt_text")

    def validate(self, attrs):
        profile = self.context.get("profile")
        if profile and profile.pictures.count() >= 5:
            raise serializers.ValidationError({"image": "A profile can have at most 5 pictures."})
        return attrs


class ProfileActivitySerializer(serializers.Serializer):
    profile = ProfilePublicSerializer()
    timestamp = serializers.DateTimeField()
