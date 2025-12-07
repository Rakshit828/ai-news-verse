import asyncio
from typing import AsyncGenerator, Dict
from loguru import logger


class NotificationManager:
    def __init__(self):
        self.__connections: Dict[str, asyncio.Queue] = {}
    
    async def connect(self, user_id: str) -> AsyncGenerator[str, None]:
        client_queue: asyncio.Queue = asyncio.Queue()
        new_client_connection = { user_id: client_queue }
        self.__connections.update(new_client_connection)
        logger.info(f"New client connection: {user_id}")
        try:
            while True:
                message = await client_queue.get()
                yield message
        except asyncio.CancelledError:
            self.__connections.pop(user_id)
            logger.info(f"Client with id: {user_id} disconnected")
    
    async def broadcast_all(self, message: str):
        for queue in self.__connections.values():
            await queue.put(message)
            


notification_manager = NotificationManager()
