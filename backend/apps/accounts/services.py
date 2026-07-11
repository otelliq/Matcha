from datetime import timedelta
import secrets

from django.utils import timezone

from apps.accounts.models import EmailVerificationToken, PasswordResetToken, User


def _new_token_value() -> str:
    return secrets.token_urlsafe(48)


def create_email_verification_token(user: User) -> EmailVerificationToken:
    token, _ = EmailVerificationToken.objects.update_or_create(
        user=user,
        defaults={
            "token": _new_token_value(),
            "expires_at": timezone.now() + timedelta(days=2),
            "consumed_at": None,
        },
    )
    return token


def consume_email_verification_token(token_value: str) -> EmailVerificationToken | None:
    verification = EmailVerificationToken.objects.select_related("user").filter(token=token_value, consumed_at__isnull=True).first()
    if verification is None or verification.is_expired():
        return None
    verification.user.email_verified_at = timezone.now()
    verification.user.save(update_fields=["email_verified_at", "updated_at"])
    verification.consumed_at = timezone.now()
    verification.save(update_fields=["consumed_at"])
    return verification


def create_password_reset_token(user: User) -> PasswordResetToken:
    return PasswordResetToken.objects.create(
        user=user,
        token=_new_token_value(),
        expires_at=timezone.now() + timedelta(hours=2),
    )


def consume_password_reset_token(token_value: str) -> PasswordResetToken | None:
    reset = PasswordResetToken.objects.select_related("user").filter(token=token_value, consumed_at__isnull=True).first()
    if reset is None or reset.is_expired():
        return None
    reset.consumed_at = timezone.now()
    reset.save(update_fields=["consumed_at"])
    return reset
