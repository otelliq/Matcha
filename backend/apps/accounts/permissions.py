from rest_framework.permissions import AllowAny, BasePermission


class AuthEndpointPermission(AllowAny):
    pass


class IsAuthenticatedAccount(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)
