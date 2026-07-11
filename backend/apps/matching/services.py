from __future__ import annotations

from dataclasses import dataclass
from datetime import date
from decimal import Decimal
from math import asin, cos, radians, sin, sqrt

from apps.core.permissions import users_are_blocked
from apps.profiles.models import Profile


@dataclass(slots=True)
class CandidateMatch:
    profile: Profile
    shared_tags_count: int
    distance_km: Decimal | None
    same_area: bool
    match_score: Decimal


def age_from_birthdate(birthdate: date | None) -> int | None:
    if birthdate is None:
        return None
    today = date.today()
    return today.year - birthdate.year - ((today.month, today.day) < (birthdate.month, birthdate.day))


def haversine_km(lat1, lon1, lat2, lon2) -> Decimal:
    radius = Decimal("6371")
    lat1_rad = radians(float(lat1))
    lon1_rad = radians(float(lon1))
    lat2_rad = radians(float(lat2))
    lon2_rad = radians(float(lon2))
    dlat = lat2_rad - lat1_rad
    dlon = lon2_rad - lon1_rad
    a = sin(dlat / 2) ** 2 + cos(lat1_rad) * cos(lat2_rad) * sin(dlon / 2) ** 2
    return radius * Decimal(str(2 * asin(sqrt(a))))


def gender_allows(preference: str, own_gender: str, target_gender: str) -> bool:
    if preference in {"bisexual", "pansexual", "unset", "asexual"}:
        return True
    if own_gender not in {"man", "woman"} or target_gender not in {"man", "woman"}:
        return True
    if preference == "heterosexual":
        return own_gender != target_gender
    if preference == "homosexual":
        return own_gender == target_gender
    return True


def profiles_are_compatible(viewer: Profile, candidate: Profile) -> bool:
    viewer_preference = viewer.sexual_preference or "bisexual"
    candidate_preference = candidate.sexual_preference or "bisexual"
    viewer_gender = viewer.gender or "unset"
    candidate_gender = candidate.gender or "unset"
    return gender_allows(viewer_preference, viewer_gender, candidate_gender) and gender_allows(candidate_preference, candidate_gender, viewer_gender)


def is_same_area(viewer: Profile, candidate: Profile) -> bool:
    if viewer.city and candidate.city and viewer.city.lower() == candidate.city.lower():
        return True
    if viewer.neighborhood and candidate.neighborhood and viewer.neighborhood.lower() == candidate.neighborhood.lower():
        return True
    return False


def compute_distance(viewer: Profile, candidate: Profile) -> Decimal | None:
    if viewer.latitude is None or viewer.longitude is None or candidate.latitude is None or candidate.longitude is None:
        return None
    return haversine_km(viewer.latitude, viewer.longitude, candidate.latitude, candidate.longitude)


def compute_match_score(viewer: Profile, candidate: Profile, shared_tags_count: int, distance_km: Decimal | None, same_area: bool) -> Decimal:
    shared_tag_score = min(Decimal(shared_tags_count) / Decimal("8"), Decimal("1"))
    fame_score = Decimal(candidate.fame_rating or 0) / Decimal("100")
    distance_score = Decimal("1") if distance_km is None else max(Decimal("0"), Decimal("1") - min(distance_km, Decimal("100")) / Decimal("100"))
    area_bonus = Decimal("1") if same_area else Decimal("0")
    return (shared_tag_score * Decimal("30") + fame_score * Decimal("35") + distance_score * Decimal("25") + area_bonus * Decimal("10")).quantize(Decimal("0.01"))


def candidate_matches(viewer: Profile, queryset) -> list[CandidateMatch]:
    matches: list[CandidateMatch] = []
    viewer_tag_ids = set(viewer.tags.values_list("id", flat=True))
    for candidate in queryset:
        if candidate.user_id == viewer.user_id:
            continue
        if users_are_blocked(viewer.user, candidate.user):
            continue
        if not profiles_are_compatible(viewer, candidate):
            continue
        candidate_tag_ids = set(candidate.tags.values_list("id", flat=True))
        shared_tags = len(viewer_tag_ids & candidate_tag_ids)
        distance_km = compute_distance(viewer, candidate)
        same_area = is_same_area(viewer, candidate)
        score = compute_match_score(viewer, candidate, shared_tags, distance_km, same_area)
        matches.append(CandidateMatch(candidate, shared_tags, distance_km, same_area, score))
    return matches