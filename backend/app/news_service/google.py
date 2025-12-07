import asyncio
from typing import List, Dict
from datetime import datetime, timezone
from app.news_service.types import (
    ClassifiedCategory,
)
from app.news_service._base import BaseNewsService
from app.news_service.components.scraper import Scraper
from app.news_service.types import GoogleArticle
from app.database.models.ai_news_service import (
    GoogleArticles as GoogleArticleORM,
)
from app.database.main import get_session


class InvalidScraper(Exception):
    pass


class GoogleService(BaseNewsService):

    BASE_URL = "https://news.google.com/rss/search?q={sub_category_query}"

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
        rss_urls = await cls._construct_rss_urls()
        scraper = Scraper(
            rss_urls=rss_urls,
            requires_playwright=True,
        )
        return cls(scraper=scraper)

    @classmethod
    async def _construct_rss_urls(cls) -> List[str]:
        """Returns the list of rss urls with categories from database."""
        async for session in get_session():
            sub_cat_ids: List[str] = await cls.DB_SERVICE.get_subcategory_column(
                column="subcategory_id", session=session
            )
            rss_urls = [
                cls.BASE_URL.format(sub_category_query=sub_cat_id)
                for sub_cat_id in sub_cat_ids
            ]
            print("RSS URLS ARE : ", rss_urls)
            return rss_urls

    def get_orm_model(self):
        return GoogleArticleORM

    async def to_service_article(
        self,
        entry: Dict,
        classified_category: ClassifiedCategory,
        markdown_content: str | None = None,
    ) -> GoogleArticle:
        published_parsed = getattr(entry, "published_parsed", None)
        published_time = datetime(*published_parsed[:6], tzinfo=timezone.utc)
        return GoogleArticle(
            guid=entry.get("guid"),
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
        google = await GoogleService.create()
        print(google.scraper.rss_urls)

        async for session in get_session():
            await google.fetch_classify_and_save_articles(
                session=session,
                cutoff_hours=24,
                commit_on_each=True,
                scrape_content=False,
            )

    asyncio.run(main())
