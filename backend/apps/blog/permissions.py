from rest_framework import permissions


class IsAuthorOrReadOnly(permissions.BasePermission):
    """Allow post authors to edit/delete, everyone else read-only."""

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.author == request.user


class IsCommentAuthorOrAdmin(permissions.BasePermission):
    """Allow comment author or admin to delete."""

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.author == request.user or request.user.is_staff
