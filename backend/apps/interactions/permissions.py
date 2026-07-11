from rest_framework.permissions import IsAuthenticated

from apps.core.permissions import CanInteractWithTargetUser


class CanActOnTargetUser(CanInteractWithTargetUser):
    pass


class CanViewOwnConnections(IsAuthenticated):
    pass
