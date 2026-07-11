from rest_framework.permissions import IsAuthenticated


class CanBrowseMatches(IsAuthenticated):
    pass