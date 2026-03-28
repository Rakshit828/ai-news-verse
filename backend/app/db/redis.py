import redis.asyncio as redis
from urllib.parse import urlparse
from app.config import CONFIG
from typing import TypedDict

class RedisDetails(TypedDict):
    host: str
    port: int
    db: int | str


def parse_redis_url(url: str) -> RedisDetails:
    parsed = urlparse(url)

    # Basic validation
    if parsed.scheme != "redis":
        raise ValueError("Invalid scheme. Expected 'redis://'")

    if not parsed.hostname:
        raise ValueError("Missing hostname")

    if parsed.port is None:
        raise ValueError("Missing port")

    # Extract DB (path usually like "/1")
    try:
        db = int(parsed.path.lstrip("/")) if parsed.path else 0
    except ValueError:
        raise ValueError("Invalid DB index")

    return {
        "host": parsed.hostname,
        "port": parsed.port,
        "db": db
    }



class RedisServiceClient:
    def __init__(self, url: str):
        redis_parsed = parse_redis_url(url if url else CONFIG.REDIS_URL)
        self._client: redis.Redis = redis.Redis(
            host=redis_parsed["host"],
            port=redis_parsed["port"],
            db=redis_parsed["db"],
            decode_responses=True
        )
    


def get_redis(url: str) -> RedisServiceClient:
    return RedisServiceClient(url=url)

