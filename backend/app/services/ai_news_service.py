import json
import uuid
import asyncio
from uuid import UUID
from sqlalchemy import select, delete, insert
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import aliased, with_loader_criteria, joinedload
from typing import Sequence, List, Literal, Tuple
from datetime import datetime, timezone, time, timedelta


from app.db.schemas import (
    Category,
    SubCategory,
    UserCategory,
    UserSubCategory,
    Articles,
    UserDefinedArticleClassification,
)
from app.models.ai_news_service import (
    GoogleNewsResponse,
    AnthropicNewsResponse,
    HackernoonResponse,
    OpenaiNewsResponse,
    TodayNewsResponse,
    ResponseCategoryDataModel,
    ResponseCategoryData,
    SetUsersCategoriesModel,
    UpdateUsersCategoriesModel,
    CreateCustomCategoryModel,
    CreateCustomSubcategoryModel,
    SetCategoriesData,
    SimilarCategoryExistsResponse,
    CategoryAlreadyExistsResponse,
    SimilarSubcategoryExistsResponse,
    SubcategoryAlreadyExistsResponse,
)

from app.response import AppError
from app.exceptions import (
    CategoryAlreadyExistsError,
    SubCategoryAlreadyExistsError,
    CategoryNotFoundError,
    SubCategoryNotFoundError,
    NotMeaningfulTopicError,
)
from app.news_service.types import ServiceArticle
from app.ai.models import (
    ClassificationResponse,
    CategoryCheckResponse,
    SubcategoryCheckResponse,
    TopicKeywordRecordResponse,
)
from app.ai.components.pinecone_db import (
    PineconeClient,
    TopicKeywordRecord,
    PrimaryCategoryRecord,
)
from app.ai.components.topic_description_generator import (
    TopicDescriptionGenerator,
    TopicDescription,
    CanonicalName,
)
from app.constants import (
    PINECONE_APPLICATION_CATEGORY_NAMESPACE,
    PINECONE_CANONICAL_TOPIC_NAMESPACE,
    PINECONE_USER_CATEGORY_NAMESPACE,
)

from loguru import logger


TOPIC_DESCRIPTION_GENERATOR = TopicDescriptionGenerator()


class BaseDBInteractions:
    """This class contains the db interactions which are often used."""

    async def get_category_by_id(
        self, id: str, session: AsyncSession
    ) -> Category | None:
        """Gives category orm object by id."""
        statement = select(Category).where(Category.category_id == id)
        result = await session.execute(statement)
        category = result.scalar_one_or_none()
        return category

    async def get_subcategory_by_id(
        self, id: str, session: AsyncSession
    ) -> SubCategory | None:
        """Gives category orm object by id."""
        statement = select(SubCategory).where(SubCategory.subcategory_id == id)
        result = await session.execute(statement)
        subcategory = result.scalar_one_or_none()
        return subcategory

    async def check_category_exists(
        self, category_id: str, session: AsyncSession
    ) -> bool:
        category: Category | None = await self.get_category_by_id(
            id=category_id, session=session
        )
        return True if category is not None else False

    async def check_subcategory_exists(
        self, subcategory_id: str, session: AsyncSession
    ) -> bool:
        subcategory: SubCategory | None = await self.get_subcategory_by_id(
            id=subcategory_id, session=session
        )
        return True if subcategory is not None else False

    @staticmethod
    async def fetch_from_db(
        statement, session: AsyncSession, to: Literal["list", "rows"]
    ):
        result = await session.execute(statement)
        if to == "rows":
            return result.all()
        elif to == "list":
            return result.scalars().all()


class CategoriesDBService(BaseDBInteractions):
    @staticmethod
    async def _initialize_categories(session: AsyncSession):
        with open(
            r"D:\GenAI\AiNewsSystem\backend\app\db\schemas\_category.json",
            "r",
            encoding="utf-8",
        ) as f:

            categories_data = json.load(f)["categories"]

            category_rows = []
            subcategory_rows = []

            for category in categories_data:
                category_rows.append(
                    {
                        "category_id": uuid.uuid4(),
                        "title": category["title"],
                    }
                )

                for sub in category["subcategories"]:
                    subcategory_rows.append(
                        {
                            "subcategory_id": uuid.uuid4(),
                            "title": sub["title"],
                            "category_id": category_rows[-1]["category_id"],
                        }
                    )

            if category_rows:
                await session.execute(
                    insert(Category),
                    category_rows,
                )

            if subcategory_rows:
                await session.execute(
                    insert(SubCategory),
                    subcategory_rows,
                )

            await session.commit()

    async def get_categories_data(
        self, session: AsyncSession
    ) -> ResponseCategoryDataModel:
        """Returs the full category and subcategory data from the table except custom ones."""
        statement = (
            select(Category)
            .where(Category.added_by_users == False)
            .options(
                joinedload(Category.subcategories),
                with_loader_criteria(
                    SubCategory,
                    SubCategory.added_by_users == False,
                    include_aliases=True,
                ),
            )
        )

        result = await session.execute(statement)
        categories: List[Category] = result.unique().scalars().all()
        return ResponseCategoryDataModel(categories_data=categories)

    async def get_subcategory_column(
        self, column: Literal["subcategory_id", "title"], session: AsyncSession
    ) -> List[str] | None:
        """Returns all the ids of subcategories."""
        match (column):
            case "subcategory_id":
                statement = select(SubCategory.subcategory_id)
            case "title":
                statement = select(SubCategory.title).where(
                    SubCategory.added_by_users == False
                )
        result = (await session.execute(statement)).scalars().all()
        return result if result else None

    async def get_category_column(
        self, column: Literal["category_id", "title"], session: AsyncSession
    ) -> List[UUID] | List[str] | None:
        """Returns all the ids of subcategories."""
        match (column):
            case "category_id":
                statement = select(Category.category_id).where(
                    Category.added_by_users == False
                )
            case "title":
                statement = select(Category.title).where(
                    Category.added_by_users == False
                )
        result = (await session.execute(statement=statement)).scalars().all()
        return result if result else None

    async def filter_not_existing_categories(
        self, categories_id: List[str], session: AsyncSession
    ) -> List[UUID] | List[str] | None:
        """Returns the category_id list from given category_ids which doesnn't exist in the db."""
        existing_categories: List[str] = await self.get_category_column(
            column="category_id", session=session
        )
        not_existing_categories = set(categories_id) - set(existing_categories)
        if not_existing_categories:
            return list(not_existing_categories)
        return None

    async def filter_not_existing_subcategories(
        self, subcategories_id: List[str], session: AsyncSession
    ) -> List[str] | None:
        """Returns the subcategory_id list from given subcategory_ids which doesnn't exist in the db."""
        existing_subcategories: List[str] = await self.get_subcategory_column(
            column="subcategory_id", session=session
        )
        not_existing_subcategories = set(subcategories_id) - set(existing_subcategories)
        if not_existing_subcategories:
            return list(not_existing_subcategories)
        return None

    async def get_subcategories_for_category_by_id(
        self, category_id: str, session: AsyncSession
    ) -> Sequence[SubCategory]:
        """Returns all the Subcategory ORM object related to Category table."""
        statement = select(SubCategory).where(SubCategory.category_id == category_id)
        result = await session.execute(statement)
        subcategories = result.scalars().all()
        return subcategories

    async def _add_existing_category_to_users(
        self,
        user_id: str,
        category_ids: List[str],
        subcategory_ids: List[str],
        session: AsyncSession,
    ) -> ResponseCategoryDataModel:
        """Function used internally by set and update user categories to set/update user categories."""
        if category_ids:
            not_existing_categories = await self.filter_not_existing_categories(
                categories_id=category_ids, session=session
            )
            if not_existing_categories:
                raise AppError(
                    CategoryNotFoundError(
                        message=f"Categories: '{" ".join(not_existing_categories)}' not found."
                    )
                )
            user_categories_orm = [
                UserCategory(user_id=user_id, category_id=category_id)
                for category_id in category_ids
            ]
            session.add_all(user_categories_orm)

        if subcategory_ids:
            not_existing_subcategories = await self.filter_not_existing_subcategories(
                subcategories_id=subcategory_ids, session=session
            )
            if not_existing_subcategories:
                raise AppError(
                    SubCategoryNotFoundError(
                        message=f"Subcategory: '{" ".join(not_existing_subcategories)}' not found."
                    )
                )

            user_subcategories_orm = [
                UserSubCategory(user_id=user_id, subcategory_id=subcategory_id)
                for subcategory_id in subcategory_ids
            ]
            session.add_all(user_subcategories_orm)

        await session.commit()
        return await self.get_user_categories(user_id=user_id, session=session)

    async def set_user_categories(
        self,
        user_id: str,
        categories_data: SetUsersCategoriesModel,
        session: AsyncSession,
    ) -> ResponseCategoryDataModel:

        categories_data: List[SetCategoriesData] = categories_data.categories_data

        new_categories_id = []
        new_subcategories_id = []

        for category in categories_data:
            new_categories_id.append(category.category_id)
            for subcategory_id in category.subcategories:
                new_subcategories_id.append(subcategory_id)

        user_categories: ResponseCategoryDataModel = (
            await self._add_existing_category_to_users(
                user_id=user_id,
                category_ids=new_categories_id,
                subcategory_ids=new_subcategories_id,
                session=session,
            )
        )
        return user_categories

    async def update_user_categories(
        self,
        user_id: str,
        categories_data: UpdateUsersCategoriesModel,
        session: AsyncSession,
    ) -> ResponseCategoryDataModel:
        categories_data: List[SetCategoriesData] = categories_data.categories_data

        # Get current user categories and subcategories
        current_user_subcategories: List[str] = await self.get_user_subcategories_id(
            user_id=user_id, session=session
        )

        # Extract new subcategories from the update request
        new_subcategories: List[str] = [
            subcategory_id
            for category in categories_data
            for subcategory_id in category.subcategories
        ]

        # Determine which subcategories to add and remove
        subcategories_to_add = set(new_subcategories) - set(current_user_subcategories)
        subcategories_to_remove = set(current_user_subcategories) - set(
            new_subcategories
        )

        # Delete old subcategories and categories
        if subcategories_to_remove:
            await self.delete_user_subcategories(
                user_id=user_id,
                subcategory_ids=list(subcategories_to_remove),
                session=session,
            )

        # Delete categories that are not in the new data
        current_categories = {
            category_id
            for category_id in await self.get_user_categories_id(
                user_id=user_id, session=session
            )
        }

        new_categories = {category.category_id for category in categories_data}
        categories_to_remove = current_categories - new_categories
        categories_to_add = new_categories - current_categories

        for category_id in categories_to_remove:
            await self.delete_user_category_and_subcategories_by_category_id(
                user_id=user_id, category_id=category_id, session=session
            )

        user_categories: ResponseCategoryDataModel = (
            await self._add_existing_category_to_users(
                user_id=user_id,
                category_ids=list(categories_to_add),
                subcategory_ids=list(subcategories_to_add),
                session=session,
            )
        )

        return user_categories

    async def delete_user_subcategories(
        self, user_id: str, subcategory_ids: List[str], session: AsyncSession
    ):
        """Deletes the category and all the subcategories for a user."""
        statement = delete(UserSubCategory).where(
            UserSubCategory.user_id == user_id,
            UserSubCategory.subcategory_id.in_(subcategory_ids),
        )
        await session.execute(statement)
        await session.commit()
        return True

    async def delete_user_category_and_subcategories_by_category_id(
        self, user_id: str, category_id: str, session: AsyncSession
    ):
        """Deletes the category and all the subcategories for a user."""
        stmt_delete_user_category = delete(UserCategory).where(
            UserCategory.category_id == category_id, UserCategory.user_id == user_id
        )
        stmt_all_subcategories_ids = select(SubCategory.subcategory_id).where(
            SubCategory.category_id == category_id
        )
        all_subcategories_id: List[str] = (
            (await session.execute(stmt_all_subcategories_ids)).scalars().all()
        )
        stmt_delete_user_subcategories = delete(UserSubCategory).where(
            UserSubCategory.user_id == user_id,
            UserSubCategory.subcategory_id.in_(all_subcategories_id),
        )
        await session.execute(stmt_delete_user_subcategories)
        await session.execute(stmt_delete_user_category)
        await session.commit()
        return True

    async def create_custom_category(
        self,
        user_id: str,
        category_data: CreateCustomCategoryModel,
        session: AsyncSession,
        pinecone_client: PineconeClient,
    ) -> ResponseCategoryDataModel:
        """Allows users to create custom categories and subcategories within it."""

        async with session.begin():
            # Check for category existence (DB)
            stmt1 = (
                select(Category.category_id, Category.title, UserCategory.user_id)
                .outerjoin(
                    UserCategory,
                    (UserCategory.category_id == Category.category_id)
                    & (UserCategory.user_id == user_id),
                )
                .where(
                    Category.title == category_data.title,
                )
            )

            result = (await session.execute(stmt1)).one_or_none()

            # It will be none if the category doesn't exists in the DB.
            if result:
                existing_category_id, existing_category_title, linked_user_id = result

                if existing_category_id and linked_user_id:
                    # THis means category exists and belongs to the user
                    raise AppError(CategoryAlreadyExistsError())
                elif existing_category_id and not linked_user_id:
                    # This means category exists but does not belong to the user
                    return CategoryAlreadyExistsResponse(
                        category_title=existing_category_title,
                        category_id=existing_category_id,
                    )

            # Now that DB checks are finished, checking for category similarity in pinecone.
            pinecone_cat: CategoryCheckResponse = (
                await pinecone_client.check_for_category_existence(
                    category=category_data.title
                )
            )
            if pinecone_cat:
                return SimilarCategoryExistsResponse(
                    category_title=pinecone_cat["content"],
                    category_id=pinecone_cat["category_id"],
                )

            # Now that the both checks have passed, the category really doesn't exists and we are creating
            # new one.

            # Checking for the validity.
            result: CanonicalName = (
                await TOPIC_DESCRIPTION_GENERATOR.generate_canonical_name(
                    topic=category_data.title
                )
            )
            if result.is_valid is False:
                raise AppError(NotMeaningfulTopicError())
            else:
                genereated_category_id = uuid.uuid4()
                new_category = Category(
                    category_id=genereated_category_id,
                    title=category_data.title,
                    added_by_users=True,
                )
                await pinecone_client.upsert_records(
                    [
                        TopicKeywordRecord(
                            id=str(uuid.uuid4()),
                            content=result.canonical_name,
                            category_id=str(genereated_category_id),
                        )
                    ],
                    upsert_in=PINECONE_CANONICAL_TOPIC_NAMESPACE,
                )
                session.add(new_category)
                session.add(
                    UserCategory(user_id=user_id, category_id=genereated_category_id)
                )

        category_data_response: ResponseCategoryDataModel = (
            await self.get_user_categories(user_id=user_id, session=session)
        )

        return category_data_response

    async def create_custom_subcategory(
        self,
        user_id: str,
        subcategory_data: CreateCustomSubcategoryModel,
        session: AsyncSession,
        pinecone_client: PineconeClient,
    ) -> ResponseCategoryDataModel:
        """Allows users to add new subcategories to an existing category."""
        async with session.begin():
            category_id: UUID = subcategory_data.category_id

            # Check if user owns this category (has it in their user_categories)
            check_stmt = select(UserCategory.category_id).where(
                UserCategory.user_id == user_id,
                UserCategory.category_id == category_id,
            )
            linked_category_id = (await session.execute(check_stmt)).scalar_one_or_none()
            if not linked_category_id:
                raise AppError(
                    CategoryNotFoundError(
                        message=f"You don't have access to this category."
                    )
                )

            # Check for subcategory existence (DB)
            stmt1 = (
                select(
                    SubCategory.subcategory_id,
                    SubCategory.title,
                    UserSubCategory.user_id,
                )
                .where(
                    SubCategory.title == subcategory_data.title,
                    SubCategory.category_id == category_id,
                )
                .outerjoin(
                    UserSubCategory,
                    (UserSubCategory.subcategory_id == SubCategory.subcategory_id)
                    & (UserSubCategory.user_id == user_id),
                )
            )

            result = (await session.execute(stmt1)).one_or_none()
            if result:
                (
                    existing_subcategory_id,
                    existing_subcategory_title,
                    linked_user_id,
                ) = result

                if existing_subcategory_id and linked_user_id:
                    raise AppError(SubCategoryAlreadyExistsError())

                elif existing_subcategory_id and not linked_user_id:
                    return SubcategoryAlreadyExistsResponse(
                        subcategory_title=existing_subcategory_title,
                        subcategory_id=str(existing_subcategory_id),
                    )

            # Pineapple Check
            pinecone_sub: SubcategoryCheckResponse | None = (
                await pinecone_client.check_for_subcategory_existence(
                    subcategory=subcategory_data.title
                )
            )
            if pinecone_sub is not None:
                return SimilarSubcategoryExistsResponse(
                    subcategory_title=pinecone_sub["content"],
                    subcategory_id=pinecone_sub["subcategory_id"],
                )

            pinecone_result: List[TopicKeywordRecordResponse] = (
                await pinecone_client.get_relevant_canonical_topics(
                    topic=subcategory_data.title, k=5
                )
            )
            topics_list: list[str] = [
                subcat_field["fields"]["content"] for subcat_field in pinecone_result
            ]
            result: TopicDescription = (
                await TOPIC_DESCRIPTION_GENERATOR.generate_topic_description(
                    topic=subcategory_data.title, other_topics=topics_list
                )
            )
            if result.is_valid is False:
                raise AppError(NotMeaningfulTopicError())
            else:
                generated_subcat_id: uuid.UUID = uuid.uuid4()
                new_subcategory = SubCategory(
                    subcategory_id=generated_subcat_id,
                    title=subcategory_data.title,
                    added_by_users=True,
                    category_id=category_id,
                )
                await pinecone_client.upsert_records(
                    [
                        PrimaryCategoryRecord(
                            id=str(uuid.uuid4()),
                            content=result.description,
                            topic=result.canonical_name,
                            category_id=str(category_id),
                            subcategory_id=str(generated_subcat_id),
                        )
                    ],
                    upsert_in=PINECONE_USER_CATEGORY_NAMESPACE,
                )
                await pinecone_client.upsert_records(
                    [
                        TopicKeywordRecord(
                            id=str(uuid.uuid4()),
                            content=result.canonical_name,
                            category_id=str(category_id),
                            subcategory_id=str(generated_subcat_id),
                        )
                    ],
                    upsert_in=PINECONE_CANONICAL_TOPIC_NAMESPACE,
                )

                session.add(new_subcategory)
                session.add(
                    UserSubCategory(
                        user_id=user_id, subcategory_id=generated_subcat_id
                    )
                )
        # Return updated user categories
        return await self.get_user_categories(user_id=user_id, session=session)

    async def get_user_subcategories_id(
        self, user_id: str, session: AsyncSession
    ) -> List[str]:
        """Returns the list of the ids of the subcategory related to the user."""
        statement = select(UserSubCategory.subcategory_id).where(
            UserSubCategory.user_id == user_id
        )
        result = await session.execute(statement)
        return result.scalars().all()

    async def get_user_categories_id(
        self, user_id: str, session: AsyncSession
    ) -> List[str]:
        """Returns the list of the ids of the category related to the user."""
        statement = select(UserCategory.category_id).where(
            UserCategory.user_id == user_id
        )
        result = await session.execute(statement)
        return result.scalars().all()

    async def get_user_categories(
        self, user_id: str, session: AsyncSession
    ) -> ResponseCategoryDataModel:
        """Returns all the categories of the user and the subcategory in structured format."""
        subq_categories = (
            select(UserCategory).where(UserCategory.user_id == user_id).subquery()
        )
        user_cat_alias = aliased(UserCategory, subq_categories)
        stmt_categories = select(user_cat_alias.category_id, Category.title).join(
            Category, user_cat_alias.category_id == Category.category_id
        )

        subq_subcategories = (
            select(UserSubCategory).where(UserSubCategory.user_id == user_id).subquery()
        )
        user_subcat_alias = aliased(UserSubCategory, subq_subcategories)
        stmt_subcategories = select(
            user_subcat_alias.subcategory_id, SubCategory.title, SubCategory.category_id
        ).join(
            SubCategory, user_subcat_alias.subcategory_id == SubCategory.subcategory_id
        )

        user_categories = await self.fetch_from_db(
            statement=stmt_categories, session=session, to="rows"
        )
        user_subcategories = await self.fetch_from_db(
            statement=stmt_subcategories, session=session, to="rows"
        )

        category_data: ResponseCategoryDataModel = ResponseCategoryDataModel(
            categories_data=[
                ResponseCategoryData(
                    **{
                        "category_id": category_row[0],
                        "title": category_row[1],
                        "subcategories": [
                            {"subcategory_id": subcategory[0], "title": subcategory[1]}
                            for subcategory in user_subcategories
                            if subcategory[2] == category_row[0]
                        ],
                    }
                )
                for category_row in user_categories
            ]
        )
        return category_data


class NewsDBService:

    def __init__(self, category_service: CategoriesDBService | None = None):
        self.category_service: CategoriesDBService | None = (
            category_service or CategoriesDBService()
        )

    @staticmethod
    async def get_separate_sources(articles: list[tuple]) -> Tuple[
        Tuple[GoogleNewsResponse, ...],
        Tuple[AnthropicNewsResponse, ...],
        Tuple[OpenaiNewsResponse, ...],
        Tuple[HackernoonResponse, ...],
    ]:
        google_articles: List[GoogleNewsResponse] = []
        anthropic_articles: List[AnthropicNewsResponse] = []
        openai_articles: List[OpenaiNewsResponse] = []
        hackernoon_articles: List[HackernoonResponse] = []

        for row in articles:
            data = {
                "title": row[0],
                "url": row[1],
                "description": row[2],
                "category_id": row[3],
                "subcategory_id": row[4],
            }
            src = row[5]
            if src == "GOOGLE":
                google_articles.append(GoogleNewsResponse(**data))
            elif src == "ANTHROPIC":
                anthropic_articles.append(AnthropicNewsResponse(**data))
            elif src == "OPENAI":
                openai_articles.append(OpenaiNewsResponse(**data))
            elif src == "HACKERNOON":
                hackernoon_articles.append(HackernoonResponse(**data))

        return (
            tuple(google_articles),
            tuple(anthropic_articles),
            tuple(openai_articles),
            tuple(hackernoon_articles),
        )

    async def get_today_news(
        self, user_id: str, session: AsyncSession
    ) -> TodayNewsResponse:
        # Current time in UTC (or your DB timezone)
        now = datetime.now(timezone.utc)
        # THis is the filter after mindnight 12
        today = datetime.combine(now.date(), time(0, 0, 0, tzinfo=timezone.utc))
        user_subcategories: List[str] = (
            await self.category_service.get_user_subcategories_id(
                user_id=user_id, session=session
            )
        )

        statement = select(
            Articles.title,
            Articles.url,
            Articles.description,
            Articles.category_id,
            Articles.subcategory_id,
            Articles.source,
        ).where(
            Articles.published_on >= today,
            Articles.subcategory_id.in_(user_subcategories),
        )

        result = await session.execute(statement)
        articles = result.all()

        google_articles, anthropic_articles, openai_articles, hackernoon_articles = (
            await NewsDBService.get_separate_sources(articles=articles)
        )

        today_news_response = TodayNewsResponse(
            google=google_articles,
            anthropic=anthropic_articles,
            openai=openai_articles,
            hackernoon=hackernoon_articles,
        )
        return today_news_response

    async def create_article(
        self,
        article: ServiceArticle,
        session: AsyncSession,
    ) -> None:
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

        async with session.begin():
            session.add(article_orm)
            if len(user_defined_classification) != 0:
                session.add_all(user_defined_classification)

        return

    async def bulk_create_articles(
        self,
        articles: List[ServiceArticle],
        session: AsyncSession,
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

        # commit is automatically handled by commit.
        async with session.begin():
            session.add_all(article_orms)
            if len(classification_orms) != 0:
                for classification_orm in classification_orms:
                    session.add_all(classification_orm)

        return

    async def check_guid(self, guid: str, source: str, session: AsyncSession):
        """Check the existence of guid of articles object."""
        statement = select(Articles).where(
            Articles.guid == guid and Articles.source == source
        )
        result = await session.execute(statement)
        return result.scalar_one_or_none()

    async def get_all_guids(
        self, session: AsyncSession, source: str, cutoff_hours: int | None = 24
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
        result = await session.execute(statement)
        return result.scalars().all()
