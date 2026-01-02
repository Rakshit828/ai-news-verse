from abc import ABC, abstractmethod

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


