from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker


from ..config import CONFIG


DATABASE_URL_SYNC = CONFIG.DATABASE_URL.replace("asyncpg", "psycopg2")


# sync engine
sync_engine = create_engine(
    url=DATABASE_URL_SYNC,
    pool_size=5,
    max_overflow=10,
    pool_timeout=10,
)

# sync Session
GetLocalSession = sessionmaker(
    bind=sync_engine,
    expire_on_commit=False,
)
