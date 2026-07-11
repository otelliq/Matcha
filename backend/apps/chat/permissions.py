from rest_framework.permissions import IsAuthenticated

from apps.core.permissions import CanMessageConnection


class CanAccessChatConnection(CanMessageConnection):
    pass


class CanUseChat(IsAuthenticated):
    pass
