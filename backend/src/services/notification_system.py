from src.db.redis import (
    get_redis_async,
    get_redis_sync,
    RedisServiceClientAsync,
    RedisServiceClientSync,
)
from fastapi import WebSocket
from src.models.ai_news_service import NewNewsNotification
from loguru import logger
from src.config import CONFIG


class PubSubSystem:
    def __init__(self, redis: RedisServiceClientAsync | None = None):
        self.__redis: RedisServiceClientAsync = (
            redis if redis else get_redis_async(url=CONFIG.REDIS_URL)
        )

    async def publish(self, new_news: list[NewNewsNotification]) -> None:
        """Use to publish same message to different channels."""
        for news in new_news:
            await self.__redis._client.publish(
                news.subcategory_id, news.model_dump_json()
            )
        return

    async def subscribe_and_listen(self, channel_name: str, websocket: WebSocket):
        pubsub = self.__redis._client.pubsub()
        await pubsub.subscribe(channel_name)
        try:
            async for message in pubsub.listen():
                if message["type"] == "message":
                    await websocket.send_text(message["data"])
        except Exception as e:
            logger.error(str(e))
        finally:
            await pubsub.unsubscribe(channel_name)
            await pubsub.close()



class CeleryPublisher:
    def __init__(self, redis: RedisServiceClientSync | None = None):
        self.__redis: RedisServiceClientSync = (
            redis if redis else get_redis_sync(url=CONFIG.REDIS_URL)
        )

    def publish(self, new_news: list[NewNewsNotification]) -> None:
        """Use to publish same message to different channels."""
        for news in new_news:
            self.__redis._client.publish(
                news.subcategory_id, news.model_dump_json()
            )
        return