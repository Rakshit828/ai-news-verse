from celery import Celery
from celery.schedules import crontab, schedule

app = Celery(
    "celery_app",
    broker='redis://localhost:6379/0',
    backend='redis://localhost:6379/1'
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
    "fetch-news-every-30min": {
        "task": "celery_app.scrape_and_store_news",
        "schedule": schedule(60)
    }
}

app.conf.beat_schedule = CELERY_BEAT_SCHEDULE