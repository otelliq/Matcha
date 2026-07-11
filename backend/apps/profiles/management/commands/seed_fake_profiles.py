from base64 import b64decode
from datetime import date
import random

from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand
from django.db import transaction
from faker import Faker

from apps.accounts.models import User
from apps.profiles.models import Profile, ProfilePicture, ProfileTag, Tag


PLACEHOLDER_IMAGE = b64decode(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j1YkAAAAASUVORK5CYII="
)


class Command(BaseCommand):
    help = "Seed 500+ fake profiles for local testing."

    def add_arguments(self, parser):
        parser.add_argument("--count", type=int, default=500)
        parser.add_argument("--seed", type=int, default=42)
        parser.add_argument("--with-pictures", action="store_true")

    @transaction.atomic
    def handle(self, *args, **options):
        fake = Faker()
        Faker.seed(options["seed"])
        random.seed(options["seed"])

        count = max(500, options["count"])
        with_pictures = options["with_pictures"]

        tag_pool = []
        for _ in range(60):
            tag_name = fake.unique.word().title()
            tag_pool.append(Tag.objects.get_or_create(name=tag_name, defaults={"slug": tag_name.lower()})[0])

        created = 0
        for index in range(count):
            first_name = fake.first_name()
            last_name = fake.last_name()
            username = f"{fake.user_name()}_{index}"
            email = fake.unique.email()

            user = User.objects.create_user(
                email=email,
                password="ChangeMe123!",
                username=username,
                first_name=first_name,
                last_name=last_name,
            )

            profile = Profile.objects.create(
                user=user,
                gender=random.choice([choice.value for choice in Profile.Gender]),
                sexual_preference=random.choice([choice.value for choice in Profile.SexualPreference]),
                biography=fake.paragraph(nb_sentences=5),
                date_of_birth=fake.date_of_birth(minimum_age=18, maximum_age=45),
                latitude=fake.latitude(),
                longitude=fake.longitude(),
                city=fake.city(),
                neighborhood=fake.word().title(),
                location_source=random.choice([choice.value for choice in Profile.LocationSource]),
                fame_rating=random.randint(0, 100),
                last_seen_at=fake.date_time_between(start_date="-30d", end_date="now"),
            )

            selected_tags = random.sample(tag_pool, k=random.randint(3, 8))
            profile.tags.add(*selected_tags)

            if with_pictures:
                picture = ProfilePicture(
                    profile=profile,
                    is_primary=True,
                    position=1,
                    alt_text=f"{first_name} {last_name}",
                )
                picture.image.save(
                    f"{username}.png",
                    ContentFile(PLACEHOLDER_IMAGE),
                    save=True,
                )

            created += 1

        self.stdout.write(self.style.SUCCESS(f"Created {created} fake profiles."))
