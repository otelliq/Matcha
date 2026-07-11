from urllib.parse import parse_qs

from channels.db import database_sync_to_async
from channels.middleware import BaseMiddleware
from django.contrib.auth.models import AnonymousUser
from django.db import close_old_connections
from rest_framework_simplejwt.authentication import JWTAuthentication


class JWTQueryAuthMiddleware(BaseMiddleware):
    def __init__(self, inner):
        super().__init__(inner)
        self.jwt_authentication = JWTAuthentication()

    async def __call__(self, scope, receive, send):
        close_old_connections()
        query_string = scope.get("query_string", b"").decode("utf-8")
        query_params = parse_qs(query_string)
        token = self._extract_token(scope, query_params)
        scope["user"] = await self._get_user(token)
        return await super().__call__(scope, receive, send)

    def _extract_token(self, scope, query_params):
        headers = dict(scope.get("headers", []))
        authorization = headers.get(b"authorization")
        if authorization:
            auth_value = authorization.decode("utf-8")
            if auth_value.lower().startswith("bearer "):
                return auth_value.split(" ", 1)[1].strip()
        token_values = query_params.get("access_token") or query_params.get("token")
        if token_values:
            return token_values[0]
        return None

    @database_sync_to_async
    def _get_user(self, token):
        if not token:
            return AnonymousUser()
        try:
            validated = self.jwt_authentication.get_validated_token(token)
            return self.jwt_authentication.get_user(validated)
        except Exception:
            return AnonymousUser()
