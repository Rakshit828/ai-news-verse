from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker


from ..config import CONFIG


# Async engine
sync_engine = create_engine(
    url=CONFIG.DATABASE_URL_SYNC
)

# Async Session
GetLocalSession = sessionmaker(
    bind=sync_engine,
    expire_on_commit=False,
)
