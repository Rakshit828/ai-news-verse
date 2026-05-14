from src.config import CONFIG
from src.services.news_service._base import BaseNewsService, InvalidScraper
from src.db.schemas import Source
from src.services.news_service.jina_webscraper import JinaScraper
from src.services.news_service.type import (
    OpenAIScrapedData,
    AnthropicScrapedData,
    HackerNoonScrapedData,
    GoogleScrapedData,
)
from src.services.news_service.markdown import MarkdownImageExtractor
from datetime import datetime, timedelta, timezone
import feedparser
from loguru import logger


class OpenAiService(BaseNewsService):
    def __init__(
        self, scraper: JinaScraper, markdown_processor: MarkdownImageExtractor
    ):
        if not isinstance(scraper, JinaScraper):
            raise InvalidScraper()
        super().__init__()
        self.scraper = scraper
        self.markdown_processor = markdown_processor

    @property
    def rss_urls(self) -> list[str]:
        return [url for url in CONFIG.OPENAI_RSS_URLS.split(",")]

    def get_rss_entry_model(self):
        return OpenAIScrapedData

    @classmethod
    def create(cls):
        """Factory method to create Anthropic service instance"""
        scraper = JinaScraper()
        markdown_processor = MarkdownImageExtractor("raw_markdown_content")
        return cls(scraper=scraper, markdown_processor=markdown_processor)

    def get_source(self):
        return Source.OPENAI.value

    def scrape_url(self, scraped_entry: OpenAIScrapedData) -> OpenAIScrapedData:
        """Scrapes the entry url for content and image if available and updates the entry."""
        scraped_full_markdown = self.scraper.scrape_url(
            url=scraped_entry.link, format="markdown"
        )
        self.markdown_processor.set_markdown(scraped_full_markdown)
        markdown_content = self.markdown_processor.remove_images()
        featured_image = self.markdown_processor.find_by_alt_contains("image")

        scraped_entry.markdown_content = markdown_content
        scraped_entry.featured_image = featured_image[0].url if featured_image else None
        return scraped_entry

    def fetch_rss_feed(self, cutoff_hours: int = 24) -> list[OpenAIScrapedData]:
        """Returns the list of the entries from rss feed"""
        all_entries = list()
        now = datetime.now(timezone.utc)
        cutoff_time = now - timedelta(hours=cutoff_hours)
        seen_guids = set()
        for rss_url in self.rss_urls:
            feed = feedparser.parse(rss_url)

            if not feed.entries:
                continue

            for entry in feed.entries:
                published_parsed = getattr(entry, "published_parsed", None)
                if not published_parsed:
                    continue

                published_time = datetime(*published_parsed[:6], tzinfo=timezone.utc)
                if published_time >= cutoff_time:
                    guid = entry.get("id", None)
                    if guid not in seen_guids:
                        all_entries.append(
                            OpenAIScrapedData(
                                id=entry.get("id"),
                                title=entry.get("title"),
                                link=entry.get("link"),
                                published_time=published_time,
                            )
                        )
                        seen_guids.add(guid)

        logger.info(f"Total entries in given cutoff is : {len(all_entries)}")

        return all_entries


class HackernoonService(BaseNewsService):
    def __init__(
        self, scraper: JinaScraper, markdown_processor: MarkdownImageExtractor
    ):
        if not isinstance(scraper, JinaScraper):
            raise InvalidScraper()
        super().__init__()
        self.scraper = scraper
        self.markdown_processor = markdown_processor

    @property
    def rss_urls(self) -> list[str]:
        return [CONFIG.HACKERNOON_RSS_URL]

    def get_rss_entry_model(self):
        return HackerNoonScrapedData

    @classmethod
    def create(cls):
        """Factory method to create Hackernoon service instance"""
        scraper = JinaScraper()
        markdown_processor = MarkdownImageExtractor("raw_markdown_content")
        return cls(scraper=scraper, markdown_processor=markdown_processor)

    def get_source(self):
        return Source.HACKERNOON.value

    def scrape_url(self, scraped_entry: HackerNoonScrapedData) -> HackerNoonScrapedData:
        """Scrapes the entry url for content and image if available and updates the entry."""
        scraped_full_markdown = self.scraper.scrape_url(
            url=scraped_entry.link, format="markdown"
        )
        self.markdown_processor.set_markdown(scraped_full_markdown)
        markdown_content = self.markdown_processor.remove_images()
        featured_image = self.markdown_processor.find_by_alt_contains("featured image")

        scraped_entry.markdown_content = markdown_content
        scraped_entry.featured_image = featured_image[0].url if featured_image else None
        return scraped_entry

    def fetch_rss_feed(self, cutoff_hours: int = 24) -> list[HackerNoonScrapedData]:
        """Returns the list of the entries from rss feed"""
        all_entries = list()
        now = datetime.now(timezone.utc)
        cutoff_time = now - timedelta(hours=cutoff_hours)
        seen_guids = set()
        for rss_url in self.rss_urls:
            feed = feedparser.parse(rss_url)

            if not feed.entries:
                continue

            for entry in feed.entries:
                published_parsed = getattr(entry, "published_parsed", None)
                if not published_parsed:
                    continue

                published_time = datetime(*published_parsed[:6], tzinfo=timezone.utc)
                if published_time >= cutoff_time:
                    guid = entry.get("id", None)
                    if guid not in seen_guids:
                        all_entries.append(
                            HackerNoonScrapedData(
                                id=entry.get("id"),
                                title=entry.get("title"),
                                author=entry.get("author"),
                                link=entry.get("link"),
                                published_time=published_time,
                            )
                        )
                        seen_guids.add(guid)

        logger.info(f"Total entries in given cutoff is : {len(all_entries)}")

        return all_entries


class GoogleService(BaseNewsService):

    BASE_URL = "https://news.google.com/rss/search?q={sub_category_query}"

    def __init__(
        self,
        scraper: JinaScraper,
        markdown_processor: MarkdownImageExtractor,
        rss_urls: list[str],
    ):
        if not isinstance(scraper, JinaScraper):
            raise InvalidScraper()
        super().__init__()
        self.scraper = scraper
        self.markdown_processor = markdown_processor
        self._rss_urls = rss_urls

    @classmethod
    def create(cls, rss_urls: list[str]):
        """Factory method to create Hackernoon service instance"""
        scraper = JinaScraper()
        markdown_processor = MarkdownImageExtractor("raw_markdown_content")
        return cls(
            scraper=scraper, markdown_processor=markdown_processor, rss_urls=rss_urls
        )

    @property
    def rss_urls(self) -> list[str]:
        return self._rss_urls

    def get_rss_entry_model(self):
        return GoogleScrapedData

    def get_source(self):
        return Source.GOOGLE.value

    def scrape_url(self, scraped_entry: GoogleScrapedData) -> GoogleScrapedData:
        """Scrapes the entry url for content and image if available and updates the entry."""
        scraped_full_markdown = self.scraper.scrape_url(
            url=scraped_entry.link, format="markdown"
        )
        self.markdown_processor.set_markdown(scraped_full_markdown)
        markdown_content = self.markdown_processor.remove_images()
        featured_image = self.markdown_processor.find_by_alt_contains("image")

        scraped_entry.markdown_content = markdown_content
        scraped_entry.featured_image = featured_image[0].url if featured_image else None
        return scraped_entry

    def fetch_rss_feed(self, cutoff_hours: int = 24) -> list[GoogleScrapedData]:
        """Returns the list of the entries from rss feed"""
        all_entries = list()
        now = datetime.now(timezone.utc)
        cutoff_time = now - timedelta(hours=cutoff_hours)
        seen_guids = set()
        for rss_url in self.rss_urls:
            rss_url = rss_url.replace(" ", "-")

            logger.info(f"url is : {rss_url}")
            
            feed = feedparser.parse(rss_url)

            if not feed.entries:
                continue

            for entry in feed.entries:
                published_parsed = getattr(entry, "published_parsed", None)
                if not published_parsed:
                    continue

                published_time = datetime(*published_parsed[:6], tzinfo=timezone.utc)
                if published_time >= cutoff_time:
                    guid = entry.get("id", None)
                    if guid not in seen_guids:

                        all_entries.append(
                            GoogleScrapedData(
                                id=entry.get("id"),
                                title=entry.get("title"),
                                link=entry.get("link"),
                                news_source=entry.get("source"),
                                published_time=published_time,
                                category=rss_url.split("q=")[1],
                            )
                        )
                        seen_guids.add(guid)

        logger.info(f"Total entries in given cutoff is : {len(all_entries)}")

        return all_entries



class AnthropicService(BaseNewsService):
    def __init__(
        self, scraper: JinaScraper, markdown_processor: MarkdownImageExtractor
    ):
        if not isinstance(scraper, JinaScraper):
            raise InvalidScraper()
        super().__init__()
        self.scraper = scraper
        self.markdown_processor = markdown_processor

    @property
    def rss_urls(self) -> list[str]:
        return [url for url in CONFIG.ANTHROPIC_RSS_URLS.split(",")]

    def get_rss_entry_model(self):
        return AnthropicScrapedData

    @classmethod
    def create(cls):
        """Factory method to create Anthropic service instance"""
        scraper = JinaScraper()
        markdown_processor = MarkdownImageExtractor("raw_markdown_content")
        return cls(scraper=scraper, markdown_processor=markdown_processor)

    def get_source(self):
        return Source.ANTHROPIC.value

    def scrape_url(self, scraped_entry: AnthropicScrapedData) -> AnthropicScrapedData:
        """Scrapes the entry url for content and image if available and updates the entry."""
        scraped_full_markdown = self.scraper.scrape_url(
            url=scraped_entry.link, format="markdown"
        )
        self.markdown_processor.set_markdown(scraped_full_markdown)
        markdown_content = self.markdown_processor.remove_images()
        featured_image = self.markdown_processor.find_by_alt_contains("image")

        scraped_entry.markdown_content = markdown_content
        scraped_entry.featured_image = featured_image[0].url if featured_image else None
        return scraped_entry

    def fetch_rss_feed(
        self, cutoff_hours: int = 24, scrape_content: bool = True
    ) -> list[AnthropicScrapedData]:
        """Returns the list of the entries from rss feed of anthropic"""
        all_entries = list()
        now = datetime.now(timezone.utc)
        cutoff_time = now - timedelta(hours=cutoff_hours)
        seen_guids = set()
        for rss_url in self.rss_urls:
            feed = feedparser.parse(rss_url)

            if not feed.entries:
                continue

            for entry in feed.entries:
                published_parsed = getattr(entry, "published_parsed", None)
                if not published_parsed:
                    continue

                published_time = datetime(*published_parsed[:6], tzinfo=timezone.utc)
                if published_time >= cutoff_time:
                    guid = entry.get("id", None)
                    if guid not in seen_guids:

                        all_entries.append(
                            AnthropicScrapedData(
                                id=entry.get("id"),
                                title=entry.get("title"),
                                description=entry.get("summary"),
                                link=entry.get("link"),
                                published_time=published_time,
                            )
                        )
                        seen_guids.add(guid)

        logger.info(f"Total entries in given cutoff is : {len(all_entries)}")

        return all_entries
