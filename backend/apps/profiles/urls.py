from django.urls import path

from apps.profiles.views import (
    MyProfileAPIView,
    ProfileLikersAPIView,
    ProfileLocationAPIView,
    ProfilePhotoDeleteAPIView,
    ProfilePhotoListCreateAPIView,
    ProfileViewersAPIView,
    PublicProfileAPIView,
    TagListCreateAPIView,
)

urlpatterns = [
    path("me/", MyProfileAPIView.as_view(), name="my-profile"),
    path("<int:pk>/", PublicProfileAPIView.as_view(), name="public-profile"),
    path("me/photos/", ProfilePhotoListCreateAPIView.as_view(), name="profile-photos"),
    path("me/photos/<int:pk>/", ProfilePhotoDeleteAPIView.as_view(), name="profile-photo-delete"),
    path("me/location/", ProfileLocationAPIView.as_view(), name="profile-location"),
    path("me/viewers/", ProfileViewersAPIView.as_view(), name="profile-viewers"),
    path("me/likers/", ProfileLikersAPIView.as_view(), name="profile-likers"),
    path("tags/", TagListCreateAPIView.as_view(), name="tag-list"),
]

