from typing import Callable
from sqlalchemy.ext.asyncio.session import AsyncSession
from app.response import AppError
from app.exceptions import UnexpectedErrorInController
from loguru import logger


async def safely_run_controllers(func: Callable, **kwargs):
    try:
        result = await func(**kwargs)
        return result
    except Exception as e:
        logger.error(str(e))
        raise AppError(UnexpectedErrorInController())