from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models


class Tag(models.Model):
    name = models.CharField(max_length=80, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "profiles_tag"
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name


class Profile(models.Model):
    class Gender(models.TextChoices):
        MAN = "man", "Man"
        WOMAN = "woman", "Woman"
        NON_BINARY = "non_binary", "Non-binary"
        OTHER = "other", "Other"
        UNSET = "unset", "Unset"

    class SexualPreference(models.TextChoices):
        HETEROSEXUAL = "heterosexual", "Heterosexual"
        HOMOSEXUAL = "homosexual", "Homosexual"
        BISEXUAL = "bisexual", "Bisexual"
        PANSEXUAL = "pansexual", "Pansexual"
        ASEXUAL = "asexual", "Asexual"
        UNSET = "unset", "Unset"

    class LocationSource(models.TextChoices):
        GPS = "gps", "GPS"
        MANUAL = "manual", "Manual"
        MIXED = "mixed", "Mixed"

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="profile")
    gender = models.CharField(max_length=32, choices=Gender.choices, default=Gender.UNSET)
    sexual_preference = models.CharField(
        max_length=32,
        choices=SexualPreference.choices,
        default=SexualPreference.BISEXUAL,
    )
    biography = models.TextField(blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    city = models.CharField(max_length=120, blank=True)
    neighborhood = models.CharField(max_length=120, blank=True)
    location_source = models.CharField(max_length=16, choices=LocationSource.choices, default=LocationSource.MANUAL)
    fame_rating = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    fame_rating_components = models.JSONField(default=dict, blank=True)
    fame_rating_recalculated_at = models.DateTimeField(null=True, blank=True)
    last_seen_at = models.DateTimeField(null=True, blank=True)
    tags = models.ManyToManyField(Tag, through="ProfileTag", related_name="profiles")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "profiles_profile"
        ordering = ["-updated_at"]

    def clean(self):
        super().clean()
        has_latitude = self.latitude is not None
        has_longitude = self.longitude is not None
        if has_latitude != has_longitude:
            raise ValidationError("Latitude and longitude must be provided together.")


class ProfileTag(models.Model):
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE)
    tag = models.ForeignKey(Tag, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "profiles_profile_tag"
        constraints = [
            models.UniqueConstraint(fields=["profile", "tag"], name="unique_profile_tag"),
        ]


class ProfilePicture(models.Model):
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name="pictures")
    image = models.ImageField(upload_to="profiles/pictures/")
    is_primary = models.BooleanField(default=False)
    position = models.PositiveSmallIntegerField(default=1)
    alt_text = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "profiles_profile_picture"
        constraints = [
            models.UniqueConstraint(fields=["profile", "position"], name="unique_profile_picture_position"),
            models.UniqueConstraint(
                fields=["profile"],
                condition=models.Q(is_primary=True),
                name="unique_primary_picture_per_profile",
            ),
        ]
        ordering = ["position", "created_at"]

    def clean(self):
        super().clean()
        if self.profile_id and not self.pk:
            existing_count = ProfilePicture.objects.filter(profile=self.profile).count()
            if existing_count >= 5:
                raise ValidationError("A profile can have at most 5 pictures.")
