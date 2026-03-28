from rest_framework import generics, permissions
from django.core.mail import send_mail
from django.conf import settings as django_settings
from .models import ContactMessage
from .serializers import ContactMessageSerializer, ContactMessageAdminSerializer


class ContactCreateView(generics.CreateAPIView):
    """POST /api/contact/ — Submit a contact message (public)."""
    serializer_class = ContactMessageSerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        user = self.request.user if self.request.user.is_authenticated else None
        msg = serializer.save(user=user)

        # Optional: send email notification to admin
        try:
            send_mail(
                subject=f'[Blog Platform] New Contact: {msg.subject}',
                message=f'From: {msg.name} ({msg.email})\n\n{msg.message}',
                from_email=django_settings.DEFAULT_FROM_EMAIL,
                recipient_list=[django_settings.EMAIL_HOST_USER],
                fail_silently=True,
            )
        except Exception:
            pass


class ContactMessageListView(generics.ListAPIView):
    """GET /api/contact/messages/ — List all messages (admin only)."""
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageAdminSerializer
    permission_classes = [permissions.IsAdminUser]


class ContactMessageDetailView(generics.RetrieveUpdateDestroyAPIView):
    """GET/PATCH/DELETE /api/contact/messages/<id>/ — Manage a message (admin only)."""
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageAdminSerializer
    permission_classes = [permissions.IsAdminUser]
