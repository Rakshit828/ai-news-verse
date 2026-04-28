from typing import List
from datetime import datetime, timezone, timedelta
from sqlalchemy import select
from sqlalchemy.orm import Session
from loguru import logger

from src.services.news_service.type import ServiceArticle
from src.db.schemas import Articles, SubCategory


class WorkerNewsService:
    """Synchronous database service for worker operations."""

    def get_subcategories_titles(self, session: Session) -> list[str]:
        """Get all subcategory names from database."""
        stmt = select(SubCategory.name)
        result: list[str] = session.execute(stmt).scalars().all()
        return result

    def create_article(
        self,
        article: ServiceArticle,
        session: Session,
    ) -> Articles:
        """Create a single article in the database.

        Args:
            article: ServiceArticle object with article data
            session: SQLAlchemy session

        Returns:
            Articles ORM object
        """
        try:
            db_article = Articles(
                id=article.guid,
                title=article.title,
                description=article.description,
                url=article.url,
                source=article.source,
                published_on=article.published_on,
                markdown_content=article.markdown_content,
                summary=article.summary,
                featured_image=article.featured_image,
                subcategory_id=article.classification.subcategory_id,
                metadatas=article.model_extra,
            )
            session.add(db_article)
            session.commit()
            logger.debug(f"Article created: {db_article.id} - {db_article.title}")
            return db_article
        except Exception as e:
            session.rollback()
            logger.error(f"Error creating article: {str(e)}")
            raise

    def bulk_create_articles(
        self,
        articles: List[ServiceArticle],
        session: Session,
    ) -> int:
        """Create multiple articles in the database efficiently.

        Args:
            articles: List of ServiceArticle objects
            session: SQLAlchemy session

        Returns:
            Number of articles created
        """
        if not articles:
            return 0

        try:
            db_articles = [
                Articles(
                    id=article.guid,
                    title=article.title,
                    description=article.description,
                    url=article.url,
                    source=article.source,
                    published_on=article.published_on,
                    markdown_content=article.markdown_content,
                    summary=article.summary,
                    featured_image=article.featured_image,
                    article_metadata=article.article_metadata,
                    subcategory_id=article.classification.subcategory_id,
                    metadatas=article.metadatas,
                )
                for article in articles
            ]
            session.bulk_save_objects(db_articles)
            session.commit()
            logger.debug(f"Bulk created {len(db_articles)} articles")
            return len(db_articles)
        except Exception as e:
            session.rollback()
            logger.error(f"Error bulk creating articles: {str(e)}")
            raise

    def check_guid(self, id: str, source: str, session: Session):
        """Check the existence of article by id and source.

        Args:
            id: Article ID (guid)
            source: Article source
            session: SQLAlchemy session

        Returns:
            Articles object if exists, None otherwise
        """
        statement = select(Articles).where(Articles.id == id, Articles.source == source)
        result = session.execute(statement)
        return result.scalar_one_or_none()

    def get_all_guids(
        self, source: str, session: Session, cutoff_hours: int | None = 24
    ) -> list[str]:
        """Get all article IDs for a source, optionally filtered by time.

        Args:
            source: Article source
            session: SQLAlchemy session
            cutoff_hours: Hours to look back (None = all articles)

        Returns:
            List of article IDs
        """
        if cutoff_hours is None:
            statement = select(Articles.id).where(Articles.source == source)
        else:
            now = datetime.now(timezone.utc)
            cutoff_time = now - timedelta(hours=cutoff_hours)
            statement = select(Articles.id).where(
                Articles.source == source, Articles.published_on >= cutoff_time
            )

        result = session.execute(statement)
        return result.scalars().all()
