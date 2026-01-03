from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.ext.asyncio import AsyncSession
from ..config import CONFIG

Base = declarative_base()

# Async engine
async_engine = create_async_engine(
    url=CONFIG.DATABASE_URL
)
# Async Session
Session = sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    expire_on_commit=False,
)
            
# Dependency for FastAPI
async def get_session():
    async with Session() as session:
        try:
            yield session
        except Exception as e:
            await session.rollback()
            raise e

