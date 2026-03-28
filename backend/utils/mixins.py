from rest_framework.response import Response
from rest_framework import status


class CreatedResponseMixin:
    """Mixin to return 201 on create."""

    def perform_create_with_response(self, serializer):
        instance = serializer.save()
        return Response(
            self.get_serializer(instance).data,
            status=status.HTTP_201_CREATED,
        )
