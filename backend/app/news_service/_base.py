import asyncio
from typing import List, Type, Tuple, TypeAlias
from abc import ABC, abstractmethod

from app.news_service.types import ServiceArticle
from app.news_service.components.scraper import Scraper
from app.news_service.components.classifier import Classifier, ClassifiedCategory
from app.database.services.ai_news_service import AiNewsService
from app.database.main import AsyncSession


class InvalidScraper(Exception):
    pass


class InvalidArgument(Exception):
    pass


MarkdownContent: TypeAlias = str


class BaseNewsService(ABC):
    """Abstract base class for all news services (Anthropic, Google, OpenAI, etc.)"""

    DB_SERVICE: AiNewsService = AiNewsService()

    def __init__(self, classifier: Classifier = None):
        self.classifier = (
            classifier if isinstance(classifier, Classifier) else Classifier()
        )

    @classmethod
    @abstractmethod
    def create(cls):
        """Factory method to create service instance with proper configuration"""
        pass

    @abstractmethod
    def get_orm_model(self):
        """Return the ORM model class for this service"""
        pass

    async def article_to_orm(self, article: ServiceArticle):
        """Convert classified article to ORM object"""
        orm_model = self.get_orm_model()
        return orm_model(
            guid=article.guid,
            title=article.title,
            description=article.description,
            url=article.url,
            published_on=article.published_on,
            markdown_content=article.markdown_content,
            category_id=article.category.category_id,
            subcategory_id=article.sub_category.subcategory_id,
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
        entry_class: Type[ServiceArticle],
        session: AsyncSession,
    ):
        check = await BaseNewsService.DB_SERVICE.check_guid(
            guid=entry_guid, orm_class=entry_class, session=session
        )
        return False if check is None else True

    async def save_article(self, article: ServiceArticle, session: AsyncSession):
        """Save single article to database"""
        orm_article = await self.article_to_orm(article)
        await BaseNewsService.DB_SERVICE.create_article(
            article=orm_article, session=session
        )
        return True

    async def bulk_save_articles(
        self, articles: List[ServiceArticle], session: AsyncSession
    ):
        """Save multiple articles to database"""
        orm_articles = await self.articles_to_orm_list(articles)
        await BaseNewsService.DB_SERVICE.bulk_create_articles(
            articles=orm_articles, session=session
        )
        return True

    async def fetch_and_classify(
        self, url: str, title: str, scrape_content: bool = True
    ) -> Tuple[MarkdownContent | None, ClassifiedCategory]:
        if scrape_content is True:
            markdown_content: MarkdownContent = await self.scraper.scrape_url(
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
        cutoff_hours: int = 24,
        commit_on_each: bool = False,
        scrape_content: bool = True,
    ) -> int:
        """Main workflow: fetch, classify, and save articles"""

        entries = await self.scraper.get_entries_from_rss_feed(
            cutoff_hours=cutoff_hours
        )

        if not entries:
            print(f"No new entries found for {self.__class__.__name__}")
            return 0

        if commit_on_each is True:
            no_of_articles = 0
            for entry in entries:
                does_entry_exist = await self.check_entry(
                    entry_guid=entry.guid,
                    entry_class=self.get_orm_model(),
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
                    service_article: ServiceArticle = await self.to_service_article(
                        entry=entry,
                        classified_category=classified_category,
                        markdown_content=markdown_content,
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
                    entry_class=self.get_orm_model(),
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
                    service_article: ServiceArticle = await self.to_service_article(
                        entry=entry,
                        classified_category=classified_category,
                        markdown_content=markdown_content,
                    )
                    if service_article is not None:
                        classified_articles.append(service_article)

            if classified_articles:
                await self.bulk_save_articles(classified_articles, session)
            return len(classified_articles)


if __name__ == "__main__":

    async def main():
        pass

    asyncio.run(main())
