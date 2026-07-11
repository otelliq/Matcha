from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models


class Like(models.Model):
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="sent_likes")
    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="received_likes")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "interactions_like"
        constraints = [
            models.UniqueConstraint(fields=["sender", "recipient"], name="unique_like_pair"),
            models.CheckConstraint(check=~models.Q(sender=models.F("recipient")), name="like_not_self"),
        ]
        ordering = ["-created_at"]

    def clean(self):
        super().clean()
        if self.sender_id and self.recipient_id and self.sender_id == self.recipient_id:
            raise ValidationError({"recipient": "You cannot like your own profile."})


class Connection(models.Model):
    user_low = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="connections_as_low")
    user_high = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="connections_as_high")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    closed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "interactions_connection"
        constraints = [
            models.UniqueConstraint(fields=["user_low", "user_high"], name="unique_connection_pair"),
            models.CheckConstraint(check=~models.Q(user_low=models.F("user_high")), name="connection_not_self"),
        ]
        ordering = ["-created_at"]

    def clean(self):
        super().clean()
        if self.user_low_id and self.user_high_id and self.user_low_id == self.user_high_id:
            raise ValidationError("A connection cannot contain the same user twice.")


class Block(models.Model):
    blocker = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="blocks_made")
    blocked = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="blocks_received")
    reason = models.CharField(max_length=255, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "interactions_block"
        constraints = [
            models.UniqueConstraint(fields=["blocker", "blocked"], name="unique_block_pair"),
            models.CheckConstraint(check=~models.Q(blocker=models.F("blocked")), name="block_not_self"),
        ]
        ordering = ["-created_at"]

    def clean(self):
        super().clean()
        if self.blocker_id and self.blocked_id and self.blocker_id == self.blocked_id:
            raise ValidationError({"blocked": "You cannot block your own account."})


class Report(models.Model):
    class Reason(models.TextChoices):
        FAKE_PROFILE = "fake_profile", "Fake profile"
        HARASSMENT = "harassment", "Harassment"
        SPAM = "spam", "Spam"
        OTHER = "other", "Other"

    reporter = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="reports_made")
    reported = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="reports_received")
    reason = models.CharField(max_length=32, choices=Reason.choices)
    details = models.TextField(blank=True)
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="reports_reviewed",
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "interactions_report"
        constraints = [
            models.CheckConstraint(check=~models.Q(reporter=models.F("reported")), name="report_not_self"),
        ]
        ordering = ["-created_at"]

    def clean(self):
        super().clean()
        if self.reporter_id and self.reported_id and self.reporter_id == self.reported_id:
            raise ValidationError({"reported": "You cannot report your own account."})


class ProfileView(models.Model):
    viewer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="profile_views_made")
    viewed_profile = models.ForeignKey("profiles.Profile", on_delete=models.CASCADE, related_name="profile_views_received")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "interactions_profile_view"
        ordering = ["-created_at"]
