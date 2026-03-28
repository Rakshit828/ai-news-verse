from app.db.redis import get_redis, RedisServiceClient
from fastapi import WebSocket
from app.models.ai_news_service import NewNewsNotification
from loguru import logger
from app.config import CONFIG

class PubSubSystem:
    def __init__(self, redis: RedisServiceClient | None = None):
        self.__redis: RedisServiceClient = redis if redis else get_redis(url=CONFIG.REDIS_URL)
    
    async def publish(self, new_news: list[NewNewsNotification]) -> None:
        """Use to publish same message to different channels."""
        for news in new_news:
            await self.__redis._client.publish(news.subcategory_id, news.model_dump_json())
        return


    async def subscribe_and_listen(self, channel_name: str, websocket: WebSocket):
        pubsub = self.__redis._client.pubsub()
        await pubsub.subscribe(channel_name)
        try:
            async for message in pubsub.listen():
                if message['type'] == 'message':
                    await websocket.send_text(message['data'])
        except Exception as e:
            logger.error(str(e))
        finally:
            await pubsub.unsubscribe(channel_name)
            await pubsub.close()

