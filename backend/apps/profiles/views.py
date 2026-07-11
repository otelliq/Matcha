from rest_framework import status
from rest_framework.exceptions import NotFound, PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.models import User
from apps.core.pagination import StandardLimitOffsetPagination
from apps.core.permissions import users_are_blocked
from apps.interactions.models import Like, ProfileView
from apps.notifications.services import create_notification
from apps.profiles.models import Profile, ProfilePicture, Tag
from apps.profiles.serializers import (
    ProfileActivitySerializer,
    ProfileLocationSerializer,
    ProfileMeSerializer,
    ProfilePictureSerializer,
    ProfilePictureUploadSerializer,
    ProfilePublicSerializer,
    TagSerializer,
)


def _get_or_create_profile(user: User) -> Profile:
    profile, _ = Profile.objects.get_or_create(user=user)
    return profile


class MyProfileAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile = _get_or_create_profile(request.user)
        return Response(ProfileMeSerializer(profile).data)

    def patch(self, request):
        profile = _get_or_create_profile(request.user)
        serializer = ProfileMeSerializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(ProfileMeSerializer(profile).data)


class PublicProfileAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk: int):
        profile = Profile.objects.select_related("user").prefetch_related("tags", "pictures").filter(pk=pk).first()
        if profile is None:
            raise NotFound("Profile not found.")
        if users_are_blocked(request.user, profile.user):
            raise PermissionDenied("You cannot view this profile.")
        if request.user != profile.user:
            ProfileView.objects.create(viewer=request.user, viewed_profile=profile)
            create_notification(profile.user, kind="profile_viewed", actor=request.user, data={"profile_id": profile.id})
        return Response(ProfilePublicSerializer(profile).data)


class ProfilePhotoListCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        profile = _get_or_create_profile(request.user)
        serializer = ProfilePictureUploadSerializer(data=request.data, context={"profile": profile})
        serializer.is_valid(raise_exception=True)
        picture = serializer.save(profile=profile)
        if picture.position == 1 and profile.pictures.exclude(pk=picture.pk).exists():
            ProfilePicture.objects.filter(profile=profile).exclude(pk=picture.pk).update(is_primary=False)
        if picture.is_primary or not profile.pictures.exclude(pk=picture.pk).filter(is_primary=True).exists():
            ProfilePicture.objects.filter(profile=profile).exclude(pk=picture.pk).update(is_primary=False)
            picture.is_primary = True
            picture.save(update_fields=["is_primary"])
        elif profile.pictures.count() == 1:
            picture.is_primary = True
            picture.save(update_fields=["is_primary"])
        return Response(ProfilePictureSerializer(picture).data, status=status.HTTP_201_CREATED)


class ProfilePhotoDeleteAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk: int):
        profile = _get_or_create_profile(request.user)
        picture = ProfilePicture.objects.filter(profile=profile, pk=pk).first()
        if picture is None:
            raise NotFound("Picture not found.")
        was_primary = picture.is_primary
        picture.delete()
        if was_primary:
            next_picture = ProfilePicture.objects.filter(profile=profile).order_by("position", "created_at").first()
            if next_picture:
                ProfilePicture.objects.filter(pk=next_picture.pk).update(is_primary=True)
        return Response(status=status.HTTP_204_NO_CONTENT)


class ProfileLocationAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        profile = _get_or_create_profile(request.user)
        serializer = ProfileLocationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        for key in ("latitude", "longitude", "city", "neighborhood"):
            if key in data:
                setattr(profile, key, data[key])
        if data.get("latitude") is not None:
            profile.location_source = Profile.LocationSource.GPS
        elif data.get("city") or data.get("neighborhood"):
            profile.location_source = Profile.LocationSource.MANUAL
        profile.save()
        return Response(ProfileMeSerializer(profile).data)


class TagListCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        search = request.query_params.get("q", "").strip()
        queryset = Tag.objects.all().order_by("name")
        if search:
            queryset = queryset.filter(name__icontains=search)
        paginator = StandardLimitOffsetPagination()
        page = paginator.paginate_queryset(queryset, request, view=self)
        return paginator.get_paginated_response(TagSerializer(page, many=True).data)

    def post(self, request):
        serializer = TagSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        tag = serializer.save()
        return Response(TagSerializer(tag).data, status=status.HTTP_201_CREATED)


class ProfileViewersAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile = _get_or_create_profile(request.user)
        queryset = ProfileView.objects.select_related("viewer__profile", "viewer").filter(viewed_profile=profile)
        items = []
        for view in queryset:
            if view.viewer == request.user or not hasattr(view.viewer, "profile"):
                continue
            if users_are_blocked(request.user, view.viewer):
                continue
            items.append({"profile": ProfilePublicSerializer(view.viewer.profile).data, "timestamp": view.created_at})
        paginator = StandardLimitOffsetPagination()
        page = paginator.paginate_queryset(items, request, view=self)
        return paginator.get_paginated_response(ProfileActivitySerializer(page, many=True).data)


class ProfileLikersAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile = _get_or_create_profile(request.user)
        queryset = Like.objects.select_related("sender__profile", "sender").filter(recipient=request.user, is_active=True)
        items = []
        for like in queryset:
            if like.sender == request.user or not hasattr(like.sender, "profile"):
                continue
            if users_are_blocked(request.user, like.sender):
                continue
            items.append({"profile": ProfilePublicSerializer(like.sender.profile).data, "timestamp": like.created_at})
        paginator = StandardLimitOffsetPagination()
        page = paginator.paginate_queryset(items, request, view=self)
        return paginator.get_paginated_response(ProfileActivitySerializer(page, many=True).data)
