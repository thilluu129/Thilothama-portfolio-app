from rest_framework import permissions
from django.conf import settings

def _check_admin_passcode(request):
    expected_password = getattr(settings, 'PORTFOLIO_ADMIN_PASSWORD', 'admin123')
    
    # Check Django headers object (case-insensitive)
    header_val = request.headers.get('x-admin-password') or request.headers.get('X-Admin-Password')
    if header_val is None:
        # Fallback to WSGI META dictionary
        header_val = request.META.get('HTTP_X_ADMIN_PASSWORD')
        
    return header_val == expected_password


class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Custom permission to allow read-only access for any request,
    but require custom passcode header X-Admin-Password or admin session for modifying operations.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
            
        if request.user and request.user.is_authenticated and request.user.is_staff:
            return True
            
        return _check_admin_passcode(request)


class IsAdminUser(permissions.BasePermission):
    """
    Permission that requires the X-Admin-Password header for ALL methods
    (including GET). Used for sensitive data like contact messages.
    """
    def has_permission(self, request, view):
        if request.user and request.user.is_authenticated and request.user.is_staff:
            return True
        return _check_admin_passcode(request)
