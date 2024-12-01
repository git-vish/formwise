import time
from collections.abc import Callable

from fastapi import Request, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Middleware to limit the rate of requests to specific paths."""

    def __init__(
        self,
        app: ASGIApp,
        paths: list[str],
        delta: int = 60,
        limit: int = 10,
    ):
        super().__init__(app)
        self.paths = paths
        self.delta = delta
        self.limit = limit

        self.map: dict[str, list[float]] = {}

    async def dispatch(self, request: Request, call_next: Callable) -> JSONResponse:
        """Handle incoming requests and apply rate limiting for the specified paths."""
        path = request.url.path
        if path in self.paths:
            current_time = time.time()
            # Remove timestamps older than delta
            self.map[path] = [
                timestamp
                for timestamp in self.map.get(path, [])
                if current_time - timestamp < self.delta
            ]

            # Check if limit has been reached
            if len(self.map[path]) >= self.limit:
                return JSONResponse(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    content={"detail": "Rate limit exceeded. Please try again later."},
                )

            # Add the new request timestamp
            self.map[path].append(current_time)

        return await call_next(request)
