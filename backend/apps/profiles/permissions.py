from rest_framework.permissions import IsAuthenticated

from apps.core.permissions import CanAccessPublicProfile, IsSelfOrReadOnly


class CanManageOwnProfile(IsSelfOrReadOnly):
    pass


class CanViewPublicProfile(CanAccessPublicProfile):
    pass


class CanManageOwnProfilePhotos(IsAuthenticated):
    pass


class CanManageOwnTags(IsAuthenticated):
    pass