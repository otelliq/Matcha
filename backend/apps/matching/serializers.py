from rest_framework import serializers

from apps.profiles.serializers import ProfilePublicSerializer


class SearchFilterSerializer(serializers.Serializer):
    age_min = serializers.IntegerField(required=False, min_value=18)
    age_max = serializers.IntegerField(required=False, min_value=18)
    fame_min = serializers.DecimalField(required=False, max_digits=5, decimal_places=2, min_value=0, max_value=100)
    fame_max = serializers.DecimalField(required=False, max_digits=5, decimal_places=2, min_value=0, max_value=100)
    city = serializers.CharField(required=False, allow_blank=True)
    neighborhood = serializers.CharField(required=False, allow_blank=True)
    latitude = serializers.DecimalField(required=False, max_digits=9, decimal_places=6)
    longitude = serializers.DecimalField(required=False, max_digits=9, decimal_places=6)
    radius_km = serializers.DecimalField(required=False, max_digits=8, decimal_places=2, min_value=0)
    tags = serializers.ListField(child=serializers.CharField(), required=False)
    sort = serializers.ChoiceField(
        choices=["distance", "fame", "recent", "shared_tags", "same_area"],
        required=False,
        default="distance",
    )

    def validate(self, attrs):
        if attrs.get("age_min") and attrs.get("age_max") and attrs["age_min"] > attrs["age_max"]:
            raise serializers.ValidationError({"age_max": "age_max must be greater than or equal to age_min."})
        if attrs.get("fame_min") and attrs.get("fame_max") and attrs["fame_min"] > attrs["fame_max"]:
            raise serializers.ValidationError({"fame_max": "fame_max must be greater than or equal to fame_min."})
        if (attrs.get("latitude") is None) ^ (attrs.get("longitude") is None):
            raise serializers.ValidationError({"longitude": "latitude and longitude must be provided together."})
        return attrs


class CandidateProfileSerializer(ProfilePublicSerializer):
    shared_tags_count = serializers.IntegerField(read_only=True)
    distance_km = serializers.DecimalField(max_digits=8, decimal_places=2, read_only=True, allow_null=True)
    same_area = serializers.BooleanField(read_only=True)
    match_score = serializers.DecimalField(max_digits=8, decimal_places=2, read_only=True)
