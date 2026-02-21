from typing import Callable, Awaitable
from sqlalchemy.ext.asyncio.session import AsyncSession
from app.response import AppError
from app.exceptions import UnexpectedErrorInController
from loguru import logger


async def safely_run_controllers(func: Awaitable, **kwargs):
    try:
        result = await func(**kwargs)
        return result
    except Exception as e:
        if isinstance(e, AppError):
            raise e
        logger.error(f"ERROR: {str(e)}")

        raise AppError(UnexpectedErrorInController())