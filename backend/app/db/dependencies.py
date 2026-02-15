from app.db.main import Session, AsyncSession
import asyncpg.exceptions as exc
from typing import AsyncGenerator

from app.response import AppError
from loguru import logger

# Dependency for FastAPI
async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with Session() as session:
        try:
            yield session
        finally:
            session.close()


async def get_session():
    async with Session() as session:
        yield session
        

        