from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base
from ..config import CONFIG


Base = declarative_base()

# Async engine
async_engine = create_async_engine(
    url=CONFIG.DATABASE_URL
)

# Async Session
Session = async_sessionmaker(
    bind=async_engine,
    expire_on_commit=False,
)
