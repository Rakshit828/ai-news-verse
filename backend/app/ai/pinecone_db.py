from pinecone import PineconeAsyncio
from pinecone.db_data.index_asyncio import _IndexAsyncio
from pinecone.exceptions.exceptions import PineconeApiException
from typing import List, TypedDict, Dict, Generator
from loguru import logger

from app.config import CONFIG


class TitleCategoryRecord(TypedDict):
    id: str
    title: str
    category: str
    subcategory: str


class PineconeClient:
    NAMESPACES = {
        "title-category-namespace": "title-category-namespace"
    }
    def __init__(self, index):
        self.index: _IndexAsyncio = index

    @classmethod
    async def create(cls, index_name: str, api_key: str, host: str):
        client = PineconeAsyncio(api_key=api_key)
        if not await client.has_index(index_name):
            await client.create_index_for_model(
                name=index_name,
                cloud="aws",
                region="us-east-1",
                embed={
                    "model": "llama-text-embed-v2",
                    "field_map": {"text": "title", "dimension": 2048},
                },
            )
        index = client.IndexAsyncio(host=host)
        return cls(index)


    async def upsert_records(self, records: List[TitleCategoryRecord]):
        try:
            await self.index.upsert(
                namespace=self.NAMESPACES.get('title-category-namespace', 'title-category-namespace'),
                records=records,
            )
        except PineconeApiException as e:
            pass

    

# async factory
async def init_pinecone_db():
    return await PineconeClient.create(
        index_name="ai-news-system",
        api_key=CONFIG.PINECONE_API_KEY,
        host=CONFIG.PINECONE_HOST,
    )
