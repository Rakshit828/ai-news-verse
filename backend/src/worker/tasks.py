from src.worker.celery_app import app
from src.worker.repository import NewsRepository, init_repository
from typing import Literal
from loguru import logger


@app.task(name="src.worker.tasks.fetch_classify_notify", bind=True, max_retries=3)
def fetch_classify_notify(
    self,
    source: Literal["OPENAI", "GOOGLE", "ANTHROPIC", "HACKERNOON"],
):
    """Celery task: Fetch articles, classify them, and publish notifications.

    Args:
        source: News source to fetch from

    Returns:
        Number of articles processed
    """
    try:
        logger.info(f"Starting fetch_classify_notify task for source: {source}")

        repo: NewsRepository = init_repository()
        no_articles = repo.fetch_classify_and_save_articles(
            source=source,
            cutoff_hours=24,
            commit_on_each=True,
            scrape_content=False,
        )

        repo.classifier.close_pc_connection()

        logger.info(
            f"Completed fetch_classify_notify task for {source}. Processed {no_articles} articles."
        )
        return no_articles

    except Exception as exc:
        repo.classifier.close_pc_connection()
        logger.error(f"Error in fetch_classify_notify for {source}: {str(exc)}")
        # Retry with exponential backoff
        raise self.retry(exc=exc, countdown=60)
