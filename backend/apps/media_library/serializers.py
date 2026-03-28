from rest_framework import serializers
from .models import MediaFile


class MediaFileSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()

    class Meta:
        model = MediaFile
        fields = ('id', 'file', 'url', 'alt_text', 'file_type', 'file_size', 'uploaded_at')
        read_only_fields = ('id', 'file_size', 'uploaded_at')

    def get_url(self, obj):
        request = self.context.get('request')
        if request and obj.file:
            return request.build_absolute_uri(obj.file.url)
        return None
