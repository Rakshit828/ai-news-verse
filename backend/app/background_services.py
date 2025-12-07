import asyncio
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from loguru import logger

from app.database.main import get_session
from app.news_service.google import GoogleService
from app.news_service.anthropic import AnthropicService
from app.news_service.openai import OpenAiService
from app.news_service.hackernoon import HackernoonService
# from app.notifications import notification_manager

scheduler = AsyncIOScheduler()


async def fetch_news_job():
    logger.info("Starting background news fetch...")
    try:
        # We need a session. get_session is a generator.
        # We iterate over it to get the session.
        async for session in get_session():
            google_service = await GoogleService.create()
            anthropic_service = await AnthropicService.create()
            openai_service = await OpenAiService.create()
            hackernoon_service = await HackernoonService.create()

            services = [
                google_service,
                anthropic_service,
                openai_service,
                hackernoon_service,
            ]

            # Fetch for all services
            tasks = [
                service.fetch_and_save_articles(
                    session=session,
                    cutoff_hours=1,
                    commit_on_each=True,
                    scrape_content=False,
                )
                for service in services
            ]
            (
                google_response,
                anthropic_response,
                openai_response,
                hackernoon_response,
            ) = await asyncio.gather(*tasks)

            return f"Total google articles are {google_response}"

    except Exception as e:
        logger.error(f"Critical error in fetch_news_job: {e}")



async def start_scheduler():
    scheduler.add_job(fetch_news_job, 'interval', minutes=1)
    scheduler.start()
    while True:
        await asyncio.sleep(1)


if __name__ == '__main__':
    asyncio.run(start_scheduler())