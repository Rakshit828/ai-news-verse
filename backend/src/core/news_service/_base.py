from abc import ABC, abstractmethod
from src.core.ai.models import ClassificationResponse
from typing import Dict, Type
from datetime import datetime, timezone
from src.core.news_service.jina_webscraper import JinaScraper
from src.core.news_service.custom_types import ServiceArticle
from pydantic import BaseModel


class InvalidScraper(Exception):
    pass


class BaseNewsService(ABC):
    """Abstract base class for all news services (Anthropic, Google, OpenAI, etc.)"""

    @property
    @abstractmethod
    def rss_urls(self) -> list[str]:
        pass

    @abstractmethod
    def get_rss_entry_model(self):
        pass

    @classmethod
    @abstractmethod
    def create(cls):
        """Factory method to create service instance with proper configuration"""
        pass

    @abstractmethod
    def get_source(self):
        """Return the news article source for this service"""
        pass

    @abstractmethod
    def fetch_rss_feed(self, cutoff_hours: int = 24) -> list[Dict]:
        pass

    @abstractmethod
    def scrape_url(self, entry: Dict) -> str:
        pass



    def to_service_article(
        self,
        entry: Type[BaseModel],
        classification: ClassificationResponse,
    ) -> ServiceArticle:
        return ServiceArticle(
            **entry.model_dump(),
            source=self.get_source(),
            classification=classification
        )
