from app.db.main import Session
from sqlalchemy.ext.asyncio import AsyncSession
from typing import AsyncGenerator



# Dependency for FastAPI
# async def get_session() -> AsyncGenerator[AsyncSession, None]:
#     async with Session() as session:
#         try:
#             yield session
#         finally:
#             session.close()


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with Session() as session:
        yield session


        