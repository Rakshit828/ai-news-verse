import asyncio
from src.services.ai_news_service import CategoriesDBService

async def main():
    from src.db.dependencies import get_session

    category_services = CategoriesDBService()
    async for session in get_session():
        await category_services._initialize_categories(session)
        await category_services.get_categories_data(session)


if __name__ == "__main__":
    asyncio.run(main())
