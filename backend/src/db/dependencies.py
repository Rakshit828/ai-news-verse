from src.db.main import Session
from sqlalchemy.ext.asyncio import AsyncSession
from typing import AsyncGenerator



async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with Session() as session:
        try:
            yield session

            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

        