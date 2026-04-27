from src.db.schemas import Category, SubCategory
from sqlalchemy.ext.asyncio.session import AsyncSession
from src.db.dependencies import get_session
import json


async def _initialize_categories(session: AsyncSession):
        with open("D:/GenAI/AiNewsSystem/backend/src/db/category.json", "r") as file:
            data = json.load(file)
        categories_data = data["categories"]
        category_orms = []
        subcategory_orms = []

        for category in categories_data:
            category_orms.append(
                Category(
                    id=category["category_id"],
                    name=category["title"],
                )
            )
            subcategories = category["subcategories"]
            for subcategory in subcategories:
                subcategory_orms.append(
                    SubCategory(
                        id=subcategory["subcategory_id"],
                        name=subcategory["title"],
                        category_id=category["category_id"],
                    )
                )

        session.add_all(category_orms)
        session.add_all(subcategory_orms)
        await session.flush()


async def main():
    async for session in get_session():
        await _initialize_categories(session)


if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
    