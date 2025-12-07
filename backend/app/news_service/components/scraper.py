import asyncio
import feedparser
from typing import List, Literal, Optional, Dict, Any
from playwright.async_api import async_playwright
from datetime import datetime, timedelta, timezone
from docling.datamodel.base_models import InputFormat
from docling.document_converter import DocumentConverter

from app.news_service.components._playwright_scraper import run_playwright


class RSSFeedNotAvailable(Exception):
    pass

class DoNotRequiresPlaywright(Exception):
    pass

class CannotGetContent(Exception):
    pass


class Scraper:
    converter = DocumentConverter()

    def __init__(self, rss_urls: list[str], requires_playwright: bool):
        self.rss_urls = rss_urls
        self.requires_playwright = requires_playwright

    async def _scrape_html_using_playwright(self, url: str):
        if self.requires_playwright is False:
            raise DoNotRequiresPlaywright()
        async with async_playwright() as playwright:
            data = await run_playwright(playwright, url)
            html = data["html"]
            return html

    async def get_entries_from_rss_feed(self, cutoff_hours: int = 24) -> List[Dict]:
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
                    guid = entry.get("id", entry.get("link", ""))
                    if guid not in seen_guids:
                        all_entries.append(entry)
        print("The total entries in given cutoff is : ", len(all_entries))
        return all_entries

    async def scrape_url(
        self, url: str, content_format: Literal["markdown", "text"] = "markdown"
    ) -> Optional[str]:
        """Handles the scraping of the given url and its parsing too into various formats like markdown, text etc."""
        try:

            if self.requires_playwright is True:
                html = await self._scrape_html_using_playwright(url=url)

                result = self.converter.convert_string(
                    content=html, format=InputFormat.HTML, name="openai.html"
                )
                docling_doc = result.document
            else:
                result = self.converter.convert(source=url)
                docling_doc = result.document

            match content_format:
                case "markdown":
                    markdown_content = docling_doc.export_to_markdown()
                    return markdown_content
                case "text":
                    text_content = docling_doc.export_to_text()
                    return text_content

        except Exception:
            raise CannotGetContent("Error during getting of the content")


if __name__ == '__main__':
    async def main():
        scraper = Scraper(rss_urls=['sdaf'], requires_playwright=True)
        result = await scraper.scrape_url(url='https://hackernoon.com/meet-toon-the-format-helping-llms-shed-jsons-extra-weight?source=rss')
        print("The result is : ", result, type(result))
    asyncio.run(main())