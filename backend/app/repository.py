from typing import List, Tuple, Literal
import asyncio

from app.db.models.ai_news_service import Articles
from app.news_service.components.classifier import Classifier
from app.db.main import get_session, AsyncSession
from app.controllers.ai_news_service import NewsDBService
from app.news_service.types import ServiceArticle
from app.news_service.types import ClassifiedCategory, MarkdownContent
from app.news_service import (
    OpenAiService,
    AnthropicService,
    GoogleService,
    HackernoonService,
)


class InvalidArgument(Exception):
    pass


class NewsRepository:
    def __init__(
        self,
        *,
        db: NewsDBService | None = None,
        classifier: Classifier | None = None,
        openai: OpenAiService | None = None,
        google: GoogleService | None = None,
        hackernoon: HackernoonService | None = None,
        anthropic: AnthropicService | None = None,
    ):
        self.db: NewsDBService | None = db
        self.classifier: Classifier | None = classifier
        self.openai: OpenAiService | None = openai
        self.google: GoogleService | None = google
        self.anthropic: AnthropicService | None = anthropic
        self.hackernoon: HackernoonService | None = hackernoon

        self.current_service: (
            OpenAiService | GoogleService | AnthropicService | HackernoonService
        ) = None

    async def article_to_orm(self, article: ServiceArticle):
        """Convert classified article to ORM object"""
        return Articles(
            guid=article.guid,
            title=article.title,
            description=article.description,
            url=article.url,
            published_on=article.published_on,
            markdown_content=article.markdown_content,
            category_id=article.category.category_id,
            subcategory_id=article.sub_category.subcategory_id,
            source=self.current_service.get_source(),
        )

    async def articles_to_orm_list(self, articles: List[ServiceArticle]) -> List:
        if not isinstance(articles[0], ServiceArticle):
            raise InvalidArgument(
                f"Invalid argument type of {articles[0].__class__}. It must be {ServiceArticle.__args__}"
            )

        """Convert list of classified articles to ORM objects"""
        return [await self.article_to_orm(article) for article in articles]

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

    async def save_article(self, article: ServiceArticle, session: AsyncSession):
        """Save single article to database"""
        orm_article = await self.article_to_orm(article)
        await self.db.create_article(article=orm_article, session=session)
        return True

    async def bulk_save_articles(
        self, articles: List[ServiceArticle], session: AsyncSession
    ):
        """Save multiple articles to database"""
        orm_articles = await self.articles_to_orm_list(articles)
        await self.db.bulk_create_articles(articles=orm_articles, session=session)
        return True

    async def fetch_and_classify(
        self,
        url: str,
        title: str,
        scrape_content: bool = True,
    ) -> Tuple[MarkdownContent | None, ClassifiedCategory]:
        if scrape_content is True:
            markdown_content: MarkdownContent = await self.current_service.scraper.scrape_url(
                url=url, content_format="markdown"
            )
        else:
            markdown_content = None
        classified_category: ClassifiedCategory = (
            await self.classifier.classify_category(news_title=title)
        )
        return (markdown_content, classified_category)

    async def fetch_classify_and_save_articles(
        self,
        session: AsyncSession,
        source: Literal["OPENAI", "GOOGLE", "ANTHROPIC", "HACKERNOON"],
        cutoff_hours: int = 24,
        commit_on_each: bool = False,
        scrape_content: bool = True,
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

        if commit_on_each is True:
            no_of_articles = 0
            for entry in entries:
                does_entry_exist = await self.check_entry(
                    entry_guid=entry.guid,
                    source=self.current_service.get_source(),
                    session=session,
                )

                if does_entry_exist is False:
                    markdown_content, classified_category = (
                        await self.fetch_and_classify(
                            url=entry["link"],
                            title=entry["title"],
                            scrape_content=scrape_content,
                        )
                    )
                    service_article: ServiceArticle = (
                        await self.current_service.to_service_article(
                            entry=entry,
                            classified_category=classified_category,
                            markdown_content=markdown_content,
                        )
                    )

                    if service_article is not None:
                        await self.save_article(
                            article=service_article, session=session
                        )
                    no_of_articles = no_of_articles + 1
                else:
                    continue

            return no_of_articles

        else:

            classified_articles: List[ServiceArticle] = []
            for entry in entries:
                does_entry_exist = await self.check_entry(
                    entry_guid=entry.guid,
                    source=self.current_service.get_source(),
                    session=session,
                )

                if does_entry_exist is False:
                    markdown_content, classified_category = (
                        await self.fetch_and_classify(
                            url=entry["link"],
                            title=entry["title"],
                            scrape_content=scrape_content,
                        )
                    )
                    service_article: ServiceArticle = (
                        await self.current_service.to_service_article(
                            entry=entry,
                            classified_category=classified_category,
                            markdown_content=markdown_content,
                        )
                    )
                    if service_article is not None:
                        classified_articles.append(service_article)

            if classified_articles:
                await self.bulk_save_articles(classified_articles, session)
            return len(classified_articles)


if __name__ == "__main__":

    async def contruct_google_rss_urls(subcategory_ids: list[str]) -> list[str]:
        """Returns the list of rss urls with categories from database."""
        rss_urls = [
            GoogleService.BASE_URL.format(sub_category_query=subcategory_id)
            for subcategory_id in subcategory_ids
        ]
        print("RSS URLS ARE : ", rss_urls)
        return rss_urls

    async def init_repository() -> NewsRepository:
        db = NewsDBService()
        async for session in get_session():
            categories_data = await db.category_service.get_categories_data(
                session=session
            )
            subcategory_ids = await db.category_service.get_subcategory_column(
                column="subcategory_id", session=session
            )

        google_rss_urls: list[str] = await contruct_google_rss_urls(
            subcategory_ids=subcategory_ids
        )

        classifier = Classifier(categories_data=categories_data)
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


    async def main():
        repository: NewsRepository = await init_repository()
        async for session in get_session():
            await repository.fetch_classify_and_save_articles(
                session=session, commit_on_each=False, source="HACKERNOON", scrape_content=False
            )

    asyncio.run(main())
