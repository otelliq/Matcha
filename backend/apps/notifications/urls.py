from django.urls import path

from apps.notifications.views import NotificationListAPIView, NotificationMarkAllReadAPIView, NotificationReadAPIView, UnreadCountAPIView

urlpatterns = [
    path("notifications/", NotificationListAPIView.as_view(), name="notifications"),
    path("notifications/unread-count/", UnreadCountAPIView.as_view(), name="notifications-unread-count"),
    path("notifications/<int:pk>/mark-read/", NotificationReadAPIView.as_view(), name="notifications-mark-read"),
    path("notifications/mark-all-read/", NotificationMarkAllReadAPIView.as_view(), name="notifications-mark-all-read"),
]

