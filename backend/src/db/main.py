from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base
from ..config import CONFIG


Base = declarative_base()


# Async engine
async_engine = create_async_engine(
    url=CONFIG.DATABASE_URL,
    pool_size=20,
    max_overflow=10,
    pool_timeout=10,
)

# Async Session
Session = async_sessionmaker(
    bind=async_engine,
    expire_on_commit=False,
)
