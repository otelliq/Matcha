from django.urls import include, path

urlpatterns = [
    path("auth/", include("apps.accounts.urls")),
    path("profiles/", include("apps.profiles.urls")),
    path("matching/", include("apps.matching.urls")),
    path("interactions/", include("apps.interactions.urls")),
    path("chat/", include("apps.chat.urls")),
    path("notifications/", include("apps.notifications.urls")),
]
