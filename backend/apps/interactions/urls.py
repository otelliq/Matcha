from django.urls import path

from apps.interactions.views import BlockActionAPIView, ConnectionListAPIView, LikeActionAPIView, ReportCreateAPIView

urlpatterns = [
    path("likes/<int:user_id>/", LikeActionAPIView.as_view(), name="likes"),
    path("blocks/<int:user_id>/", BlockActionAPIView.as_view(), name="blocks"),
    path("reports/<int:user_id>/", ReportCreateAPIView.as_view(), name="reports"),
    path("connections/", ConnectionListAPIView.as_view(), name="connections"),
]
