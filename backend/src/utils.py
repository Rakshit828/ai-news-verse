from typing import Awaitable
from src.response import AppError
from loguru import logger
import time
from functools import wraps
from fastapi import status

from src.response import ErrorResponse, T


class UnexpectedErrorInController(ErrorResponse[T]):
    status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR
    message: str = "Something went wrong."
    error: str = "unexpected_error_in_controller"
    data: T | None = None

def timeit(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()  # high-resolution timer
        result = func(*args, **kwargs)
        end = time.perf_counter()
        print(f"{func.__name__} took {end - start:.6f} seconds")
        return result
    return wrapper



async def safely_run_controllers(func: Awaitable, **kwargs):
    try:
        result = await func(**kwargs)
        return result
    except Exception as e:
        if isinstance(e, AppError):
            raise e
        logger.error(f"ERROR: {str(e)}")

        raise AppError(UnexpectedErrorInController())