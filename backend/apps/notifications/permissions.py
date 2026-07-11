from rest_framework.permissions import IsAuthenticated


class CanViewNotifications(IsAuthenticated):
    pass
