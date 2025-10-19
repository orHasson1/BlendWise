from rest_framework import permissions

class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of a blend to edit or delete it.
    """

    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions are only allowed to the creator of the blend.
        return obj.created_by == request.user
    
class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Custom permission:
    - Read-only for everyone
    - Write (POST/PUT/PATCH/DELETE) only for admin/staff users
    """

    def has_permission(self, request, view):
        # SAFE_METHODS = read-only methods
        if request.method in permissions.SAFE_METHODS:
            return True
        # Only staff/admin can write
        return request.user and request.user.is_staff