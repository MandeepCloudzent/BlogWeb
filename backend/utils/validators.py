from rest_framework import serializers
from PIL import Image


def validate_image_file(file):
    """Validate uploaded image files."""
    max_size = 5 * 1024 * 1024  # 5MB
    allowed_types = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

    if file.size > max_size:
        raise serializers.ValidationError('File size must be under 5MB.')

    if file.content_type not in allowed_types:
        raise serializers.ValidationError(
            f'Unsupported file type. Allowed: {", ".join(allowed_types)}'
        )

    return file
