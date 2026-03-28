from typing import List, Tuple, Literal
import asyncio
from loguru import logger

from app.db.schemas.ai_news_service import Articles
from app.db.main import AsyncSession
from app.db.dependencies import get_session
from app.services.ai_news_service import NewsDBService
from app.core.news_service.types import ServiceArticle
from app.core.ai.models import ClassificationResponse
from app.core.news_service.sources import (
    OpenAiService,
    AnthropicService,
    GoogleService,
    HackernoonService,
)
from app.core.ai.pipeline import (
    VDBCategoryClassifier,
)
from app.services.notification_system import PubSubSystem
from app.models.ai_news_service import NewNewsNotification


class InvalidArgument(Exception):
    pass


def deduplicate(entries: list[dict]) -> list[dict]:
    seen = set()
    unique_entries = []
    for entry in entries:
        guid = entry["guid"]
        if guid not in seen:
            seen.add(guid)
            unique_entries.append(entry)

    entries = unique_entries
    return entries


def check_for_unique_titles(entries) -> list[dict]:
    # splitting by '-' separte title from source.
    seen = set()
    unique_entries = []
    for entry in entries:
        splitted = entry["title"].split("-")
        if len(splitted) != 1:
            splitted.pop(-1)
        title_without_src = "-".join(splitted).strip()
        if title_without_src not in seen:
            entry["title"] = title_without_src
            seen.add(title_without_src)
            unique_entries.append(entry)

    entries = unique_entries
    return entries


def prepare_messages_for_publishing(
    articles: List[ServiceArticle],
) -> List[NewNewsNotification]:
    news: List[NewNewsNotification] = list()
    for article in articles:
        classification = article.classification
        if len(classification["user_defined"]) == 0:
            classification["user_defined"] = []

        news.extend(
            [
                NewNewsNotification(
                    guid=article.guid,
                    title=article.title,
                    link=article.url,
                    description=article.description,
                    summary=article.summary,
                    source=article.source,
                    category_id=user_defined_cat["category_id"],
                    subcategory_id=user_defined_cat["subcategory_id"],
                )
                for user_defined_cat in classification["user_defined"]
            ]
        )
        news.append(
            NewNewsNotification(
                guid=article.guid,
                title=article.title,
                link=article.url,
                description=article.description,
                summary=article.summary,
                source=article.source,
                category_id=classification["app_defined"]["category_id"],
                subcategory_id=classification["app_defined"]["subcategory_id"],
            )
        )
    return news


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

    def _get_current_service(
        self, source: Literal["OPENAI", "GOOGLE", "ANTHROPIC", "HACKERNOON"]
    ) -> OpenAiService | HackernoonService | GoogleService | AnthropicService:
        mapping = {
            "OPENAI": self.openai,
            "GOOGLE": self.google,
            "ANTHROPIC": self.anthropic,
            "HACKERNOON": self.hackernoon,
        }
        service = mapping.get(source)
        if service is None:
            raise ValueError(f"Invalid value {source} for source=")
        return service

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

    async def _commit_on_each_entries_preprocessor(
        self,
        entries: list[dict],
        pubsub: PubSubSystem,
        scrape_content: bool = False,
        classify: bool = True,
    ) -> int:
        no_of_articles = 0
        for entry in entries:
            service_article: ServiceArticle = await self.process_entry(
                entry=entry, scrape_content=scrape_content, classify=classify
            )
            if service_article is not None:
                async for session in get_session():
                    article: Articles = await self.db.create_article(
                        article=service_article, session=session
                    )
                    logger.info(f"Article saved: {article.title}, GUID: {article.guid}")

                    # Publishing to redis.
                    news_messages: List[NewNewsNotification] = (
                        prepare_messages_for_publishing(articles=[service_article])
                    )
                    await pubsub.publish(news_messages)

            no_of_articles = no_of_articles + 1
        return no_of_articles

    async def _bulk_commit_entries_preproocessor(
        self,
        entries: list[dict],
        pubsub: PubSubSystem,
        scrape_content: bool = False,
        classify: bool = True,
    ) -> int:
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

        news_messages: list[NewNewsNotification] = (
            await self.prepare_messages_for_publishing(articles=classified_articles)
        )
        await pubsub.publish(news_messages)
        return len(classified_articles)

    async def fetch_classify_and_save_articles(
        self,
        source: Literal["OPENAI", "GOOGLE", "ANTHROPIC", "HACKERNOON"],
        pubsub: PubSubSystem | None = None,
        cutoff_hours: int = 24,
        commit_on_each: bool = False,
        scrape_content: bool = True,
        classify: bool = True,
    ) -> int:
        """Main workflow: fetch, classify, and save articles"""
        self.current_service = self._get_current_service(source=source)
        
        if pubsub is None:
            pubsub = PubSubSystem()

        entries: list[dict] = (
            await self.current_service.scraper.get_entries_from_rss_feed(
                cutoff_hours=cutoff_hours
            )
        )

        if not entries:
            print(f"No new entries found for {self.current_service.__class__.__name__}")
            return 0

        # ---- ADD DEDUPLICATION HERE ----
        unique_entries: list[dict] = deduplicate(entries)
        if source == "GOOGLE":
            unique_entries: list[dict] = check_for_unique_titles(unique_entries)
        # --------------------------------

        entries: list[dict] = unique_entries

        all_guids = {entry["guid"] for entry in entries}
        logger.debug(f"Scraped GUIDs: {all_guids}")

        async for session in get_session():
            all_exising_guids = await self.db.get_all_guids(
                session=session,
                source=self.current_service.get_source(),
                cutoff_hours=cutoff_hours,
            )

        already_existing = set(all_exising_guids).intersection(all_guids)

        logger.debug(f"{len(already_existing)} entires already existed.")

        # This creates all the valid guids to be stored in the db
        entries = [entry for entry in entries if entry["guid"] not in already_existing]

        logger.info(f"Total entries to be fetched: {len(entries)}")

        if commit_on_each is True:
            no_of_articles: int = await self._commit_on_each_entries_preprocessor(
                entries=entries,
                pubsub=pubsub,
                scrape_content=scrape_content,
                classify=classify,
            )
            logger.info(f"{no_of_articles} new articles saved and notified.")

        else:
            no_of_articles: int = await self._bulk_commit_entries_preproocessor(
                entries=entries,
                pubsub=pubsub,
                scrape_content=scrape_content,
                classify=classify,
            )
            logger.info(f"{no_of_articles} new articles saved and notified.")


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

        total_articles: int = await repository.fetch_classify_and_save_articles(
            source="ANTHROPIC",
            cutoff_hours=24,
            commit_on_each=True,
            scrape_content=False,
            classify=True,
        )
        logger.debug(f"{total_articles} articles are saved in the DB.")

    asyncio.run(main())
