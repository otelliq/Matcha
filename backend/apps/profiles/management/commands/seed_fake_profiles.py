from base64 import b64decode
from datetime import date
import random

from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone
from faker import Faker

from apps.accounts.models import User
from apps.profiles.models import Profile, ProfilePicture, ProfileTag, Tag


PLACEHOLDER_IMAGE = b64decode(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j1YkAAAAASUVORK5CYII="
)


class Command(BaseCommand):
    help = "Seed fixed test accounts plus 500+ random fake profiles for local testing."

    FIXED_TEST_PASSWORD = "TestPassword123!"
    FIXED_TEST_ACCOUNTS = [
        {
            "email": "test1@matcha.dev",
            "username": "test1",
            "first_name": "Liam",
            "last_name": "Stone",
            "gender": Profile.Gender.MAN,
            "sexual_preference": Profile.SexualPreference.HETEROSEXUAL,
            "age": 22,
            "city": "Paris",
            "neighborhood": "Le Marais",
            "latitude": 48.856613,
            "longitude": 2.352222,
            "tags": ["Hiking", "Coffee", "Cinema", "Travel"],
        },
        {
            "email": "test2@matcha.dev",
            "username": "test2",
            "first_name": "Emma",
            "last_name": "Roux",
            "gender": Profile.Gender.WOMAN,
            "sexual_preference": Profile.SexualPreference.HETEROSEXUAL,
            "age": 25,
            "city": "Lyon",
            "neighborhood": "Vieux Lyon",
            "latitude": 45.764042,
            "longitude": 4.835659,
            "tags": ["Coffee", "Yoga", "Travel", "Photography"],
        },
        {
            "email": "test3@matcha.dev",
            "username": "test3",
            "first_name": "Noah",
            "last_name": "Benoit",
            "gender": Profile.Gender.MAN,
            "sexual_preference": Profile.SexualPreference.HOMOSEXUAL,
            "age": 29,
            "city": "Marseille",
            "neighborhood": "Le Panier",
            "latitude": 43.296482,
            "longitude": 5.36978,
            "tags": ["Cinema", "Music", "Cooking", "Travel"],
        },
        {
            "email": "test4@matcha.dev",
            "username": "test4",
            "first_name": "Ava",
            "last_name": "Martin",
            "gender": Profile.Gender.WOMAN,
            "sexual_preference": Profile.SexualPreference.BISEXUAL,
            "age": 31,
            "city": "Bordeaux",
            "neighborhood": "Chartrons",
            "latitude": 44.837789,
            "longitude": -0.57918,
            "tags": ["Reading", "Wine", "Cooking", "Yoga"],
        },
        {
            "email": "test5@matcha.dev",
            "username": "test5",
            "first_name": "Mason",
            "last_name": "Petit",
            "gender": Profile.Gender.MAN,
            "sexual_preference": Profile.SexualPreference.PANSEXUAL,
            "age": 34,
            "city": "Toulouse",
            "neighborhood": "Capitole",
            "latitude": 43.604652,
            "longitude": 1.444209,
            "tags": ["Gaming", "Music", "Fitness", "Coffee"],
        },
        {
            "email": "test6@matcha.dev",
            "username": "test6",
            "first_name": "Sophia",
            "last_name": "Girard",
            "gender": Profile.Gender.WOMAN,
            "sexual_preference": Profile.SexualPreference.HOMOSEXUAL,
            "age": 27,
            "city": "Lille",
            "neighborhood": "Wazemmes",
            "latitude": 50.62925,
            "longitude": 3.057256,
            "tags": ["Art", "Photography", "Reading", "Travel"],
        },
        {
            "email": "test7@matcha.dev",
            "username": "test7",
            "first_name": "Ethan",
            "last_name": "Durand",
            "gender": Profile.Gender.MAN,
            "sexual_preference": Profile.SexualPreference.BISEXUAL,
            "age": 38,
            "city": "Nice",
            "neighborhood": "Old Town",
            "latitude": 43.710173,
            "longitude": 7.261953,
            "tags": ["Beach", "Fitness", "Cinema", "Cooking"],
        },
        {
            "email": "test8@matcha.dev",
            "username": "test8",
            "first_name": "Isabella",
            "last_name": "Moreau",
            "gender": Profile.Gender.WOMAN,
            "sexual_preference": Profile.SexualPreference.PANSEXUAL,
            "age": 41,
            "city": "Nantes",
            "neighborhood": "Bouffay",
            "latitude": 47.218371,
            "longitude": -1.553621,
            "tags": ["Music", "Hiking", "Art", "Coffee"],
        },
        {
            "email": "test9@matcha.dev",
            "username": "test9",
            "first_name": "Lucas",
            "last_name": "Lefevre",
            "gender": Profile.Gender.NON_BINARY,
            "sexual_preference": Profile.SexualPreference.BISEXUAL,
            "age": 24,
            "city": "Strasbourg",
            "neighborhood": "Petite France",
            "latitude": 48.573405,
            "longitude": 7.752111,
            "tags": ["Travel", "Gaming", "Music", "Photography"],
        },
        {
            "email": "test10@matcha.dev",
            "username": "test10",
            "first_name": "Mia",
            "last_name": "Andre",
            "gender": Profile.Gender.NON_BINARY,
            "sexual_preference": Profile.SexualPreference.PANSEXUAL,
            "age": 33,
            "city": "Montpellier",
            "neighborhood": "Ecusson",
            "latitude": 43.610769,
            "longitude": 3.876716,
            "tags": ["Yoga", "Beach", "Reading", "Art"],
        },
        {
            "email": "test11@matcha.dev",
            "username": "test11",
            "first_name": "Henry",
            "last_name": "Lambert",
            "gender": Profile.Gender.OTHER,
            "sexual_preference": Profile.SexualPreference.HETEROSEXUAL,
            "age": 45,
            "city": "Rennes",
            "neighborhood": "Centre",
            "latitude": 48.117266,
            "longitude": -1.677793,
            "tags": ["Wine", "Running", "Cooking", "Cinema"],
        },
        {
            "email": "test12@matcha.dev",
            "username": "test12",
            "first_name": "Chloe",
            "last_name": "Bernard",
            "gender": Profile.Gender.OTHER,
            "sexual_preference": Profile.SexualPreference.ASEXUAL,
            "age": 28,
            "city": "Grenoble",
            "neighborhood": "Championnet",
            "latitude": 45.188529,
            "longitude": 5.724524,
            "tags": ["Reading", "Hiking", "Photography", "Coffee"],
        },
    ]
    SHARED_TAG_POOL = [
        "Hiking",
        "Coffee",
        "Cinema",
        "Travel",
        "Yoga",
        "Photography",
        "Music",
        "Cooking",
        "Gaming",
        "Fitness",
        "Reading",
        "Wine",
        "Art",
        "Beach",
        "Running",
    ]

    def add_arguments(self, parser):
        parser.add_argument("--count", type=int, default=500)
        parser.add_argument("--seed", type=int, default=42)
        parser.add_argument("--with-pictures", action="store_true")
        parser.add_argument("--reset", action="store_true", help="Delete existing seeded and test data before reseeding.")

    def _age_to_birth_date(self, age: int) -> date:
        today = date.today()
        month = min(12, max(1, (age % 12) + 1))
        day = min(28, max(1, ((age * 2) % 28) + 1))
        return date(today.year - age, month, day)

    def _ensure_primary_picture(self, profile: Profile, image_name: str) -> None:
        if profile.pictures.exists():
            return

        picture = ProfilePicture(
            profile=profile,
            is_primary=True,
            position=1,
            alt_text=f"{profile.user.first_name} {profile.user.last_name}".strip(),
        )
        picture.image.save(image_name, ContentFile(PLACEHOLDER_IMAGE), save=True)

    def _ensure_tags(self, names: list[str]) -> dict[str, Tag]:
        tags: dict[str, Tag] = {}
        for name in names:
            slug = f"seed-{name.lower().replace(' ', '-')[:90]}"
            tags[name] = Tag.objects.get_or_create(name=name, defaults={"slug": slug})[0]
        return tags

    def _seed_fixed_test_accounts(self, tags_by_name: dict[str, Tag]) -> list[dict[str, str]]:
        summary_rows: list[dict[str, str]] = []
        verified_at = timezone.now()

        for account in self.FIXED_TEST_ACCOUNTS:
            user, created = User.objects.get_or_create(
                email=account["email"],
                defaults={
                    "username": account["username"],
                    "first_name": account["first_name"],
                    "last_name": account["last_name"],
                },
            )

            if not created:
                user.username = account["username"]
                user.first_name = account["first_name"]
                user.last_name = account["last_name"]

            user.set_password(self.FIXED_TEST_PASSWORD)
            user.email_verified_at = verified_at
            user.is_active = True
            user.save()

            profile, _ = Profile.objects.update_or_create(
                user=user,
                defaults={
                    "gender": account["gender"],
                    "sexual_preference": account["sexual_preference"],
                    "biography": f"Manual testing profile for {account['username']}.",
                    "date_of_birth": self._age_to_birth_date(account["age"]),
                    "latitude": account["latitude"],
                    "longitude": account["longitude"],
                    "city": account["city"],
                    "neighborhood": account["neighborhood"],
                    "location_source": Profile.LocationSource.MANUAL,
                    "fame_rating": random.randint(25, 95),
                    "last_seen_at": timezone.now(),
                },
            )

            profile.tags.set([tags_by_name[tag_name] for tag_name in account["tags"]])
            self._ensure_primary_picture(profile, f"{account['username']}.png")

            summary_rows.append(
                {
                    "email": account["email"],
                    "password": self.FIXED_TEST_PASSWORD,
                }
            )

        return summary_rows

    def _seed_random_profiles(self, fake: Faker, count: int, with_pictures: bool, tag_pool: list[Tag], seed: int) -> int:
        created_or_updated = 0
        for index in range(count):
            first_name = fake.first_name()
            last_name = fake.last_name()
            username = f"seed_user_{seed}_{index:04d}"
            email = f"seed_{seed}_{index:04d}@seed.matcha.dev"

            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    "username": username,
                    "first_name": first_name,
                    "last_name": last_name,
                },
            )

            if not created:
                user.username = username
                user.first_name = first_name
                user.last_name = last_name

            user.set_password("ChangeMe123!")
            user.email_verified_at = timezone.now()
            user.is_active = True
            user.save()

            profile, _ = Profile.objects.update_or_create(
                user=user,
                defaults={
                    "gender": random.choice([choice.value for choice in Profile.Gender]),
                    "sexual_preference": random.choice([choice.value for choice in Profile.SexualPreference]),
                    "biography": fake.paragraph(nb_sentences=5),
                    "date_of_birth": fake.date_of_birth(minimum_age=18, maximum_age=60),
                    "latitude": fake.latitude(),
                    "longitude": fake.longitude(),
                    "city": fake.city(),
                    "neighborhood": fake.word().title(),
                    "location_source": random.choice([choice.value for choice in Profile.LocationSource]),
                    "fame_rating": random.randint(0, 100),
                    "last_seen_at": fake.date_time_between(
                        start_date="-30d",
                        end_date="now",
                        tzinfo=timezone.get_current_timezone(),
                    ),
                },
            )

            selected_tags = random.sample(tag_pool, k=random.randint(3, 8))
            profile.tags.set(selected_tags)

            if with_pictures:
                self._ensure_primary_picture(profile, f"{username}.png")

            created_or_updated += 1

        return created_or_updated

    def _print_summary_table(self, rows: list[dict[str, str]]) -> None:
        email_width = max(len("Email"), max(len(row["email"]) for row in rows))
        password_width = max(len("Password"), max(len(row["password"]) for row in rows))
        separator = f"+-{'-' * email_width}-+-{'-' * password_width}-+"

        self.stdout.write("\nFixed test accounts (manual login):")
        self.stdout.write(separator)
        self.stdout.write(f"| {'Email'.ljust(email_width)} | {'Password'.ljust(password_width)} |")
        self.stdout.write(separator)
        for row in rows:
            self.stdout.write(f"| {row['email'].ljust(email_width)} | {row['password'].ljust(password_width)} |")
        self.stdout.write(separator)

    @transaction.atomic
    def handle(self, *args, **options):
        fake = Faker()
        Faker.seed(options["seed"])
        random.seed(options["seed"])

        count = max(500, options["count"])
        with_pictures = options["with_pictures"]
        reset = options["reset"]

        if reset:
            deleted_users, _ = User.objects.filter(is_superuser=False).delete()
            self.stdout.write(self.style.WARNING(f"Reset enabled: deleted {deleted_users} records tied to non-superusers."))

            deleted_seed_tags, _ = Tag.objects.filter(slug__startswith="seed-").delete()
            if deleted_seed_tags:
                self.stdout.write(self.style.WARNING(f"Reset enabled: deleted {deleted_seed_tags} seeded tags."))

        tags_by_name = self._ensure_tags(self.SHARED_TAG_POOL)
        fixed_summary = self._seed_fixed_test_accounts(tags_by_name)

        random_tag_pool = list(tags_by_name.values())
        for index in range(60):
            tag_name = f"SeedTag{index + 1:02d}"
            slug = f"seed-random-{index + 1:02d}"
            random_tag_pool.append(Tag.objects.get_or_create(name=tag_name, defaults={"slug": slug})[0])

        seeded_random_count = self._seed_random_profiles(
            fake=fake,
            count=count,
            with_pictures=with_pictures,
            tag_pool=random_tag_pool,
            seed=options["seed"],
        )

        total_profiles = Profile.objects.count()

        self.stdout.write(self.style.SUCCESS(f"Seeded {len(fixed_summary)} fixed test accounts."))
        self.stdout.write(self.style.SUCCESS(f"Seeded {seeded_random_count} random fake profiles."))
        self.stdout.write(self.style.SUCCESS(f"Total profiles in DB: {total_profiles}"))
        self._print_summary_table(fixed_summary)
