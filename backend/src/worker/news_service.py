from typing import List
from datetime import datetime, timezone, timedelta
from sqlalchemy import select
from sqlalchemy.orm import Session

from src.core.news_service.types import ServiceArticle
from src.core.ai.models import ClassificationResponse
from src.db.schemas import UserDefinedArticleClassification, Articles, SubCategory


class WorkerNewsService:
    def get_subcategories_titles(self, session: Session) -> list[str]:
        stmt = select(SubCategory.title)
        result: list[str] = (session.execute(statement=stmt)).scalars().all()
        return result
    
    def create_article(
            self,
            article: ServiceArticle,
            session: Session,
        ) -> Articles:
            user_defined_classification = []

            article_dict: dict = article.model_dump()
            classification_response: ClassificationResponse = article_dict.pop(
                "classification"
            )

            article_orm = Articles(
                **article_dict,
                category_id=classification_response["app_defined"]["category_id"],
                subcategory_id=classification_response["app_defined"]["subcategory_id"],
            )
            if classification_response["user_defined"] is not None:
                user_defined_classification: list[UserDefinedArticleClassification] = [
                    UserDefinedArticleClassification(
                        article_id=article.guid,
                        subcategory_id=classification["subcategory_id"],
                    )
                    for classification in classification_response["user_defined"]
                ]

            
            session.add(article_orm)
            if len(user_defined_classification) != 0:
                session.add_all(user_defined_classification)

            return article_orm


    def bulk_create_articles(
        self,
        articles: List[ServiceArticle],
        session: Session,
    ):
        article_orms: List[Articles] = []
        classification_orms: List[List[UserDefinedArticleClassification]] = []

        for article in articles:
            article_dict: dict = article.model_dump()
            classification_response: ClassificationResponse = article_dict.pop(
                "classification"
            )

            article_orm = Articles(
                **article_dict,
                category_id=classification_response["app_defined"]["category_id"],
                subcategory_id=classification_response["app_defined"]["subcategory_id"],
            )

            article_orms.append(article_orm)

            if classification_response["user_defined"] is not None:
                user_defined_classification: list[UserDefinedArticleClassification] = [
                    UserDefinedArticleClassification(
                        article_id=article.get("guid", ""),
                        subcategory_id=classification["subcategory_id"],
                    )
                    for classification in classification_response["user_defined"]
                ]
                classification_orms.append(user_defined_classification)

        
        session.add_all(article_orms)
        if len(classification_orms) != 0:
            for classification_orm in classification_orms:
                session.add_all(classification_orm)

        return

    def check_guid(self, guid: str, source: str, session: Session):
        """Check the existence of guid of articles object."""
        statement = select(Articles).where(
            Articles.guid == guid and Articles.source == source
        )
        result = session.execute(statement)
        return result.scalar_one_or_none()

    def get_all_guids(
        self, source: str, session: Session, cutoff_hours: int | None = 24
    ) -> list[str]:
        """Returns all the guids associated with the category on the given cutoff hours. It returns all the guids if cutoff hour is None."""
        if cutoff_hours is None:
            statement = select(Articles.guid).where(Articles.source == source)
        else:
            now = datetime.now(timezone.utc)
            cutoff_time = now - timedelta(hours=cutoff_hours)
            statement = select(Articles.guid).where(
                Articles.source == source, Articles.published_on >= cutoff_time
            )
        
        result = session.execute(statement)
        return result.scalars().all()