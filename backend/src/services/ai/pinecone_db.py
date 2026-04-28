from src.config import CONFIG

from pinecone import PineconeAsyncio, Pinecone
from pinecone.db_data.index import Index
from pinecone.db_data.index_asyncio import _IndexAsyncio
from pinecone.exceptions.exceptions import PineconeApiException
from typing import List, Dict, Generator, Optional
from loguru import logger
from itertools import islice

from .models import (
    RelevantNewsTitlesResponse,
    NewsTitleClassificationRecord,
)

from src._constants import (
    PINECONE_INDEX_NAME,
    NEWS_TITLES_CLASSIFICATION_NAMESPACE,
)


class PineconeServiceAsync:
    """Provides async interface for interacting with pinecone vector database."""

    def __init__(self, client: PineconeAsyncio, index: _IndexAsyncio):
        self._client: PineconeAsyncio | None = client
        self._index: _IndexAsyncio | None = index

    @classmethod
    async def create(cls, index_name: str, api_key: str, host: str):
        """Creates new pinecone client with new asyncio client and index."""
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
        return cls(client, index)

    async def close(self) -> None:
        await self._index.close()
        await self._client.close()
        self._index = None
        self._client = None

    async def does_namespaces_exist(self) -> bool:
        logger.info("Checking for data in pinecone.")
        stats = await self._index.describe_index_stats()
        namespaces = stats["namespaces"]
        return True if len(namespaces) > 0 else False

    async def get_relevant_news_titles(
        self,
        title: str,
        k: int = 10,
        namespace: Optional[str] = NEWS_TITLES_CLASSIFICATION_NAMESPACE,
    ) -> List[RelevantNewsTitlesResponse]:

        try:
            result = await self._index.search(
                namespace=namespace,
                query={
                    "inputs": {"text": f"{title}"},
                    "top_k": k,
                },
                fields=["topic", "category_id", "subcategory_id"],
            )
            hits = result.get("result", {}).get("hits", [])

            return [RelevantNewsTitlesResponse(**hit) for hit in hits]

        except PineconeApiException as exc:
            raise exc
        except Exception as e:
            raise e

    async def upsert_records(
        self,
        records: List[NewsTitleClassificationRecord],
        namespace: Optional[str] = NEWS_TITLES_CLASSIFICATION_NAMESPACE,
    ):
        records: list[dict] = [record.model_dump() for record in records]
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
                await self._index.upsert_records(
                    namespace=namespace,
                    records=batch,
                )
            logger.info(f"Upserted {len(records)} records to pinecone")

        except PineconeApiException as e:
            raise e
        except Exception as e:
            raise e


class PineconeServiceSync:
    """Provides sync interface for interacting with pinecone vector database."""

    def __init__(self, client: Pinecone, index: Index):
        self._client: Pinecone | None = client
        self._index: Index | None = index

    @classmethod
    def create(cls, index_name: str, api_key: str, host: str):
        """Creates new pinecone client with new asyncio client and index."""
        client = Pinecone(api_key=api_key)

        if not client.has_index(index_name):
            client.create_index_for_model(
                name=index_name,
                cloud="aws",
                region="us-east-1",
                embed={
                    "model": "llama-text-embed-v2",
                    "field_map": {"text": "title", "dimension": 2048},
                },
            )
        index = client.Index(host=host)
        return cls(client, index)

    def close(self) -> None:
        self._index.close()
        self._index = None
        self._client = None

    def does_namespaces_exist(self) -> bool:
        logger.info("Checking for data in pinecone.")
        stats = self._index.describe_index_stats()
        namespaces = stats["namespaces"]
        return True if len(namespaces) > 0 else False

    def get_relevant_news_titles(
        self,
        title: str,
        k: int = 10,
        namespace: Optional[str] = NEWS_TITLES_CLASSIFICATION_NAMESPACE,
    ) -> List[RelevantNewsTitlesResponse]:

        try:
            result = self._index.search(
                namespace=namespace,
                query={
                    "inputs": {"text": f"{title}"},
                    "top_k": k,
                },
                fields=["category_id", "subcategory_id"],
            )
            hits = result.result.hits
            return [
                RelevantNewsTitlesResponse.model_validate(
                    hit.to_dict() if hasattr(hit, "to_dict") else hit
                )
                for hit in hits
            ]

        except PineconeApiException as exc:
            raise exc
        except Exception as e:
            raise e

    def upsert_records(
        self,
        records: List[NewsTitleClassificationRecord],
        namespace: Optional[str] = NEWS_TITLES_CLASSIFICATION_NAMESPACE,
    ):
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
                self._index.upsert_records(
                    namespace=namespace,
                    records=batch,
                )
            logger.info(f"Upserted {len(records)} records to pinecone")

        except PineconeApiException as e:
            raise e
        except Exception as e:
            raise e


# factories
def init_pinecone_db_sync():
    return PineconeServiceSync.create(
        index_name=PINECONE_INDEX_NAME,
        api_key=CONFIG.PINECONE_API_KEY,
        host=CONFIG.PINECONE_HOST,
    )


async def init_pinecone_db_async():
    return await PineconeServiceAsync.create(
        index_name=PINECONE_INDEX_NAME,
        api_key=CONFIG.PINECONE_API_KEY,
        host=CONFIG.PINECONE_HOST,
    )


if __name__ == "__main__":
    import asyncio as aio

    async def main():
        pinecone_client = await init_pinecone_db_async()
        result: List[RelevantNewsTitlesResponse] = (
            await pinecone_client.get_relevant_news_titles(
                title="US is the most successful country in AI research after China.",
            )
        )
        print(result)

    aio.run(main())
