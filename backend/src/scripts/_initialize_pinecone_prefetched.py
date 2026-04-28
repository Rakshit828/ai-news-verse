"""Initializes pinecone from prefetched news existing in the db."""

"""This file contains the initial pineline to be triggerred to store the data in pinecone."""

import asyncio
from loguru import logger
import uuid

from src.services.ai import PineconeServiceAsync
from src.services.ai.models import NewsTitleClassificationRecord
from sqlalchemy.ext.asyncio.session import AsyncSession

from src.services.ai import init_pinecone_db_async
from src.domains.news.repository import NewsArticleRepository
from src.domains.news.models import NewsTitleWithCategoryIds
from src.db.dependencies import get_session


class PineconeInitializerAsyncFromPrefetched:
    def __init__(
        self, pinecone: PineconeServiceAsync, article_repo: NewsArticleRepository
    ):
        self.pinecone = pinecone
        self.article_repo = article_repo

    async def main_pipeline(self, per_category: int):
        async for session in get_session():
            fetched: list[NewsTitleWithCategoryIds] = (
                await self.article_repo.get_news_title_and_category_ids(
                    per_category=per_category, session=session
                )
            )
        pinecone_records = [
            NewsTitleClassificationRecord(
                id=str(uuid.uuid4()),
                content=news.title,
                category_id=str(news.category_id),
                subcategory_id=str(news.subcategory_id),
                category=news.category,
                subcategory=news.subcategory,
            ) for news in fetched
        ]
        await self.pinecone.upsert_records(records=pinecone_records)



async def main():
    pinecone_client: PineconeServiceAsync = await init_pinecone_db_async()
    initializer = PineconeInitializerAsyncFromPrefetched(
        pinecone=pinecone_client, article_repo=NewsArticleRepository()
    )
    await initializer.main_pipeline(per_category=10)


if __name__ == "__main__":
    asyncio.run(main())
