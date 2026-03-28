from src.config import CONFIG
from src.core.news_service._base import BaseNewsService, InvalidScraper
from src.core.news_service.components.scraper import Scraper

from src.db.schemas.ai_news_service import Source



class OpenAiService(BaseNewsService):

    def __init__(self, scraper: Scraper):
        if not isinstance(scraper, Scraper):
            raise InvalidScraper()
        super().__init__()
        self.scraper = scraper

    @classmethod
    def create(cls):
        """Factory method to create Anthropic service instance"""
        scraper = Scraper(
            rss_urls=[url for url in CONFIG.OPENAI_RSS_URLS.split(",")],
            requires_playwright=True,
        )
        return cls(scraper=scraper)

    def get_source(self):
        return Source.OPENAI.value



class HackernoonService(BaseNewsService):
    def __init__(self, scraper: Scraper):
        if not isinstance(scraper, Scraper):
            raise InvalidScraper(
                f"Invalid scraper of type {scraper.__class__}. It must be {Scraper.__class__}"
            )
        super().__init__()
        self.scraper = scraper
        
    @classmethod
    def create(cls):
        """Factory method to create Anthropic service instance"""
        scraper = Scraper(
            rss_urls=[CONFIG.HACKERNOON_RSS_URL],
            requires_playwright=True,
        )
        return cls(scraper=scraper)

    def get_source(self):
        return Source.HACKERNOON.value



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
    def create(cls, rss_urls: list[str]):
        """Factory method to create Google service instance"""
        scraper = Scraper(
            rss_urls=rss_urls,
            requires_playwright=True,
        )
        return cls(scraper=scraper)


    def get_source(self):
        return Source.GOOGLE.value




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

    def get_source(self):
        return Source.ANTHROPIC.value

