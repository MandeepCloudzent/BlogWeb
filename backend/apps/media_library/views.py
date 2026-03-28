from rest_framework import generics, permissions, parsers
from .models import MediaFile
from .serializers import MediaFileSerializer


class MediaUploadView(generics.CreateAPIView):
    """POST /api/media/upload/ — Upload a file."""
    serializer_class = MediaFileSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser]

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)


class MediaListView(generics.ListAPIView):
    """GET /api/media/files/ — List current user's uploaded files."""
    serializer_class = MediaFileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return MediaFile.objects.filter(uploaded_by=self.request.user)


class MediaDeleteView(generics.DestroyAPIView):
    """DELETE /api/media/files/<id>/ — Delete an uploaded file (owner only)."""
    serializer_class = MediaFileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return MediaFile.objects.filter(uploaded_by=self.request.user)
