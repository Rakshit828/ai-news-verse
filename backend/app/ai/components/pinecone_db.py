from app.ai import TitleCategoryRecord, TitleRecordResponse
from app.config import CONFIG

from pinecone import PineconeAsyncio
from pinecone.db_data.index_asyncio import _IndexAsyncio
from pinecone.exceptions.exceptions import PineconeApiException
from typing import List, Dict, Generator
from loguru import logger
from itertools import islice



  
class PineconeClient:
    NAMESPACES = {"title-category-namespace": "title-category-namespace"}
    _obj: "PineconeClient" = None

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
        if cls._obj:
            return cls._obj
        index = client.IndexAsyncio(host=host)
        cls._obj = cls(index)
        return cls._obj

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
                    fields=["subcategory"],
                )
                subcategory = result["result"]["hits"][0]["fields"]["subcategory"]
                return subcategory == subcategory

            except PineconeApiException as exc:
                raise exc

    async def get_relevant_title_records(self, title: str) -> List[TitleRecordResponse]:
        async with self.index as idx:
            try:
                result = await idx.search(
                    namespace=self.NAMESPACES.get(
                        "title-category-namespace", "title-category-namespace"
                    ),
                    query={
                        "inputs": {"text": f"{title}"},
                        "top_k": 10,
                    },
                )
                hits = result.get("result", {}).get("hits", [])
                return hits
            
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


if __name__ == "__main__":
    import asyncio as aio

    async def main():
        record = TitleRecordResponse(
            **{
                "_id": "rec3",
                "_score": 0.8204272389411926,
                "fields": {
                    "category": "immune system",
                    "subcategory": "dafdfa",
                    "title": "dafdkasfj",
                },
            },
        )
        print(type(record))
        pinecone_client = await init_pinecone_db()
        result: List[TitleRecordResponse] = (
            await pinecone_client.get_relevant_title_records(
                title="US is the most successful country in AI research after China."
            )
        )
        print(result)

    aio.run(main())
