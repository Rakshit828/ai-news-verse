from src.worker.celery_app import app
from src.worker.repository import NewsRepository, init_repository
from typing import Literal
from loguru import logger




@app.task(name="src.worker.tasks.fetch_classify_notify")
def fetch_classify_notify(
    source: Literal["OPENAI", "GOOGLE", "ANTHROPIC", "HACKERNOON"],
):
    repo: NewsRepository = init_repository()
    repo.fetch_classify_and_save_articles(
        source=source,
        cutoff_hours=24,
        commit_on_each=True,
        scrape_content=False,
    )
    repo.classifier.close_pc_connection()
