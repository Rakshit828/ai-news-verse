from app.celery_app import app


from app.news_service import OPENAI_SERVICE, GOOGLE_SERVICE, ANTHROPIC_SERVICE, HACKERNOON_SERVICE
from app.database.main import get_session

@app.task
async def scrape_and_store_news():
    async for session in get_session():
        await OPENAI_SERVICE.fetch_classify_and_save_articles(
            session=session, cutoff_hours=24, commit_on_each=True, scrape_content=False
        )
        await GOOGLE_SERVICE.fetch_classify_and_save_articles(
            session=session, cutoff_hours=24, commit_on_each=True, scrape_content=False
        )
        await ANTHROPIC_SERVICE.fetch_classify_and_save_articles(
            session=session, cutoff_hours=24, commit_on_each=True, scrape_content=False
        )
        await HACKERNOON_SERVICE.fetch_classify_and_save_articles(
            session=session, cutoff_hours=24, commit_on_each=True, scrape_content=False
        )
