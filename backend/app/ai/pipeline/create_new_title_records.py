"""This file defines the pipeline for generating the titles and upserting them when new
category or subcategory are added to the database."""

import uuid
import asyncio as aio
from loguru import logger

from app.ai.news_title_generator import NewsTitleGenerator, NewsTitles
from app.ai.pinecone_db import PineconeClient, TitleCategoryRecord, init_pinecone_db


class CreateNewTitleRecordsPipeline:
    def __init__(
        self,
        pinecone: PineconeClient | None = None,
        title_generator: NewsTitleGenerator | None = None,
    ):
        self.pinecone = pinecone 
        self.title_generator = title_generator
    
    @classmethod
    async def create(cls):
        return cls(
            pinecone=await init_pinecone_db(),
            title_generator=NewsTitleGenerator()
        )
    

    async def run_pipeline(self, topic: str, category: str) -> None:
        """Run the generate-upsert pipeline for new subcategory-id given as a topic."""
        exists: bool = await self.pinecone.check_for_subcategory_existence(
            subcategory=topic
        )
        
        if exists:
            logger.info("Subcategory already exists in pinecone. Skipping..")
            return

        titles: NewsTitles = await self.title_generator.generate_news_titles(
            topic=topic, number=3, temperature=0.4
        )
        records: list[TitleCategoryRecord] = [
            {
                "id": str(uuid.uuid4()),
                "title": title,
                "category": category,
                "subcategory": topic,
            }
            for title in titles.titles
        ]
        await self.pinecone.upsert_records(records=records)
        return 


if __name__ == "__main__":

    async def main():
        pipeline = await CreateNewTitleRecordsPipeline.create()
        await pipeline.run_pipeline(topic="transformers", category="technical-ai")

    aio.run(main=main())
