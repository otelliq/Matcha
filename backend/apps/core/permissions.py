from django.db.models import Q
from rest_framework.permissions import BasePermission, SAFE_METHODS

from apps.interactions.models import Block, Connection


def users_are_blocked(user_a, user_b) -> bool:
    if not user_a or not user_b or not user_a.is_authenticated or not user_b.is_authenticated:
        return False
    return Block.objects.filter(
        Q(blocker=user_a, blocked=user_b, is_active=True) | Q(blocker=user_b, blocked=user_a, is_active=True)
    ).exists()


class IsSelfOrReadOnly(BasePermission):
    message = "You can only modify your own resource."

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        owner = getattr(obj, "user", obj)
        return request.user.is_authenticated and owner == request.user


class CanAccessPublicProfile(BasePermission):
    message = "This profile is not available."

    def has_object_permission(self, request, view, obj):
        profile_user = getattr(obj, "user", None)
        return bool(profile_user and request.user.is_authenticated and not users_are_blocked(request.user, profile_user))


class CanInteractWithTargetUser(BasePermission):
    message = "You cannot interact with this user."

    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False
        target_user = getattr(obj, "user", obj)
        return target_user is not None and not users_are_blocked(request.user, target_user)


class CanMessageConnection(BasePermission):
    message = "You are not allowed to access this conversation."

    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False
        if isinstance(obj, Connection):
            return obj.is_active and request.user in {obj.user_low, obj.user_high}
        return False
