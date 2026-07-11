from decimal import Decimal
from django.db.models import Count, Q
from django.utils import timezone

from apps.chat.models import Message
from apps.interactions.models import Block, Connection, Like, Report
from apps.profiles.models import Profile

FAME_MAX = Decimal("100")


def _clamp(value: Decimal) -> Decimal:
    if value < 0:
        return Decimal("0")
    if value > FAME_MAX:
        return FAME_MAX
    return value.quantize(Decimal("0.01"))


def _normalized(value: int, ceiling: int) -> Decimal:
    if ceiling <= 0:
        return Decimal("0")
    return min(Decimal(value) / Decimal(ceiling), Decimal("1"))


def calculate_fame_components(profile: Profile) -> dict[str, Decimal]:
    user = profile.user
    active_connections = Connection.objects.filter(
        is_active=True,
    ).filter(Q(user_low=user) | Q(user_high=user)).count()
    active_likes_received = Like.objects.filter(recipient=user, is_active=True).count()
    picture_count = profile.pictures.count()
    tag_count = profile.tags.count()
    biography_score = Decimal("1") if profile.biography.strip() else Decimal("0")
    location_score = Decimal("1") if profile.city or profile.neighborhood or profile.latitude is not None else Decimal("0")
    picture_score = _normalized(picture_count, 5)
    tag_score = _normalized(tag_count, 8)
    completeness_score = min(
        Decimal("1"),
        (biography_score + location_score + picture_score + tag_score) / Decimal("4"),
    )

    sent_messages = Message.objects.filter(sender=user).count()
    replied_messages = Message.objects.filter(connection__is_active=True, read_at__isnull=False).filter(
        connection__user_low=user
    ).count() + Message.objects.filter(connection__is_active=True, read_at__isnull=False).filter(
        connection__user_high=user
    ).count()
    response_score = Decimal("0") if sent_messages == 0 else min(Decimal(replied_messages) / Decimal(sent_messages), Decimal("1"))

    active_blocks = Block.objects.filter(blocked=user, is_active=True).count() + Block.objects.filter(
        blocker=user, is_active=True
    ).count()
    validated_reports = Report.objects.filter(reported=user, reviewed_at__isnull=False, reviewed_by__isnull=False).count()
    safety_penalty = min(Decimal(active_blocks) * Decimal("0.10") + Decimal(validated_reports) * Decimal("0.15"), Decimal("1"))
    safety_score = max(Decimal("0"), Decimal("1") - safety_penalty)

    return {
        "connections": _normalized(active_connections, 20),
        "likes_received": _normalized(active_likes_received, 50),
        "profile_completeness": completeness_score,
        "message_response": response_score,
        "safety": safety_score,
    }


def calculate_fame_rating(profile: Profile) -> tuple[Decimal, dict[str, Decimal]]:
    components = calculate_fame_components(profile)
    score = (
        Decimal("30") * components["connections"]
        + Decimal("25") * components["likes_received"]
        + Decimal("20") * components["profile_completeness"]
        + Decimal("10") * components["message_response"]
        + Decimal("15") * components["safety"]
    )
    return _clamp(score), components


def refresh_profile_fame(profile: Profile) -> Profile:
    fame_rating, components = calculate_fame_rating(profile)
    profile.fame_rating = fame_rating
    profile.fame_rating_components = components
    profile.fame_rating_recalculated_at = timezone.now()
    profile.save(update_fields=["fame_rating", "fame_rating_components", "fame_rating_recalculated_at", "updated_at"])
    return profile
