from pinecone import PineconeAsyncio
from pinecone.db_data.index_asyncio import _IndexAsyncio
from pinecone.exceptions.exceptions import PineconeApiException
from typing import List, TypedDict, Dict, Generator
from loguru import logger
from itertools import islice

from app.config import CONFIG


class TitleCategoryRecord(TypedDict):
    id: str
    title: str
    category: str
    subcategory: str


class PineconeClient:
    NAMESPACES = {"title-category-namespace": "title-category-namespace"}

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

    async def check_for_subcategory_existence(self, subcategory: str) -> bool:
        async with self.index as idx:
            try:
                result = await idx.search(
                    namespace=self.NAMESPACES.get(
                        "title-category-namespace", "title-category-namespace  "
                    ),
                    query={
                        "inputs": {"text": f"{subcategory}"}, 
                        "top_k": 1,
                        "filter": {"subcategory": subcategory},
                    },
                    fields=["subcategory"]
                )
                subcategory = result['result']['hits'][0]['fields']['subcategory']
                return subcategory == subcategory
            
            except PineconeApiException as exc:
                raise exc

    async def upsert_records(self, records: List[TitleCategoryRecord]):
        async with self.index as idx:
            try:
                logger.info(f"Upserting {len(records)} records to pinecone")

                def chunks(
                    iterable: list[Dict], size=96
                ) -> Generator[list[Dict], None, None]:
                    """This function helps to divide the list into given size or less"""
                    iterator = iter(iterable)
                    for first in iterator:
                        yield [first] + list(islice(iterator, size - 1))

                for batch in chunks(records, 96):
                    logger.debug(f"The batch is : {batch} \n\n")
                    await idx.upsert_records(
                        namespace=self.NAMESPACES.get(
                            "title-category-namespace", "title-category-namespace"
                        ),
                        records=batch,
                    )
                logger.info(f"Upserted {len(records)} records to pinecone")

            except PineconeApiException as e:
                raise e
            except Exception as e:
                raise e


# async factory
async def init_pinecone_db():
    return await PineconeClient.create(
        index_name="ai-news-system",
        api_key=CONFIG.PINECONE_API_KEY,
        host=CONFIG.PINECONE_HOST,
    )
