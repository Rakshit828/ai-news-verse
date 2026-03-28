from redis import Redis as RedisSync
from redis.asyncio import Redis as RedisAsync

from urllib.parse import urlparse
from src.config import CONFIG
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



class RedisServiceClientAsync:
    def __init__(self, url: str):
        redis_parsed = parse_redis_url(url if url else CONFIG.REDIS_URL)
        self._client: RedisAsync = RedisAsync(
            host=redis_parsed["host"],
            port=redis_parsed["port"],
            db=redis_parsed["db"],
            decode_responses=True
        )


class RedisServiceClientSync:
    def __init__(self, url: str):
        redis_parsed = parse_redis_url(url if url else CONFIG.REDIS_URL)
        self._client: RedisSync = RedisSync(
            host=redis_parsed["host"],
            port=redis_parsed["port"],
            db=redis_parsed["db"],
            decode_responses=True
        )
    


def get_redis_async(url: str) -> RedisServiceClientAsync:
    return RedisServiceClientAsync(url=url)

def get_redis_sync(url: str) -> RedisServiceClientSync:
    return RedisServiceClientSync(url=url)


