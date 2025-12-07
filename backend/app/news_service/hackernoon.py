import asyncio
from typing import Dict
from datetime import datetime, timezone
from app.news_service.types import (
    ClassifiedCategory,
)
from app.news_service._base import BaseNewsService
from app.news_service.components.scraper import Scraper
from app.news_service.types import HackernoonArticle
from app.database.models.ai_news_service import (
    HackernoonArticles as HackernoonArticleORM,
)
from app.database.main import get_session
from app.config import CONFIG


class InvalidScraper(Exception):
    pass


class HackernoonService(BaseNewsService):
    def __init__(self, scraper: Scraper):
        if not isinstance(scraper, Scraper):
            raise InvalidScraper(
                f"Invalid scraper of type {scraper.__class__}. It must be {Scraper.__class__}"
            )
        super().__init__()
        self.scraper = scraper
    @classmethod
    async def create(cls):
        """Factory method to create Anthropic service instance"""
        scraper = Scraper(
            rss_urls=[CONFIG.HACKERNOON_RSS_URL],
            requires_playwright=True,
        )
        return cls(scraper=scraper)

    def get_orm_model(self):
        return HackernoonArticleORM

    async def to_service_article(
        self,
        entry: Dict,
        classified_category: ClassifiedCategory,
        markdown_content: str | None = None,
    ) -> HackernoonArticle:
        published_parsed = getattr(entry, "published_parsed", None)
        published_time = datetime(*published_parsed[:6], tzinfo=timezone.utc)
        return HackernoonArticle(
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
        hackernoon = await HackernoonService.create()
        print(hackernoon.scraper.rss_urls)

        async for session in get_session():
            await hackernoon.fetch_classify_and_save_articles(
                session=session,
                cutoff_hours=24,
                commit_on_each=True,
                scrape_content=False,
            )

    asyncio.run(main())
