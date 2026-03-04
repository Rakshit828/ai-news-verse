"""This file contains the initial pineline to be triggerred to store the data in pinecone."""

import asyncio
from loguru import logger
import sqlalchemy.exc as exc
import uuid

from app.core.ai.components import init_pinecone_db, PineconeClient
from app.core.ai.models import (
    PrimaryCategoryRecord,
    TopicKeywordRecord,
)
from app.services.ai_news_service import CategoriesDBService
from app.db.dependencies import get_session
from app.constants import (
    PINECONE_APPLICATION_CATEGORY_NAMESPACE,
    PINECONE_CANONICAL_TOPIC_NAMESPACE,
)
from app.core.ai.components import (
    TopicDescriptionGenerator,
    TopicDescription,
    CanonicalName,
)
from app.models.ai_news_service import ResponseCategoryDataModel


class PineconeInitializer:
    def __init__(
        self,
        pinecone: PineconeClient,
        categories_data: ResponseCategoryDataModel,
        topic_description_generator: TopicDescriptionGenerator,
    ):
        self.pinecone = pinecone
        self.categories_data = categories_data
        self.topic_description_generator = topic_description_generator

    async def main_pipeline(self):

        logger.critical("Run only once, data might be duplicated in pinecone db.")

        choice = input("Do you want to proceed?(y/n): ")

        if choice.lower() != "y":
            return

        pinecone_records: list[PrimaryCategoryRecord] = []
        canonical_topics_records: list[TopicKeywordRecord] = []
        subcategories: list[str] = [
            subcategory.title
            for category in self.categories_data.categories_data
            for subcategory in category.subcategories
        ]
        for category in self.categories_data.categories_data:
            canonical_name: CanonicalName = (
                await self.topic_description_generator.generate_canonical_name(
                    topic=category.title
                )
            )
            canonical_topics_records.append(
                TopicKeywordRecord(
                    id=str(uuid.uuid4()),
                    content=canonical_name.canonical_name,
                    category_id=str(category.category_id),
                )
            )
            for subcategory in category.subcategories:
                subcategories.remove(subcategory.title)
                await asyncio.sleep(3)

                topic_description: TopicDescription = (
                    await self.topic_description_generator.generate_topic_description(
                        topic=subcategory.title, other_topics=subcategories
                    )
                )
                subcategories.append(subcategory.title)
                pinecone_records.append(
                    PrimaryCategoryRecord(
                        _id=str(uuid.uuid4()),
                        topic=topic_description.canonical_name,
                        content=topic_description.description,
                        category_id=str(category.category_id),
                        subcategory_id=str(subcategory.subcategory_id),
                    )
                )
                canonical_topics_records.append(
                    TopicKeywordRecord(
                        id=str(uuid.uuid4()),
                        content=topic_description.canonical_name,
                        category_id=str(category.category_id),
                        subcategory_id=str(subcategory.subcategory_id),
                    )
                )

        await self.pinecone.upsert_records(
            records=pinecone_records, upsert_in=PINECONE_APPLICATION_CATEGORY_NAMESPACE
        )
        await self.pinecone.upsert_records(
            records=canonical_topics_records,
            upsert_in=PINECONE_CANONICAL_TOPIC_NAMESPACE,
        )


if __name__ == "__main__":

    async def main():
        category_service: CategoriesDBService = CategoriesDBService()

        async for session in get_session():
            try:
                categories_data: ResponseCategoryDataModel = (
                    await category_service.get_categories_data(session=session)
                )
            except Exception as e:
                logger.error(f"Error Occurred : ", str(e))

        pinecone: PineconeClient = await init_pinecone_db()
        topic_description_generator: TopicDescriptionGenerator = (
            TopicDescriptionGenerator()
        )

        initializer: PineconeInitializer = PineconeInitializer(
            pinecone=pinecone,
            categories_data=categories_data,
            topic_description_generator=topic_description_generator,
        )
        await initializer.main_pipeline()

    asyncio.run(main())
