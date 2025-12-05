import redis.asyncio as redis
import json

client = redis.Redis()


class CategoryDataCaching:
    def __init__(self):
        pass
    
    async def set_category_data(self, category_data: dict):
        await client.set("category_data", json.dumps(category_data))

    async def get_category_data(self):
        result = await client.get("category_data")
        if result is None:
            return None
        return json.loads(result)
    
    


category_caching = CategoryDataCaching()