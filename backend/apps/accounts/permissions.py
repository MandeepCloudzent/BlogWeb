from rest_framework import permissions


class IsOwnerOrReadOnly(permissions.BasePermission):
    """Allow owners to edit, everyone else read-only."""

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj == request.user or (hasattr(obj, 'user') and obj.user == request.user)


class IsAdminUser(permissions.BasePermission):
    """Allow only staff/admin users."""

    def has_permission(self, request, view):
        return request.user and request.user.is_staff
