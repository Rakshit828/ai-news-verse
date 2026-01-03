from typing import Dict
from datetime import datetime, timezone
from app.config import CONFIG
from app.news_service.types import (
    AnthropicArticle,
    ClassifiedCategory,
)
from app.news_service._base import BaseNewsService
from app.news_service.components.scraper import Scraper

from app.db.models.ai_news_service import Source


class InvalidScraper(Exception):
    pass


class AnthropicService(BaseNewsService):

    def __init__(self, scraper: Scraper):
        if not isinstance(scraper, Scraper):
            raise InvalidScraper()
        self.scraper = scraper

    @classmethod
    async def create(cls):
        """Factory method to create Anthropic service instance"""
        scraper = Scraper(
            rss_urls=[url for url in CONFIG.ANTHROPIC_RSS_URLS.split(",")],
            requires_playwright=False,
        )
        return cls(scraper=scraper)

    def get_source(self):
        return Source.ANTHROPIC.value

    async def to_service_article(
        self,
        entry: Dict,
        classified_category: ClassifiedCategory,
        markdown_content: str | None = None,
    ) -> AnthropicArticle:
        published_parsed = getattr(entry, "published_parsed", None)
        published_time = datetime(*published_parsed[:6], tzinfo=timezone.utc)
        return AnthropicArticle(
            guid=entry.get("guid") or entry.get("id"),
            title=entry.get("title"),
            url=entry.get('link'),
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

