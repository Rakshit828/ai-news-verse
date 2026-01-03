"""This file contains the initial pineline to be triggerred to store the data in pinecone."""

import asyncio

from app.ai.pinecone_db import init_pinecone_db, PineconeClient
from app.repository import init_repository, NewsRepository
from app.db.main import get_session



async def main():
    repository: NewsRepository = await init_repository()
    pinecone: PineconeClient = await init_pinecone_db()
    async for session in get_session():
        await repository.fetch_classify_and_save_articles(
            session=session, source='GOOGLE', cutoff_hours=48, commit_on_each=True, scrape_content=False
        )
    


if __name__ == "__main__":
    asyncio.run(main())