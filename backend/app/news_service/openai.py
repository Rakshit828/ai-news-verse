import asyncio
from typing import Dict
from datetime import datetime, timezone
from app.config import CONFIG
from app.news_service.types import OpenAiArticle, ClassifiedCategory
from app.news_service._base import BaseNewsService
from app.news_service.components.scraper import Scraper

from app.database.models.ai_news_service import (
    OpenAiArticles as OpenAiArticleORM,
)
from app.database.main import AsyncSession, get_session


class InvalidScraper(Exception):
    pass


class OpenAiService(BaseNewsService):

    def __init__(self, scraper: Scraper):
        if not isinstance(scraper, Scraper):
            raise InvalidScraper()
        super().__init__()
        self.scraper = scraper

    @classmethod
    async def create(cls):
        """Factory method to create Anthropic service instance"""
        scraper = Scraper(
            rss_urls=[url for url in CONFIG.OPENAI_RSS_URLS.split(",")],
            requires_playwright=True,
        )
        return cls(scraper=scraper)

    def get_orm_model(self):
        return OpenAiArticleORM

    async def to_service_article(
        self,
        entry: Dict,
        classified_category: ClassifiedCategory,
        markdown_content: str | None = None,
    ) -> OpenAiArticle:
        published_parsed = getattr(entry, "published_parsed", None)
        published_time = datetime(*published_parsed[:6], tzinfo=timezone.utc)
        return OpenAiArticle(
            guid=entry.get("guid") or entry.get("id"),
            url=entry.get('link'),
            title=entry.get("title"),
            description=entry.get("description"),
            category=classified_category.category,
            published_on=published_time,
            sub_category=(
                classified_category.subcategory
                if classified_category.subcategory is not None
                else None
            ),
            markdown_content=markdown_content if markdown_content is not None else None,
        )


if __name__ == "__main__":

    async def main():
        openai = await OpenAiService.create()
        async for session in get_session():
            await openai.fetch_classify_and_save_articles(
                session=session,
                cutoff_hours=48,
                commit_on_each=True,
                scrape_content=False,
            )

    asyncio.run(main())
