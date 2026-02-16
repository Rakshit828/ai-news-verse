from app.ai.models import (
    PrimaryCategoryRecord,
    TopicKeywordRecord,
    PrimaryCategoryRecordResponse,
    SubcategoryCheckResponse,
    CategoryCheckResponse,
)
from app.config import CONFIG

from pinecone import PineconeAsyncio
from pinecone.db_data.index_asyncio import _IndexAsyncio
from pinecone.exceptions.exceptions import PineconeApiException
from typing import List, Dict, Generator
from loguru import logger
from itertools import islice

from app.constants import (
    PINECONE_APPLICATION_CATEGORY_NAMESPACE,
    PINECONE_USER_CATEGORY_NAMESPACE,
    PINECONE_INDEX_NAME,
    PINECONE_CANONICAL_TOPIC_NAMESPACE,
)


class PineconeClient:
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

    async def check_for_subcategory_existence(
        self, subcategory: str
    ) -> SubcategoryCheckResponse | None:
        try:
            result = await self.index.search(
                namespace=PINECONE_CANONICAL_TOPIC_NAMESPACE,
                query={
                    "inputs": {"text": f"{subcategory}"},
                    "top_k": 1,
                    "filter": {"subcategory_id": {"$exists": True}},
                },
                fields=["content", "category_id", "subcategory_id"],
            )
            subcategory = result["result"]["hits"][0]
            logger.debug(f"Subcategory from pinecone: {subcategory}")
            if subcategory["_score"] >= 0.9:
                return SubcategoryCheckResponse(
                    category_id=subcategory["fields"]["category_id"],
                    subcategory_id=subcategory["fields"]["subcategory_id"],
                    content=subcategory["fields"]["content"],
                )
            return None
        except PineconeApiException as exc:
            raise exc
        except Exception as e:
            raise e

    async def check_for_category_existence(
        self, category: str
    ) -> CategoryCheckResponse | None:
        try:
            result = await self.index.search(
                namespace=PINECONE_CANONICAL_TOPIC_NAMESPACE,
                query={
                    "inputs": {"text": f"{category}"},
                    "top_k": 1,
                    "filter": {"subcategory_id": {"$exists": False}},
                },
                fields=["content", "category_id"],
            )
            category = result["result"]["hits"][0]
            logger.debug(f"Category from pinecone: {category}")
            if category["_score"] >= 0.9:
                return CategoryCheckResponse(
                    category_id=category["fields"]["category_id"],
                    content=category["fields"]["content"],
                )
            return None
        except PineconeApiException as exc:
            raise exc
        except Exception as e:
            raise e

    async def get_relevant_title_records(
        self, title: str, namespace: str, k: int = 10
    ) -> List[PrimaryCategoryRecordResponse]:
        if (
            namespace != PINECONE_APPLICATION_CATEGORY_NAMESPACE
            and namespace != PINECONE_USER_CATEGORY_NAMESPACE
        ):
            raise ValueError("Invalid namespace value")

        try:
            result = await self.index.search(
                namespace=namespace,
                query={
                    "inputs": {"text": f"{title}"},
                    "top_k": k,
                },
                fields=["topic", "category_id", "subcategory_id"],
            )
            hits = result.get("result", {}).get("hits", [])
            # logger.debug(f"Records from pinecone: {hits}")
            return hits

        except PineconeApiException as exc:
            raise exc
        except Exception as e:
            raise e

    async def upsert_records(
        self,
        records: List[PrimaryCategoryRecord] | List[TopicKeywordRecord],
        upsert_in: str,
    ):
        if upsert_in not in [
            PINECONE_APPLICATION_CATEGORY_NAMESPACE,
            PINECONE_USER_CATEGORY_NAMESPACE,
            PINECONE_CANONICAL_TOPIC_NAMESPACE,
        ]:
            raise ValueError("Invalid upsert_in value")

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
                await self.index.upsert_records(
                    namespace=upsert_in,
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
        index_name=PINECONE_INDEX_NAME,
        api_key=CONFIG.PINECONE_API_KEY,
        host=CONFIG.PINECONE_HOST,
    )


if __name__ == "__main__":
    import asyncio as aio

    async def main():
        pinecone_client = await init_pinecone_db()
        result: List[PrimaryCategoryRecordResponse] = (
            await pinecone_client.get_relevant_title_records(
                title="US is the most successful country in AI research after China.",
                namespace=PINECONE_APPLICATION_CATEGORY_NAMESPACE,
            )
        )
        print(result)

    aio.run(main())
