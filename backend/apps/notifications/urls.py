from django.urls import path

from apps.notifications.views import NotificationListAPIView, NotificationMarkAllReadAPIView, NotificationReadAPIView, UnreadCountAPIView

urlpatterns = [
    path("", NotificationListAPIView.as_view(), name="notifications"),
    path("unread-count/", UnreadCountAPIView.as_view(), name="notifications-unread-count"),
    path("<int:pk>/mark-read/", NotificationReadAPIView.as_view(), name="notifications-mark-read"),
    path("mark-all-read/", NotificationMarkAllReadAPIView.as_view(), name="notifications-mark-all-read"),
]

