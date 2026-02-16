from abc import ABC, abstractmethod
from app.ai.models import ClassificationResponse
from typing import Dict
from app.news_service.types import ServiceArticle
from datetime import datetime, timezone


class InvalidScraper(Exception):
    pass

class BaseNewsService(ABC):
    """Abstract base class for all news services (Anthropic, Google, OpenAI, etc.)"""

    @classmethod
    @abstractmethod
    def create(cls):
        """Factory method to create service instance with proper configuration"""
        pass

    @abstractmethod
    def get_source(self):
        """Return the news article source for this service"""
        pass

    async def to_service_article(
        self,
        entry: Dict,
        classified_category: ClassificationResponse,
        markdown_content: str | None = None,
    ) -> ServiceArticle:
        published_parsed = getattr(entry, "published_parsed", None)
        published_time = datetime(*published_parsed[:6], tzinfo=timezone.utc)
        return ServiceArticle(
            guid=entry.get("guid") or entry.get("id"),
            title=entry.get("title"),
            url=entry.get('link'),
            description=entry.get("description"),
            source=self.get_source(),
            published_on=published_time,
            classification=classified_category,
            markdown_content=markdown_content if markdown_content is not None else None,
        )


