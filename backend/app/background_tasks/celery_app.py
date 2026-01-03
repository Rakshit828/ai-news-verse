from celery import Celery
from celery.schedules import crontab, schedule
from app.config import CONFIG

app = Celery(
    "celery_app",
    broker=CONFIG.CELERY_BROKER_URL,
    backend=CONFIG.CELERY_RESULT_BACKEND
)

app.autodiscover_tasks()


# Optional global configuration
app.conf.update(
    result_expires=3600,  # Time in seconds after which results expire
    task_track_started=True,  # Track when tasks start
    task_serializer='json',  # Options: json, pickle, msgpack
    result_serializer='json',  # Options: json, pickle, msgpack
    accept_content=['json'],  # Only accept JSON tasks
    timezone='UTC',
    enable_utc=True,
    task_annotations={
        '*': {'rate_limit': '10/s'}  # Limit task execution rate globally
    },
)


CELERY_BEAT_SCHEDULE = {
    "fetch-news-everyday-at-12-00": {
        "task": "celery_app.scrape_and_store_news",
        "schedule": crontab(hour=12, minute=0)
    }
}

app.conf.beat_schedule = CELERY_BEAT_SCHEDULE