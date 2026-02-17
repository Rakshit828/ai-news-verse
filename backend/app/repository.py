from typing import List, Tuple, Literal
import asyncio
from loguru import logger

from app.db.schemas.ai_news_service import Articles
from app.db.main import AsyncSession
from app.db.dependencies import get_session
from app.services.ai_news_service import NewsDBService
from app.news_service.types import ServiceArticle
from app.news_service.types import MarkdownContent
from app.news_service.sources import (
    OpenAiService,
    AnthropicService,
    GoogleService,
    HackernoonService,
)
from app.ai.pipeline.news_title_classification import (
    VDBCategoryClassifier,
    ClassificationResponse,
)


class InvalidArgument(Exception):
    pass


class NewsRepository:
    def __init__(
        self,
        *,
        db: NewsDBService | None = None,
        classifier: VDBCategoryClassifier | None = None,
        openai: OpenAiService | None = None,
        google: GoogleService | None = None,
        hackernoon: HackernoonService | None = None,
        anthropic: AnthropicService | None = None,
    ):
        self.db: NewsDBService | None = db
        self.classifier: VDBCategoryClassifier | None = classifier
        self.openai: OpenAiService | None = openai
        self.google: GoogleService | None = google
        self.anthropic: AnthropicService | None = anthropic
        self.hackernoon: HackernoonService | None = hackernoon

        self.current_service: (
            OpenAiService | GoogleService | AnthropicService | HackernoonService
        ) = None

    async def check_entry(
        self,
        entry_guid: str,
        source: str,
        session: AsyncSession,
    ):
        check = await self.db.check_guid(
            guid=entry_guid, source=source, session=session
        )
        return False if check is None else True


    async def process_entry(
        self, entry: dict, scrape_content: bool = True, classify: bool = True
    ) -> ServiceArticle:
        """Scrapes the content, classifies it, converts to service article and returns it."""
        markdown_content = None
        classification_response = None
        if scrape_content:
            markdown_content = await self.current_service.scraper.scrape_url(
                url=entry.get("link"), content_format="markdown"
            )
        if classify:
            classification_response: ClassificationResponse = await self.classifier.run(
                title=entry.get("title")
            )
        service_article: ServiceArticle = await self.current_service.to_service_article(
            entry=entry,
            classified_category=classification_response,
            markdown_content=markdown_content,
        )

        return service_article


    async def fetch_classify_and_save_articles(
        self,
        source: Literal["OPENAI", "GOOGLE", "ANTHROPIC", "HACKERNOON"],
        cutoff_hours: int = 24,
        commit_on_each: bool = False,
        scrape_content: bool = True,
        classify: bool = True,
    ) -> int:
        """Main workflow: fetch, classify, and save articles"""
        self.current_service = None
        match source:
            case "ANTHROPIC":
                self.current_service = self.anthropic
            case "GOOGLE":
                self.current_service = self.google
            case "OPENAI":
                self.current_service = self.openai
            case "HACKERNOON":
                self.current_service = self.hackernoon
            case _:
                raise Exception("Invalid Source Input.")

        entries = await self.current_service.scraper.get_entries_from_rss_feed(
            cutoff_hours=cutoff_hours
        )

        if not entries:
            print(f"No new entries found for {self.current_service.__class__.__name__}")
            return 0

        all_guids = {entry.guid for entry in entries}

        async for session in get_session():
            all_exising_guids = await self.db.get_all_guids(
                session=session,
                source=self.current_service.get_source(),
                cutoff_hours=cutoff_hours,
            )

        already_existing = set(all_exising_guids).intersection(all_guids)

        logger.info(f"{len(already_existing)} entires already existed.")

        # This creates all the valid guids to be stored in the db
        entries = [entry for entry in entries if entry.guid not in already_existing]

        logger.info(f"Total entries to be fetched: {len(entries)}")

        if commit_on_each is True:
            no_of_articles = 0
            for entry in entries:
                service_article: ServiceArticle = await self.process_entry(
                    entry=entry, scrape_content=scrape_content, classify=classify
                )
                if service_article is not None:
                    async for session in get_session():
                        await self.db.create_article(article=service_article, session=session)
                        logger.info(f"Article saved: {service_article.title}")
                no_of_articles = no_of_articles + 1
            return no_of_articles

        else:
            
            classified_articles: List[ServiceArticle] = []
            for entry in entries:
                service_article: ServiceArticle = await self.process_entry(
                    entry=entry, scrape_content=scrape_content, classify=classify
                )
                logger.info(f"Article processed: {service_article.title}")

                if service_article is not None:
                    classified_articles.append(service_article)

            if classified_articles:
                async for session in get_session():
                    await self.db.bulk_create_articles(classified_articles, session)

            return len(classified_articles)



async def contruct_google_rss_urls(subcategory_titles: list[str]) -> list[str]:
    """Returns the list of rss urls with categories from database."""
    rss_urls = [
        GoogleService.BASE_URL.format(
            sub_category_query=subcategory_title.replace(" ", "-").lower()
        )
        for subcategory_title in subcategory_titles
    ]
    return rss_urls


async def init_repository() -> NewsRepository:
    db = NewsDBService()
    async for session in get_session():
        subcategory_titles = await db.category_service.get_subcategory_column(
            column="title", session=session
        )

    google_rss_urls: list[str] = await contruct_google_rss_urls(
        subcategory_titles=subcategory_titles
    )

    classifier = await VDBCategoryClassifier.create()
    openai = await OpenAiService.create()
    google = await GoogleService.create(rss_urls=google_rss_urls)
    anthropic = await AnthropicService.create()
    hackernoon = await HackernoonService.create()

    return NewsRepository(
        db=db,
        classifier=classifier,
        openai=openai,
        google=google,
        anthropic=anthropic,
        hackernoon=hackernoon,
    )


if __name__ == "__main__":

    async def main():
        repository: NewsRepository = await init_repository()

        await repository.fetch_classify_and_save_articles(
            source="ANTHROPIC",
            cutoff_hours=1000,
            commit_on_each=True,
            scrape_content=False,
            classify=True,
        )

    asyncio.run(main())
