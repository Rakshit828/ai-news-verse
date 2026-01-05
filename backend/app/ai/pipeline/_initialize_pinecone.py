"""This file contains the initial pineline to be triggerred to store the data in pinecone."""

import asyncio
from loguru import logger

from app.ai.components.pinecone_db import init_pinecone_db, PineconeClient
from app.ai.models import TitleCategoryRecord
from app.repository import init_repository, NewsRepository
from app.db.main import get_session

# groq.RateLimitError: Error code: 429 - {'error': {'message': 'Rate limit reached for model `openai/gpt-oss-120b` in organization `org_01jzf764c7eenssycd98hwa9zr` service tier `on_demand` on tokens per day (TPD): Limit 200000, Used 199682, Requested 672. Please try again in 2m32.928s. Need more tokens? Upgrade to Dev Tier today at https://console.groq.com/settings/billing', 'type': 'tokens', 'code': 'rate_limit_exceeded'}}

async def main_pipeline():

    logger.critical("Run only once, data might be duplicated in pinecone db.")

    choice = input("Do you want to proceed?(y/n): ")

    if choice.lower() != 'y':
        return

    repository: NewsRepository = await init_repository()
    pinecone: PineconeClient = await init_pinecone_db()

    async for session in get_session():
        await repository.fetch_classify_and_save_articles(
            session=session, source='GOOGLE', cutoff_hours=48, commit_on_each=True, scrape_content=False
        )
        await repository.fetch_classify_and_save_articles(
            session=session, source='OPENAI', cutoff_hours=48, commit_on_each=True, scrape_content=False
        )
        await repository.fetch_classify_and_save_articles(
            session=session, source='ANTHROPIC', cutoff_hours=48, commit_on_each=True, scrape_content=False
        )
        await repository.fetch_classify_and_save_articles(
            session=session, source='HACKERNOON', cutoff_hours=48, commit_on_each=True, scrape_content=False
        )

        pinecone_records: list[TitleCategoryRecord] = await repository.db.get_records_for_pinecone(session=session)
        
    await pinecone.upsert_records(records=pinecone_records)


if __name__ == "__main__":
    asyncio.run(main_pipeline())