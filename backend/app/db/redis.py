import redis.asyncio as redis

class RedisServiceClient:
    def __init__(self, host: str = "localhost", port: int = 6379, db: str | int = 0, password: str | None = None):
        self._client: redis.Redis = redis.Redis(
            host=host,
            port=port,
            db=db,
            password=password,
            decode_responses=True
        )
    

async def init_redis():
    return RedisServiceClient()

def get_redis() -> RedisServiceClient:
    return RedisServiceClient()