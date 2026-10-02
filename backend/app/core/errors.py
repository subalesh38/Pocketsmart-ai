from fastapi import Request
from fastapi.responses import JSONResponse

class AppError(Exception):
    def __init__(self, code: str, message: str, details: dict | None = None, status_code: int = 400):
        self.code = code
        self.message = message
        self.details = details or {}
        self.status_code = status_code

async def app_error_handler(request: Request, exc: Exception) -> JSONResponse:
    err = exc if isinstance(exc, AppError) else AppError(code="INTERNAL_ERROR", message="An unexpected error occurred", status_code=500)
    return JSONResponse(
        status_code=err.status_code,
        content={
            "error": {
                "code": err.code,
                "message": err.message,
                "details": err.details,
            }
        },
    )
