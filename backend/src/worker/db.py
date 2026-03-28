from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker


from ..config import CONFIG


# Async engine
sync_engine = create_engine(
    url=CONFIG.DATABASE_URL_SYNC,
    pool_size=5,
    max_overflow=10
)

# Async Session
GetLocalSession = sessionmaker(
    bind=sync_engine,
    expire_on_commit=False,
)
