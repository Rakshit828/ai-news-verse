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
from app.news_service.types import GoogleArticle
from app.database.models.ai_news_service import (
    GoogleArticles as GoogleArticleORM,
)
from app.database.main import AsyncSession, get_session


class InvalidScraper(Exception):
    pass


class GoogleService(BaseNewsService):

    BASE_URL = "https://news.google.com/rss/search?q={sub_category_query}"

    def __init__(self, scraper: Scraper):
        if not isinstance(scraper, Scraper):
            raise InvalidScraper(
                f"Invalid scraper of type {scraper.__class__}. It must be {Scraper.__class__}"
            )
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
    ) -> GoogleArticle:
        """Transforms a single scraped article into GoogleArticle"""
        category_data: CategoriesData = await self.DB_SERVICE.get_categories_data(
            session=session
        )

        category_classified: ClassifiedCategory = await classify_category(
            category_data=category_data.model_dump(), news_title=scraped_article.title
        )

        return GoogleArticle(
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
    ) -> GoogleArticle:
        scraped_article: ScrapedArticle = await self.entry_to_scraped_article(
            entry=entry
        )
        if scraped_article is not None:
            google_article: GoogleArticle = await self.transform_to_classified_article(
                scraped_article=scraped_article, session=session
            )
            return google_article
        return None

    async def transform_to_classified_articles(
        self, scraped_articles: List[ScrapedArticle], session: AsyncSession
    ) -> List[GoogleArticle]:
        """Transforms many scraped articles into GoogleArticles"""
        google_articles = []
        for article in scraped_articles:
            google_article = await self.transform_to_classified_article(
                scraped_article=article, session=session
            )
            google_articles.append(google_article)
        return google_articles

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
        google = await GoogleService.create()
        print(google.scraper.rss_urls)

        async for session in get_session():
            await google.fetch_and_save_articles(
                session=session, cutoff_hours=24, commit_on_each=True
            )

    asyncio.run(main())
