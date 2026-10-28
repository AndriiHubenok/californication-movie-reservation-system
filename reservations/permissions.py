from rest_framework import permissions

class IsAdminAndReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):

        if request.method in permissions.SAFE_METHODS and request.user.is_staff:
            return True

        return False

class IsStaff(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_staff