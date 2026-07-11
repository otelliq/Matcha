from django.http import JsonResponse


class ApiExceptionMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        try:
            return self.get_response(request)
        except Exception:
            if request.path.startswith("/api/v1/"):
                return JsonResponse(
                    {"error": {"code": "server_error", "message": "An unexpected server error occurred."}},
                    status=500,
                )
            raise
