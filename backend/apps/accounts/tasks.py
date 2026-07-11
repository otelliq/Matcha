from celery import shared_task
from django.conf import settings
from django.core.mail import send_mail


@shared_task(name="apps.accounts.tasks.send_verification_email")
def send_verification_email(email: str, token: str) -> None:
    send_mail(
        subject="Matcha email verification",
        message=f"Verify your email here: {getattr(settings, 'API_PUBLIC_URL', 'http://localhost:8000')}/api/v1/auth/verify-email/{token}/",
        from_email=getattr(settings, "DEFAULT_FROM_EMAIL", "noreply@matcha.local"),
        recipient_list=[email],
        fail_silently=True,
    )


@shared_task(name="apps.accounts.tasks.send_password_reset_email")
def send_password_reset_email(email: str, token: str) -> None:
    send_mail(
        subject="Matcha password reset",
        message=f"Use this reset token: {token}",
        from_email=getattr(settings, "DEFAULT_FROM_EMAIL", "noreply@matcha.local"),
        recipient_list=[email],
        fail_silently=True,
    )
