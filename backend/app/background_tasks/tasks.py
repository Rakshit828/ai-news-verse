from asgiref.sync import async_to_sync
from app.background_tasks.celery_app import app
from app.database.main import get_session
from app.repository import NewsRepository, init_repository

repo: NewsRepository = async_to_sync(init_repository)()


@app.task(name="celery_app.scrape_and_store_news")
def scrape_and_store_news():
    async_to_sync(repo.fetch_classify_and_save_articles(
        source="GOOGLE",
        cutoff_hours=24,
        commit_on_each=True,
    ))()
