from logging.config import dictConfig


def configure_logging() -> None:
    dictConfig(
        {
            "version": 1,
            "disable_existing_loggers": False,
            "filters": {
                "correlation_id": {
                    "()": "asgi_correlation_id.CorrelationIdFilter",
                    "uuid_length": 32,
                    "default_value": "None",
                },
            },
            "formatters": {
                "console": {
                    "class": "logging.Formatter",
                    "datefmt": "%Y-%m-%dT%H:%M:%S",
                    "format": "[rid: %(correlation_id)s] [%(name)s:%(lineno)d] - %(message)s",  # noqa: E501
                },
            },
            "handlers": {
                "console": {
                    "class": "rich.logging.RichHandler",
                    "level": "INFO",
                    "formatter": "console",
                    "filters": ["correlation_id"],
                },
            },
            "loggers": {
                "uvicorn": {
                    "handlers": ["console"],
                    "level": "INFO",
                },
                "src": {
                    "handlers": ["console"],
                    "level": "INFO",
                    "propagate": False,
                },
            },
        }
    )
