from django.urls import path

from apps.chat.views import ConversationListAPIView, MessageListCreateAPIView, MessageMarkReadAPIView

urlpatterns = [
    path("conversations/", ConversationListAPIView.as_view(), name="conversations"),
    path("<int:connection_id>/messages/", MessageListCreateAPIView.as_view(), name="messages"),
    path("<int:connection_id>/messages/mark-read/", MessageMarkReadAPIView.as_view(), name="messages-mark-read"),
]

