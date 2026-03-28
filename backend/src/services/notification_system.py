from src.db.redis import (
    get_redis_async,
    get_redis_sync,
    RedisServiceClientAsync,
    RedisServiceClientSync,
)
from fastapi import WebSocket, WebSocketDisconnect
from src.models.ai_news_service import NewNewsNotification
from loguru import logger
from src.config import CONFIG

redis_client: RedisServiceClientAsync = get_redis_async(url=CONFIG.REDIS_URL)


class PubSubSystem:
    def __init__(self, redis: RedisServiceClientAsync):
        self.__redis = redis
        # We don't create the pubsub object in __init__ 
        # to ensure it's created within the async context of the request.
        self._pubsub = None
    
    async def publish(self, new_news: list[NewNewsNotification]) -> None:
        """Use to publish same message to different channels."""
        for news in new_news:
            await self.__redis._client.publish(
                news.subcategory_id, news.model_dump_json()
            )
        return

    async def listen_multiple(self, channels: list[str], websocket: WebSocket):
        self._pubsub = self.__redis._client.pubsub()
        await self._pubsub.subscribe(*channels)
        
        try:
            async for message in self._pubsub.listen():
                if message["type"] == "message":
                    try:
                        await websocket.send_text(message["data"])
                    except WebSocketDisconnect:
                        # Explicit handling
                        logger.info("Client disconnected during send")
                        break   # exit loop cleanly
        finally:
            # Proper cleanup
            await self._pubsub.unsubscribe(*channels)
            await self._pubsub.close()



# Dependency for the fastapi for pubsub using global/common redis client.
def get_pubsub_system():
    return PubSubSystem(redis=redis_client)


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