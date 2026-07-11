from django.urls import path

from apps.matching.views import SearchListAPIView, SuggestionListAPIView

urlpatterns = [
    path("suggestions/", SuggestionListAPIView.as_view(), name="suggestions"),
    path("search/", SearchListAPIView.as_view(), name="search"),
]
