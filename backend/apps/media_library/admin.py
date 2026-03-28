from django.contrib import admin
from .models import MediaFile


@admin.register(MediaFile)
class MediaFileAdmin(admin.ModelAdmin):
    list_display = ('file', 'uploaded_by', 'file_type', 'file_size', 'uploaded_at')
    list_filter = ('file_type',)
    raw_id_fields = ('uploaded_by',)
