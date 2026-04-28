"""This file contains the initial pineline to be triggerred to store the data in pinecone."""

import asyncio
from loguru import logger
import sqlalchemy.exc as exc
import uuid


from src.services.ai import PineconeServiceAsync
from src.services.ai.models import (
    NewsTitleClassificationRecord,
    AiClassificationResponse,
)
from src.services.ai.ai_classifier import AiNewsClassifierAsync
from src.services.ai import init_pinecone_db_async
from src.domains.news.repository import NewsCategoryRepository
from src.db.dependencies import get_session
from src.domains.news.models import CategoriesDataResponse
from src.services.news_service.sources import HackernoonService
from src.services.news_service.type import HackerNoonScrapedData


class PineconeInitializerAsync:
    def __init__(
        self,
        pinecone: PineconeServiceAsync,
        categories_data: CategoriesDataResponse,
        ai_news_classifier: AiNewsClassifierAsync,
    ):
        self.pinecone = pinecone
        self.categories_data = categories_data
        self.ai_news_classifier = ai_news_classifier

    async def main_pipeline(self, scrape_from: HackernoonService):
        pinecone_records: list[NewsTitleClassificationRecord] = []
        fetched: list[HackerNoonScrapedData] = scrape_from.fetch_rss_feed(100)
        subcat_list = [
            subcategory.name
            for category in self.categories_data.categories
            for subcategory in category.subcategories
        ]
        subcat_name_id_mapping = {
            subcategory.name: str(subcategory.subcategory_id)
            for category in self.categories_data.categories
            for subcategory in category.subcategories
        }
        subcat_category_mapping = {
            subcategory.name: str(category.category_id)
            for category in self.categories_data.categories
            for subcategory in category.subcategories
        }
        print(subcat_list)
        print("Sucatgory, name:id, ", subcat_name_id_mapping)
        print("Category, name:id, ", subcat_category_mapping)
        
        for entry in fetched:
            classification: AiClassificationResponse = await self.ai_news_classifier.classify(
                topic=entry.title,
                categories=subcat_list,
                news_description=None,
            )
            print(classification.category)
            if classification.is_valid:
                pinecone_records.append(
                    NewsTitleClassificationRecord(
                        content=entry.title,
                        category_id=subcat_category_mapping[classification.category],
                        subcategory_id=subcat_name_id_mapping[classification.category],
                    )
                )
        await self.pinecone.upsert_records(records=pinecone_records)


async def run_init_pinecone_pipeline(pinecone_client: PineconeServiceAsync):
    category_service: NewsCategoryRepository = NewsCategoryRepository()

    async for session in get_session():
        try:
            categories_data: dict = await category_service.get_categories_data(
                session=session
            )
        except Exception as e:
            logger.error(f"Error Occurred : ", str(e))

    ai_news_classifier: AiNewsClassifierAsync = AiNewsClassifierAsync()
    initializer: PineconeInitializerAsync = PineconeInitializerAsync(
        pinecone=pinecone_client,
        categories_data=categories_data,
        ai_news_classifier=ai_news_classifier,
    )
    await initializer.main_pipeline(
        scrape_from=HackernoonService.create()
    )


async def main():
    pinecone_client: PineconeServiceAsync = await init_pinecone_db_async()
    await run_init_pinecone_pipeline(pinecone_client)


if __name__ == "__main__":
    asyncio.run(main())
