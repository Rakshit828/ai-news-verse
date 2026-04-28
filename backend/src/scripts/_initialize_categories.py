from src.db.schemas import Category, SubCategory
from sqlalchemy.ext.asyncio.session import AsyncSession
from src.db.dependencies import get_session
from src.domains.news.repository import NewsCategoryRepository
import json
from loguru import logger
from pathlib import Path


async def _initialize_categories(
    session: AsyncSession, category_repo: NewsCategoryRepository
):

    result = await category_repo.get_categories_data(session=session)
    logger.info("Categories existed : ", result)
    if result:
        logger.info("Data existed already. Not initializing.")
        return

    BASE_DIR = Path(__file__).resolve().parent.parent  # points to /contenerization/src
    file_path = BASE_DIR / "db" / "category.json"
    logger.info("Data initialization started.")

    with open(file_path, "r") as file:
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
