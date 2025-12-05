import asyncio
from typing import List, Dict
from datetime import datetime, timezone
from app.config import CONFIG
from app.news_service.types import (
    ScrapedArticle,
    AnthropicArticle,
    ClassifiedCategory,
    CategoriesData,
)
from app.news_service._base import BaseNewsService
from app.news_service.utils import classify_category
from app.news_service.scrapers._scraper import Scraper

from app.database.models.ai_news_service import (
    AnthropicArticles as AnthropicArticleORM,
)
from app.database.main import AsyncSession, get_session


class InvalidScraper(Exception):
    pass


class AnthropicService(BaseNewsService):

    def __init__(self, scraper: Scraper):
        if not isinstance(scraper, Scraper):
            raise InvalidScraper()
        self.scraper = scraper

    @classmethod
    def create(cls):
        """Factory method to create Anthropic service instance"""
        scraper = Scraper(
            rss_urls=[url for url in CONFIG.ANTHROPIC_RSS_URLS.split(",")],
            requires_playwright=False,
        )
        return cls(scraper=scraper)

    def get_orm_model(self):
        return AnthropicArticleORM
    
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
    ) -> AnthropicArticle:
        """Transforms a single scraped article into AnthropicArticle"""
        category_data: CategoriesData = await self.DB_SERVICE.get_categories_data(
            session=session
        )

        category_classified: ClassifiedCategory = await classify_category(
            category_data=category_data.model_dump(), news_title=scraped_article.title
        )

        return AnthropicArticle(
            **scraped_article.model_dump(),
            category=category_classified.category,
            sub_category=category_classified.subcategory,
        )

    async def scrape_and_classify(
        self, entry: Dict, session: AsyncSession
    ) -> AnthropicArticle:
        scraped_article: ScrapedArticle = await self.entry_to_scraped_article(
            entry=entry
        )
        if scraped_article is not None:
            anthropic_article: AnthropicArticle = await self.transform_to_classified_article(
                scraped_article=scraped_article, session=session
            )
            return anthropic_article 
        return None


if __name__ == "__main__":

    async def main():
        anthropic = AnthropicService.create()

        async for session in get_session():
            await anthropic.fetch_and_save_articles(session=session, cutoff_hours=48, commit_on_each=True)

    asyncio.run(main())
