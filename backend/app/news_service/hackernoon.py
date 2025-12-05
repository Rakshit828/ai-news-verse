import asyncio
from typing import List, Dict
from datetime import datetime, timezone
from app.news_service.types import (
    ScrapedArticle,
    ClassifiedCategory,
    CategoriesData,
)
from app.news_service._base import BaseNewsService
from app.news_service.utils import classify_category
from app.news_service.scrapers._scraper import Scraper
from app.news_service.types import HackernoonArticle
from app.database.models.ai_news_service import (
    HackernoonArticles as HackernoonArticleORM
)
from app.database.main import AsyncSession, get_session
from app.config import CONFIG

class InvalidScraper(Exception):
    pass


class HackernoonService(BaseNewsService):
    def __init__(self, scraper: Scraper):
        if not isinstance(scraper, Scraper):
            raise InvalidScraper(
                f"Invalid scraper of type {scraper.__class__}. It must be {Scraper.__class__}"
            )
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

    async def entry_to_scraped_article(self, entry: Dict) -> ScrapedArticle:
        try:
            published_parsed = getattr(entry, "published_parsed", None)
            published_time = datetime(*published_parsed[:6], tzinfo=timezone.utc)

            markdown_content = await self.scraper.scrape_url(
                url=entry["link"], content_format="markdown"
            )
            print(f"\n\n The length of markdown is : ", len(markdown_content))

            return ScrapedArticle(
                guid=entry.get("id", ""),
                title=entry.get("title", ""),
                description=entry.get("description", ""),
                published_on=published_time,
                url=entry.get("link", ""),
                markdown_content=markdown_content,
            )

        except Exception as e:
            print(f"Error scraping entry {entry.get('link', 'unknown')}: {e}")
            return None

    async def transform_to_classified_article(
        self, scraped_article: ScrapedArticle, session: AsyncSession
    ) -> HackernoonArticle:
        """Transforms a single scraped article into HackernoonArticle"""
        category_data: CategoriesData = await self.DB_SERVICE.get_categories_data(
            session=session
        )

        category_classified: ClassifiedCategory = await classify_category(
            category_data=category_data.model_dump(), news_title=scraped_article.title
        )

        return HackernoonArticle(
            **scraped_article.model_dump(),
            category=category_classified.category,
            sub_category=(
                category_classified.subcategory
                if category_classified.subcategory_confidence >= 0.5
                else None
            ),
        )

    async def scrape_and_classify(
        self, entry: Dict, session: AsyncSession
    ) -> HackernoonArticle:
        scraped_article: ScrapedArticle = await self.entry_to_scraped_article(
            entry=entry
        )
        if scraped_article is not None:
            hackernoon_article: HackernoonArticle = await self.transform_to_classified_article(
                scraped_article=scraped_article, session=session
            )
            return hackernoon_article
        return None

    async def transform_to_classified_articles(
        self, scraped_articles: List[ScrapedArticle], session: AsyncSession
    ) -> List[HackernoonArticle]:
        """Transforms many scraped articles into HackernoonArticles"""
        hackernoon_articles = []
        for article in scraped_articles:
            hackernoon_article = await self.transform_to_classified_article(
                scraped_article=article, session=session
            )
            hackernoon_articles.append(hackernoon_article)
        return hackernoon_articles

    async def entries_to_scraped_articles(
        self, all_entries: List[Dict]
    ) -> List[ScrapedArticle]:
        """Common logic to convert RSS entries to scraped articles"""
        scraped_articles = []
        for entry in all_entries:
            scraped_article = await self.entry_to_scraped_article(entry=entry)
            if scraped_article is not None:
                scraped_articles.append(scraped_article)
            else:
                continue
        return scraped_articles


if __name__ == "__main__":

    async def main():
        hackernoon = await HackernoonService.create()
        print(hackernoon.scraper.rss_urls)

        async for session in get_session():
            await hackernoon.fetch_and_save_articles(
                session=session, cutoff_hours=24, commit_on_each=True
            )

    asyncio.run(main())
