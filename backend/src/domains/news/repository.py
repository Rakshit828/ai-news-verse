import uuid
import json
from uuid import UUID
from sqlalchemy import select, delete, insert, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import aliased, with_loader_criteria, joinedload
from typing import Sequence, List, Literal, Tuple
from datetime import datetime, timezone, time, timedelta


from src.db.schemas import (
    Category,
    SubCategory,
    UserSubCategory,
    Articles,
)
from src.db.dependencies import get_session
from src.response import AppError
from src.domains.news.models import (
    CategoriesDataResponse,
    UpdateUsersCategoryModel,
    SetUsersCategoryModel,
)
from loguru import logger


class NewsCategoryRepository:
    async def get_category_by_id(
        self, id: str, session: AsyncSession
    ) -> Category | None:
        """Gives category orm object by id."""
        statement = select(Category).where(Category.id == id)
        result = await session.execute(statement)
        category = result.scalar_one_or_none()
        return category

    async def get_subcategory_by_id(
        self, id: str, session: AsyncSession
    ) -> SubCategory | None:
        """Gives category orm object by id."""
        statement = select(SubCategory).where(SubCategory.id == id)
        result = await session.execute(statement)
        subcategory = result.scalar_one_or_none()
        return subcategory

    async def get_categories_data(
        self, session: AsyncSession
    ) -> CategoriesDataResponse:
        """Returs the full category and subcategory data from the table except custom ones."""
        statement = select(Category).options(
            joinedload(Category.subcategories),
        )
        logger.info(f"[SQL] {statement}")
        result = await session.execute(statement)
        categories: List[Category] = result.unique().scalars().all()
        return CategoriesDataResponse(categories=categories)

    async def get_categories_data_of_user(
        self, user_id: str, session: AsyncSession
    ) -> CategoriesDataResponse:
        """Returns the full category and subcategory data for a specific user."""
        statement = (
            select(
                UserSubCategory.subcategory_id,
                SubCategory.name,
                Category.id,
                Category.name,
            )
            .join(SubCategory, UserSubCategory.subcategory_id == SubCategory.id)
            .join(Category, SubCategory.category_id == Category.id)
            .where(UserSubCategory.user_id == user_id)
            .order_by(Category.id)
        )

        logger.info(f"[SQL] {statement}")
        result = await session.execute(statement)
        rows = result.all()

        # Build nested structure: categories with their subcategories
        categories_dict: dict = {}
        for subcategory_id, subcategory_name, category_id, category_name in rows:
            if category_id not in categories_dict:
                categories_dict[category_id] = {
                    "id": category_id,
                    "name": category_name,
                    "subcategories": []
                }
            categories_dict[category_id]["subcategories"].append({
                "id": subcategory_id,
                "name": subcategory_name
            })

        categories = list(categories_dict.values())
        return CategoriesDataResponse(categories=categories)


    async def get_subcategory_column(
        self, column: Literal["subcategory_id", "name"], session: AsyncSession
    ) -> List[str] | None:
        """Returns all the value in the given column of Subcategory table."""
        match (column):
            case "subcategory_id":
                statement = select(SubCategory.subcategory_id)
            case "name":
                statement = select(SubCategory.name)

        result = (await session.execute(statement)).scalars().all()
        return result if result else None

    async def get_category_column(
        self, column: Literal["category_id", "name"], session: AsyncSession
    ) -> List[UUID] | List[str] | None:
        """Returns all the ids of subcategories."""
        match (column):
            case "category_id":
                statement = select(Category.category_id).where(
                    Category.added_by_users == False
                )
            case "name":
                statement = select(Category.name)
        result = (await session.execute(statement=statement)).scalars().all()
        return result if result else None

    async def get_subcategories_for_category_by_id(
        self, category_id: str, session: AsyncSession
    ) -> Sequence[SubCategory]:
        """Returns all the Subcategory ORM object related to Category table."""
        statement = select(SubCategory).where(SubCategory.category_id == category_id)
        result = await session.execute(statement)
        subcategories = result.scalars().all()
        return subcategories

    async def set_user_categories(
        self,
        user_id: str,
        categories_data: SetUsersCategoryModel,
        session: AsyncSession,
    ):
        subcategories: set[str] = set(categories_data.categories)
        user_subcategory_ids: list[str] = await self.get_user_subcategories_id(
            user_id=user_id, session=session
        )

        construct_add_stmt = lambda subcategory_ids: insert(UserSubCategory).values(
            [
                {"user_id": user_id, "subcategory_id": subcategory_id}
                for subcategory_id in subcategory_ids
            ]
        )

        if user_subcategory_ids is not None:
            to_be_added = subcategories - set(user_subcategory_ids)
            to_be_deleted = set(user_subcategory_ids) - subcategories

            add_stmt = construct_add_stmt(to_be_added)
            delete_stmt = delete(UserSubCategory).where(
                UserSubCategory.user_id == user_id,
                UserSubCategory.subcategory_id.in_(to_be_deleted),
            )

            await session.execute(add_stmt)
            await session.execute(delete_stmt)
        else:
            add_stmt = construct_add_stmt(subcategories)
            await session.execute(add_stmt)

    async def delete_user_subcategories(
        self, user_id: str, subcategory_ids: List[str], session: AsyncSession
    ) -> None:
        """Deletes the category and all the subcategories for a user."""
        stmt = delete(UserSubCategory).where(
            UserSubCategory.user_id == user_id,
            UserSubCategory.subcategory_id.in_(subcategory_ids),
        )
        await session.execute(stmt)

    async def get_user_subcategories_id(
        self, user_id: str, session: AsyncSession
    ) -> List[str] | None:
        """Returns the list of the ids of the subcategory related to the user."""
        statement = select(UserSubCategory.subcategory_id).where(
            UserSubCategory.user_id == user_id
        )
        result = await session.execute(statement)
        subcategory_ids = result.scalars().all()
        return subcategory_ids if subcategory_ids else None

    async def get_user_categories_id(
        self, user_id: str, session: AsyncSession
    ) -> List[str] | None:
        """Returns the list of the ids of the category related to the user."""
        stmt = (
            select(UserSubCategory.category_id)
            .where(UserSubCategory.user_id == user_id)
            .distinct()
        )
        logger.info(f"[SQL] {stmt}")
        result = await session.execute(stmt)
        category_ids = result.scalars().all()
        return category_ids if category_ids else None


class NewsArticleRepository:
    pass


async def main():
    repo = NewsCategoryRepository()
    async for session in get_session():
        result = await repo.get_user_categories_id(user_id="")

    print(result)


if __name__ == "__main__":
    import asyncio as aio

    aio.run(main())
