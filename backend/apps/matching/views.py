from decimal import Decimal

from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.pagination import StandardLimitOffsetPagination
from apps.core.query import extract_filter_params, normalize_multi_value
from apps.matching.serializers import CandidateProfileSerializer, SearchFilterSerializer
from apps.matching.services import age_from_birthdate, candidate_matches, compute_distance
from apps.profiles.models import Profile, Tag


def _get_profile(user) -> Profile:
    profile, _ = Profile.objects.get_or_create(user=user)
    return profile


def _apply_filters(viewer: Profile, queryset, filters: dict) -> list:
    tags = normalize_multi_value(filters.get("tags"))
    tag_ids = []
    if tags:
        tag_ids = list(Tag.objects.filter(name__in=tags).values_list("id", flat=True))
        if not tag_ids:
            tag_ids = list(Tag.objects.filter(slug__in=[tag.lower() for tag in tags]).values_list("id", flat=True))

    candidates = []
    for profile in queryset:
        age = age_from_birthdate(profile.date_of_birth)
        if filters.get("age_min") and (age is None or age < int(filters["age_min"])):
            continue
        if filters.get("age_max") and (age is None or age > int(filters["age_max"])):
            continue
        if filters.get("fame_min") is not None and Decimal(str(profile.fame_rating)) < Decimal(str(filters["fame_min"])):
            continue
        if filters.get("fame_max") is not None and Decimal(str(profile.fame_rating)) > Decimal(str(filters["fame_max"])):
            continue
        if filters.get("city") and (not profile.city or profile.city.lower() != str(filters["city"]).lower()):
            continue
        if filters.get("neighborhood") and (not profile.neighborhood or profile.neighborhood.lower() != str(filters["neighborhood"]).lower()):
            continue
        if tag_ids and not profile.tags.filter(id__in=tag_ids).exists():
            continue
        latitude = filters.get("latitude")
        longitude = filters.get("longitude")
        radius_km = filters.get("radius_km")
        if latitude is not None and longitude is not None:
            distance = compute_distance(viewer, profile)
            if radius_km is not None and distance is not None and distance > Decimal(str(radius_km)):
                continue
        candidates.append(profile)
    return candidates


def _sort_matches(matches, sort_value: str):
    if sort_value == "fame":
        return sorted(matches, key=lambda match: (match.profile.fame_rating or 0, match.same_area, match.shared_tags_count), reverse=True)
    if sort_value == "recent":
        return sorted(matches, key=lambda match: match.profile.updated_at, reverse=True)
    if sort_value == "shared_tags":
        return sorted(matches, key=lambda match: (match.shared_tags_count, match.same_area, match.profile.fame_rating or 0), reverse=True)
    if sort_value == "same_area":
        return sorted(matches, key=lambda match: (match.same_area, match.match_score), reverse=True)
    return sorted(matches, key=lambda match: (match.distance_km is None, match.distance_km or Decimal("999999"), -match.match_score))


class SuggestionListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        viewer = _get_profile(request.user)
        raw_filters = extract_filter_params(request.query_params, ["age_min", "age_max", "fame_min", "fame_max", "city", "neighborhood", "tags", "latitude", "longitude", "radius_km"])
        serializer = SearchFilterSerializer(data={**raw_filters, "sort": request.query_params.get("sort", "same_area")})
        serializer.is_valid(raise_exception=True)
        queryset = Profile.objects.select_related("user").prefetch_related("tags", "pictures").exclude(user=request.user)
        candidates = _apply_filters(viewer, queryset, serializer.validated_data)
        matches = _sort_matches(candidate_matches(viewer, candidates), serializer.validated_data["sort"])
        paginator = StandardLimitOffsetPagination()
        page = paginator.paginate_queryset(matches, request, view=self)
        payload = []
        for match in page:
            payload.append({**CandidateProfileSerializer(match.profile).data, "shared_tags_count": match.shared_tags_count, "distance_km": match.distance_km, "same_area": match.same_area, "match_score": match.match_score})
        return paginator.get_paginated_response(payload)


class SearchListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        viewer = _get_profile(request.user)
        raw_filters = extract_filter_params(request.query_params, ["age_min", "age_max", "fame_min", "fame_max", "city", "neighborhood", "tags", "latitude", "longitude", "radius_km"])
        serializer = SearchFilterSerializer(data={**raw_filters, "sort": request.query_params.get("sort", "distance")})
        serializer.is_valid(raise_exception=True)
        queryset = Profile.objects.select_related("user").prefetch_related("tags", "pictures").exclude(user=request.user)
        candidates = _apply_filters(viewer, queryset, serializer.validated_data)
        matches = _sort_matches(candidate_matches(viewer, candidates), serializer.validated_data["sort"])
        paginator = StandardLimitOffsetPagination()
        page = paginator.paginate_queryset(matches, request, view=self)
        payload = []
        for match in page:
            payload.append({**CandidateProfileSerializer(match.profile).data, "shared_tags_count": match.shared_tags_count, "distance_km": match.distance_km, "same_area": match.same_area, "match_score": match.match_score})
        return paginator.get_paginated_response(payload)
