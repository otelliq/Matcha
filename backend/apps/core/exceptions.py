from django.core.exceptions import ValidationError as DjangoValidationError
from django.http import Http404
from django.utils.encoding import force_str
from rest_framework import status
from rest_framework.exceptions import APIException, AuthenticationFailed, NotAuthenticated, PermissionDenied, Throttled, ValidationError
from rest_framework.response import Response
from rest_framework.views import exception_handler as drf_exception_handler


def _to_error_fields(detail) -> dict[str, list[str]]:
    if isinstance(detail, dict):
        fields: dict[str, list[str]] = {}
        for key, value in detail.items():
            if isinstance(value, (list, tuple)):
                fields[key] = [force_str(item) for item in value]
            else:
                fields[key] = [force_str(value)]
        return fields
    if isinstance(detail, (list, tuple)):
        return {"non_field_errors": [force_str(item) for item in detail]}
    return {"non_field_errors": [force_str(detail)]}


def _error_payload(code: str, message: str, fields: dict[str, list[str]] | None = None) -> dict:
    payload = {"error": {"code": code, "message": message}}
    if fields:
        payload["error"]["fields"] = fields
    return payload


def custom_exception_handler(exc, context):
    response = drf_exception_handler(exc, context)
    if response is not None:
        code = getattr(exc, "default_code", "error")
        message = force_str(getattr(exc, "detail", response.data))
        fields = None

        if isinstance(exc, ValidationError):
            code = "validation_error"
            message = "Validation failed."
            fields = _to_error_fields(exc.detail)
        elif isinstance(exc, AuthenticationFailed):
            code = "authentication_failed"
        elif isinstance(exc, NotAuthenticated):
            code = "not_authenticated"
        elif isinstance(exc, PermissionDenied):
            code = "permission_denied"
        elif isinstance(exc, Throttled):
            code = "rate_limited"
            message = f"Request was throttled. Retry in {exc.wait} seconds." if exc.wait else "Request was throttled."
        elif isinstance(exc, APIException):
            message = force_str(exc.detail)

        response.data = _error_payload(code, message, fields)
        return response

    if isinstance(exc, (DjangoValidationError, Http404)):
        if isinstance(exc, DjangoValidationError):
            details = getattr(exc, "message_dict", None)
            if details is None:
                details = getattr(exc, "messages", [])
            return Response(
                _error_payload("validation_error", "Validation failed.", _to_error_fields(details)),
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(_error_payload("not_found", "Not found."), status=status.HTTP_404_NOT_FOUND)

    return response
