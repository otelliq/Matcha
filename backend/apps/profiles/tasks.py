from celery import shared_task

from apps.profiles.models import Profile
from apps.profiles.services import refresh_profile_fame


@shared_task(name="apps.profiles.tasks.recalculate_profile_fame")
def recalculate_profile_fame(profile_id: int) -> None:
    profile = Profile.objects.select_related("user").prefetch_related("pictures", "tags").get(pk=profile_id)
    refresh_profile_fame(profile)


@shared_task(name="apps.profiles.tasks.recalculate_all_profile_fame_ratings")
def recalculate_all_profile_fame_ratings(batch_size: int = 500) -> int:
    processed = 0
    for profile in Profile.objects.select_related("user").prefetch_related("pictures", "tags").iterator(chunk_size=batch_size):
        refresh_profile_fame(profile)
        processed += 1
    return processed
