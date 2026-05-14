from typing import List, Literal
from loguru import logger

from src.db.schemas import Articles
from src.worker.db import GetLocalSession
from sqlalchemy.orm import Session
from src.worker.news_service import WorkerNewsService
from src.services.news_service.type import (
    ServiceArticle,
    ScrapedData,
    GoogleScrapedData,
)
from src.services.news_service.sources import (
    OpenAiService,
    AnthropicService,
    GoogleService,
    HackernoonService,
)
from src.services.ai import VDBClassificationResponse
from src.services.ai import VDBCategoryClassifierSync
from src.services.notification_system import CeleryPublisher
from src.domains.news.models import NewNewsNotification
from src.services.ai.ai_classifier import AiClassificationResponse
from src._constants import SUBCATEGORY_ID_MAPPINGS
from src.utils import timeit


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
    news: List[NewNewsNotification] = [
        NewNewsNotification(
            id=article.guid,
            title=article.title,
            url=article.url,
            source=article.source,
            summary=article.summary,
            published_on=article.published_on,
            featured_image=article.featured_image,
            subcategory_id=article.classification.subcategory_id,
            metadatas=article.model_extra,
        )
        for article in articles
    ]

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

    @timeit
    def scrape_url_and_classify(
        self,
        entry: ScrapedData,
        scrape_content: bool = True,
        classify: bool = True,
    ) -> ServiceArticle | None:
        if scrape_content:
            entry: ScrapedData = self.current_service.scrape_url(scraped_entry=entry)
        if classify:
            if isinstance(self.current_service, GoogleService):
                classification = VDBClassificationResponse(
                    subcategory_id=SUBCATEGORY_ID_MAPPINGS[entry.category]
                )
            else:
                classification: VDBClassificationResponse | None = self.classifier.run(
                    title=entry.title
                )
        if classification is None:
            return None

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
        """Process entries one by one, saving each immediately.

        Args:
            entries: List of scraped entries
            pubsub: CeleryPublisher for notifications
            scrape_content: Whether to scrape full content
            classify: Whether to classify articles

        Returns:
            Number of articles successfully saved
        """
        no_of_articles = 0
        for entry in entries:
            try:
                service_article: ServiceArticle | None = self.scrape_url_and_classify(
                    entry=entry,
                    scrape_content=scrape_content,
                    classify=classify,
                )
                if service_article is None:
                    logger.info(f"Not saving the article {entry.title}")
                    continue
                logger.info(f"Article processed: {service_article.title}")

                if service_article is not None:
                    with GetLocalSession() as session:
                        article: Articles = self.db.create_article(
                            article=service_article, session=session
                        )
                        logger.info(
                            f"Article saved: {article.title}, GUID: {article.id}"
                        )

                    # Publishing to redis.
                    news_messages: List[NewNewsNotification] = (
                        prepare_messages_for_publishing(articles=[service_article])
                    )
                    pubsub.publish(news_messages)
                    no_of_articles += 1
            except Exception as e:
                logger.error(f"Error processing entry {entry.id}: {str(e)}")
                raise e

        return no_of_articles

    def _bulk_commit_entries_preproocessor(
        self,
        entries: list[ScrapedData],
        pubsub: CeleryPublisher,
        scrape_content: bool = True,
        classify: bool = True,
    ) -> int:
        """Process all entries, then save in bulk for efficiency.

        Args:
            entries: List of scraped entries
            pubsub: CeleryPublisher for notifications
            scrape_content: Whether to scrape full content
            classify: Whether to classify articles

        Returns:
            Number of articles successfully saved
        """
        classified_articles: List[ServiceArticle] = []
        for entry in entries:
            try:
                service_article: ServiceArticle = self.scrape_url_and_classify(
                    entry=entry,
                    scrape_content=scrape_content,
                    classify=classify,
                )

                logger.info(f"Article processed: {service_article.title}")

                if service_article is not None:
                    classified_articles.append(service_article)
            except Exception as e:
                logger.error(f"Error processing entry {entry.id}: {str(e)}")
                continue

        if classified_articles:
            with GetLocalSession() as session:
                no_saved = self.db.bulk_create_articles(classified_articles, session)
        else:
            no_saved = 0

        if classified_articles:
            news_messages: list[NewNewsNotification] = prepare_messages_for_publishing(
                articles=classified_articles
            )
            pubsub.publish(news_messages)

        return no_saved

    def fetch_classify_and_save_articles(
        self,
        source: Literal["OPENAI", "GOOGLE", "ANTHROPIC", "HACKERNOON"],
        pubsub: CeleryPublisher | None = None,
        cutoff_hours: int = 24,
        commit_on_each: bool = False,
        scrape_content: bool = True,
        classify: bool = True,
    ) -> int:
        """Main workflow: fetch, classify, and save articles.

        Args:
            source: News source
            pubsub: CeleryPublisher for notifications (auto-created if None)
            cutoff_hours: Hours to look back for existing articles
            commit_on_each: Commit each article individually (True) or bulk commit (False)
            scrape_content: Whether to scrape full article content
            classify: Whether to classify articles

        Returns:
            Number of articles processed and saved
        """
        self.current_service = self._get_current_service(source=source)

        if pubsub is None:
            pubsub = CeleryPublisher()
        logger.info(
            f"Objects are : CLASSIFIER: {self.classifier}, OPENAI: {self.openai}, ANTHROPIC: {self.anthropic}, GOOGLE: {self.google}, HACKERNOON: {self.hackernoon}, DB: {self.db}, Celery: {pubsub}"
        )
        entries: list[ScrapedData] = self.current_service.fetch_rss_feed(
            cutoff_hours=cutoff_hours
        )

        if not entries:
            logger.info(f"No entries fetched from {source}")
            return 0

        # For Google, remove duplicates based on title
        if source == "GOOGLE":
            unique_entries: list[GoogleScrapedData] = check_for_unique_titles(entries)
            entries = unique_entries

        all_guids = {entry.id for entry in entries}
        logger.debug(f"{len(all_guids)} entries scraped from {source}")

        # Get existing GUIDs to avoid duplicates
        with GetLocalSession() as session:
            all_existing_guids = self.db.get_all_guids(
                session=session,
                source=self.current_service.get_source(),
                cutoff_hours=cutoff_hours,
            )

        already_existing = set(all_existing_guids).intersection(all_guids)
        logger.debug(f"{len(already_existing)} entries already existed in DB")

        # Filter out existing entries
        entries = [entry for entry in entries if entry.id not in already_existing]
        logger.info(f"Total new entries to process: {len(entries)}")

        if not entries:
            logger.info(f"No new entries to process from {source}")
            return 0

        # Process entries based on commit strategy
        if commit_on_each:
            no_of_articles: int = self._commit_on_each_entries_preprocessor(
                entries=entries,
                pubsub=pubsub,
                scrape_content=scrape_content,
                classify=classify,
            )
        else:
            no_of_articles: int = self._bulk_commit_entries_preproocessor(
                entries=entries,
                pubsub=pubsub,
                scrape_content=scrape_content,
                classify=classify,
            )

        logger.info(f"{no_of_articles} new articles processed and saved from {source}")
        return no_of_articles


def contruct_google_rss_urls(subcategory_titles: list[str]) -> list[str]:
    """Returns the list of rss urls with categories from database."""
    rss_urls = [
        GoogleService.BASE_URL.format(sub_category_query=subcategory_title)
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
    logger.debug(f"Google urls are : {google_rss_urls}")
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
        source="GOOGLE",
        cutoff_hours=1000,
        commit_on_each=True,
        scrape_content=True,
        classify=True,
    )
    logger.debug(f"{total_articles} articles are saved in the DB.")
