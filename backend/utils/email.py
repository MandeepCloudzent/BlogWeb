from django.core.mail import send_mail
from django.conf import settings


def send_notification_email(subject, message, recipient_list=None):
    """Utility to send notification emails."""
    if recipient_list is None:
        recipient_list = [settings.EMAIL_HOST_USER]

    send_mail(
        subject=subject,
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=recipient_list,
        fail_silently=True,
    )
