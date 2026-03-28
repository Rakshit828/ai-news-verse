from app.background_tasks.celery_app import app
from app.repository import NewsRepository, init_repository
from typing import Literal
import anyio
from loguru import logger


async def run_fetch(source: Literal["OPENAI", "GOOGLE", "ANTHROPIC", "HACKERNOON"]):
    repo: NewsRepository = await init_repository()
    await repo.fetch_classify_and_save_articles(
        source=source,
        cutoff_hours=24,
        commit_on_each=True,
        scrape_content=False,
    )
    await repo.classifier.close_pc_connection()


@app.task(name="app.background_tasks.tasks.fetch_classify_notify")
def fetch_classify_notify(
    source: Literal["OPENAI", "GOOGLE", "ANTHROPIC", "HACKERNOON"],
):
    anyio.run(run_fetch, source)
