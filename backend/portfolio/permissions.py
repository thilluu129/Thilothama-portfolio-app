from rest_framework import permissions
from django.conf import settings

class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Custom permission to allow read-only access for any request,
    but require custom passcode header X-Admin-Password or admin session for modifying operations.
    """
    def has_permission(self, request, view):
        # Safe methods (GET, HEAD, OPTIONS) are allowed for anyone
        if request.method in permissions.SAFE_METHODS:
            return True
            
        # Check standard admin session auth (if logged in via admin panel)
        if request.user and request.user.is_authenticated and request.user.is_staff:
            return True
            
        # Check custom passcode header X-Admin-Password
        admin_password = getattr(settings, 'PORTFOLIO_ADMIN_PASSWORD', 'admin123')
        return request.headers.get('X-Admin-Password') == admin_password


class IsAdminUser(permissions.BasePermission):
    """
    Permission that requires the X-Admin-Password header for ALL methods
    (including GET). Used for sensitive data like contact messages.
    """
    def has_permission(self, request, view):
        if request.user and request.user.is_authenticated and request.user.is_staff:
            return True
        admin_password = getattr(settings, 'PORTFOLIO_ADMIN_PASSWORD', 'admin123')
        return request.headers.get('X-Admin-Password') == admin_password
