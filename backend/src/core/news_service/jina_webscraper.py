import requests
from typing import Optional, Literal
from loguru import logger
from src.config import CONFIG
from src.core.news_service.markdown import MarkdownImageExtractor, MarkdownImage



class JinaScraper:
    def __init__(self):
        pass

    def scrape_url(
        self,
        url: str,
        format: Optional[
            Literal["markdown", "html", "default", "screenshot", "pageshot", "text"]
        ] = "default",
        image_summary: Optional[bool] = False,
        user_agent: Optional[str] = None,
    ):
        headers = {
            "Authorization": f"Bearer {CONFIG.JINA_API_KEY}",
        }
        if format != "default":
            headers.update({"X-Return-Format": f"{format}"})
        if image_summary:
            headers.update({"X-Image-Summary": image_summary})
        if user_agent:
            headers.update({"X-User-Agent": user_agent})

        try:
            response = requests.get(f"{CONFIG.JINA_BASE_URL}/{url}", headers=headers)
            response.raise_for_status()
            return response.text

        except Exception as e:
            logger.critical(f"Error during the scraping: {e}")
            raise e

    async def close(self):
        await self._http_client.aclose()


if __name__ == "__main__":
    scraper = JinaScraper()
    markdown = scraper.scrape_url(
        url="https://openai.com/index/introducing-gpt-5-5/",
        format="markdown",
    )
    print("length of markdown : ", len(markdown))
    import sys
    print("Size of markdown in kb: ", sys.getsizeof(markdown) / 1024)

    processor = MarkdownImageExtractor(markdown)
    print(processor.find_by_alt_contains("image"))
    # contenet = processor.remove_images()
    # # print(contenet)

    # print(MarkdownImageExtractor(contenet).extract_all_images())
