import asyncio
from typing import Dict
from datetime import datetime, timezone
from app.news_service.types import (
    ClassifiedCategory,
)
from app.news_service._base import BaseNewsService, InvalidScraper
from app.news_service.components.scraper import Scraper
from app.news_service.types import HackernoonArticle

from app.db.models.ai_news_service import Source
from app.config import CONFIG



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

    def get_source(self):
        return Source.HACKERNOON.value

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

