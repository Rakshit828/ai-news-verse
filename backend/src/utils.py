from typing import Awaitable
from src.response import AppError
from src.exceptions import UnexpectedErrorInController
from loguru import logger
import time
from functools import wraps

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