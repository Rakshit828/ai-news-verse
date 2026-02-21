from app.background_tasks.celery_app import app
from app.db.dependencies import get_session
from app.repository import NewsRepository, init_repository
from asgiref.sync import async_to_sync
from typing import Literal
from loguru import logger

repo: NewsRepository = async_to_sync(init_repository)()


@app.task(name="app.background_tasks.tasks.fetch_classify_notify")
def fetch_classify_notify(source: Literal["OPENAI", "GOOGLE", "ANTHROPIC", "HACKERNOON"]):
    async_to_sync(
        repo.fetch_classify_and_save_articles(
            source="GOOGLE", cutoff_hours=24, commit_on_each=True, scrape_content=False
        )
    )()


@app.task(name="app.background_tasks.tasks.test_task")
def test_task(id: int):
    import time
    logger.debug(f"Task {id} is running")
    time.sleep(5)
    logger.info(f"Task {id} finished.")
    