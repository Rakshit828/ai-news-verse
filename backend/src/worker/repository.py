from typing import List, Tuple, Literal, Union
from loguru import logger

from src.db.schemas.ai_news_service import Articles
from src.worker.db import GetLocalSession
from sqlalchemy.orm import Session
from src.worker.news_service import WorkerNewsService
from src.core.news_service.custom_types import (
    ServiceArticle,
    ScrapedData,
    GoogleScrapedData,
)
from src.core.ai.models import ClassificationResponse
from src.core.news_service.sources import (
    OpenAiService,
    AnthropicService,
    GoogleService,
    HackernoonService,
)
from src.core.ai.pipeline import VDBCategoryClassifierSync
from src.core.notification_system import CeleryPublisher
from src.domains.news.models import NewNewsNotification


class InvalidArgument(Exception):
    pass


def check_for_unique_titles(
    entries: list[GoogleScrapedData],
) -> list[GoogleScrapedData]:
    """Checks for unique titles. Only for google scraped data. Since they have multiple sources."""
    # splitting by '-' separte title from source.
    seen = set()
    unique_entries = []
    for entry in entries:
        splitted = entry.title.split("-")
        if len(splitted) != 1:
            splitted.pop(-1)
        title_without_src = "-".join(splitted).strip()
        if title_without_src not in seen:
            entry.title = title_without_src
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
        db: WorkerNewsService | None = None,
        classifier: VDBCategoryClassifierSync | None = None,
        openai: OpenAiService | None = None,
        google: GoogleService | None = None,
        hackernoon: HackernoonService | None = None,
        anthropic: AnthropicService | None = None,
    ):
        self.db: WorkerNewsService | None = db
        self.classifier: VDBCategoryClassifierSync | None = classifier
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
        session: Session,
    ):
        check = await self.db.check_guid(
            guid=entry_guid, source=source, session=session
        )
        return False if check is None else True

    def scrape_url_and_classify(
        self,
        entry: ScrapedData,
        scrape_content: bool = True,
        classify: bool = True,
    ) -> ServiceArticle:
        if scrape_content:
            entry: ScrapedData = self.current_service.scrape_url(scraped_entry=entry)
        if classify:
            classification: ClassificationResponse = self.classifier.run(
                title=entry.title
            )

        service_article: ServiceArticle = self.current_service.to_service_article(
            entry=entry,
            classification=classification,
        )
        return service_article

    def _commit_on_each_entries_preprocessor(
        self,
        entries: list[ScrapedData],
        pubsub: CeleryPublisher,
        scrape_content: bool = True,
        classify: bool = True,
    ) -> int:
        no_of_articles = 0
        for entry in entries:
            service_article: ServiceArticle = self.scrape_url_and_classify(
                entry=entry,
                scrape_content=scrape_content,
                classify=classify,
            )
            logger.info(f"Article processed: {service_article.title}")

            if service_article is not None:
                with GetLocalSession() as session:
                    article: Articles = self.db.create_article(
                        article=service_article, session=session
                    )
                    logger.info(f"Article saved: {article.title}, GUID: {article.guid}")

                # Publishing to redis.
                news_messages: List[NewNewsNotification] = (
                    prepare_messages_for_publishing(articles=[service_article])
                )
                pubsub.publish(news_messages)

            no_of_articles = no_of_articles + 1
        return no_of_articles

    def _bulk_commit_entries_preproocessor(
        self,
        entries: list[ScrapedData],
        pubsub: CeleryPublisher,
        scrape_content: bool = True,
        classify: bool = True,
    ) -> int:
        classified_articles: List[ServiceArticle] = []
        for entry in entries:
            service_article: ServiceArticle = self.scrape_url_and_classify(
                entry=entry,
                scrape_content=scrape_content,
                classify=classify,
            )

            logger.info(f"Article processed: {service_article.title}")

            if service_article is not None:
                classified_articles.append(service_article)

        if classified_articles:
            with GetLocalSession() as session:
                self.db.bulk_create_articles(classified_articles, session)

        news_messages: list[NewNewsNotification] = prepare_messages_for_publishing(
            articles=classified_articles
        )

        pubsub.publish(news_messages)

        return len(classified_articles)

    def fetch_classify_and_save_articles(
        self,
        source: Literal["OPENAI", "GOOGLE", "ANTHROPIC", "HACKERNOON"],
        pubsub: CeleryPublisher | None = None,
        cutoff_hours: int = 24,
        commit_on_each: bool = False,
        scrape_content: bool = True,
        classify: bool = True,
    ) -> int:
        """Main workflow: fetch, classify, and save articles"""
        self.current_service = self._get_current_service(source=source)

        if pubsub is None:
            pubsub = CeleryPublisher()

        entries: ScrapedData = self.current_service.fetch_rss_feed(
            cutoff_hours=cutoff_hours
        )

        if not entries:
            return 0

        if source == "GOOGLE":
            unique_entries: list[dict] = check_for_unique_titles(entries)
            entries = unique_entries

        all_guids = {entry.id for entry in entries}

        logger.debug(f"{len(all_guids)} are scraped.")

        with GetLocalSession() as session:
            all_exising_guids = self.db.get_all_guids(
                session=session,
                source=self.current_service.get_source(),
                cutoff_hours=cutoff_hours,
            )

        already_existing = set(all_exising_guids).intersection(all_guids)

        logger.debug(f"{len(already_existing)} entires already existed.")

        # This creates all the valid guids to be stored in the db
        entries = [entry for entry in entries if entry.id not in already_existing]

        logger.info(f"Total entries to be fetched: {len(entries)}")

        if commit_on_each is True:
            no_of_articles: int = self._commit_on_each_entries_preprocessor(
                entries=entries,
                pubsub=pubsub,
                classify=classify,
            )
            logger.info(f"{no_of_articles} new articles saved and notified.")

        else:
            no_of_articles: int = self._bulk_commit_entries_preproocessor(
                entries=entries,
                pubsub=pubsub,
                classify=classify,
            )
            logger.info(f"{no_of_articles} new articles saved and notified.")


def contruct_google_rss_urls(subcategory_titles: list[str]) -> list[str]:
    """Returns the list of rss urls with categories from database."""
    rss_urls = [
        GoogleService.BASE_URL.format(
            sub_category_query=subcategory_title.replace(" ", "-").lower()
        )
        for subcategory_title in subcategory_titles
    ]
    return rss_urls


def init_repository() -> NewsRepository:
    db = WorkerNewsService()
    with GetLocalSession() as session:
        subcategory_titles = db.get_subcategories_titles(session=session)

    google_rss_urls: list[str] = contruct_google_rss_urls(
        subcategory_titles=subcategory_titles
    )

    classifier = VDBCategoryClassifierSync.create()
    openai = OpenAiService.create()
    google = GoogleService.create(rss_urls=google_rss_urls)
    anthropic = AnthropicService.create()
    hackernoon = HackernoonService.create()

    return NewsRepository(
        db=db,
        classifier=classifier,
        openai=openai,
        google=google,
        anthropic=anthropic,
        hackernoon=hackernoon,
    )


if __name__ == "__main__":
    repository: NewsRepository = init_repository()
    total_articles: int = repository.fetch_classify_and_save_articles(
        source="ANTHROPIC",
        cutoff_hours=24,
        commit_on_each=True,
        scrape_content=True,
        classify=True,
    )
    logger.debug(f"{total_articles} articles are saved in the DB.")
