"""This file defines the logic to classify the category and subcategory from the title."""

from .pinecone_db import (
    PineconeServiceAsync,
    PineconeServiceSync,
    init_pinecone_db_async,
    init_pinecone_db_sync,
)
from loguru import logger

from src.services.ai.models import VDBClassificationResponse


class VDBCategoryClassifierSync:

    def __init__(self, pinecone: PineconeServiceSync = None):
        self._pinecone = pinecone

    @classmethod
    def create(cls):
        return cls(pinecone=init_pinecone_db_sync())

    def close_pc_connection(self) -> None:
        self._pinecone.close()

    def run(
        self, title: str, score_threshold: float = 0.2
    ) -> VDBClassificationResponse | None:
        related_titles = self._pinecone.get_relevant_news_titles(title=title, k=11)

        subcat_freq = {}
        for record in related_titles:
            if not record.score >= score_threshold:
                continue
            if record.category_fields.subcategory_id in subcat_freq:
                subcat_freq[record.category_fields.subcategory_id] += 1
            else:
                subcat_freq[record.category_fields.subcategory_id] = 1

        logger.info(f"The subcat_freq is : {subcat_freq}")

        if not subcat_freq:
            logger.info(
                f"News with title : {title} cannot be classified. Returning None."
            )
            return None

        return VDBClassificationResponse(
            category_id=None, subcategory_id=max(subcat_freq, key=subcat_freq.get)
        )


class VDBCategoryClassifierAsync:

    def __init__(self, pinecone: PineconeServiceAsync = None):
        self._pinecone = pinecone

    @classmethod
    async def create(cls):
        return cls(pinecone=await init_pinecone_db_async())

    async def close_pc_connection(self) -> None:
        await self._pinecone.close()

    async def run(
        self, title: str, score_threshold: float = 0.3
    ) -> VDBClassificationResponse:
        related_titles: list[VDBClassificationResponse] = (
            await self._pinecone.get_relevant_news_titles(title=title, k=11)
        )

        subcat_freq = {}
        for record in related_titles:
            if not record.score >= score_threshold:
                continue
            if record.category_fields.subcategory_id in subcat_freq:
                subcat_freq[record.category_fields.subcategory_id] += 1
            else:
                subcat_freq[record.category_fields.subcategory_id] = 1

        return VDBClassificationResponse(
            category_id=None, subcategory_id=max(subcat_freq, key=subcat_freq.get)
        )


if __name__ == "__main__":

    async def main():
        classifier = await VDBCategoryClassifierSync.create()
        response: VDBClassificationResponse = await classifier.run(
            title="OpenAI Is Taking On Apple’s App Store. It’s Got a Long Way to Go."
        )
        print(f"Classification Response : {response}")

    import asyncio

    asyncio.run(main())
