import re

from rest_framework import serializers

HTML_PATTERN = re.compile(r"<[^>]+>")
SCRIPT_PATTERN = re.compile(r"<\s*script", re.IGNORECASE)


def ensure_plain_text(value: str, field_name: str) -> str:
    if value is None:
        return value
    if HTML_PATTERN.search(value) or SCRIPT_PATTERN.search(value):
        raise serializers.ValidationError({field_name: "HTML and JavaScript are not allowed."})
    return value


class PlainTextSerializerMixin(serializers.Serializer):
    plain_text_fields: tuple[str, ...] = ()

    def validate(self, attrs):
        for field_name in self.plain_text_fields:
            if field_name in attrs and isinstance(attrs[field_name], str):
                attrs[field_name] = ensure_plain_text(attrs[field_name], field_name)
        return super().validate(attrs)
