from celery import Celery
from celery.schedules import crontab
from src.config import CONFIG

app = Celery(
    "celery_app",
    broker=CONFIG.CELERY_BROKER_URL,
)

app.autodiscover_tasks(["src.worker"])


# Optional global configuration
app.conf.update(
    task_track_started=True,  # Track when tasks start
    task_serializer="json",  # Options: json, pickle, msgpack
    accept_content=["json"],  # Only accept JSON tasks
    timezone="Asia/Kathmandu",
    enable_utc=True,
)


NEWS_REFETCH_INTERVAL_SECONDS = 20 * 60  # 5 minutes
GOOGLE_NEWS_REFETCH = 30 * 60  # 30 minutes


CELERY_BEAT_SCHEDULE = {
    "fetch_classify_notify_openai": {
        "task": "src.worker.tasks.fetch_classify_notify",
        "schedule": NEWS_REFETCH_INTERVAL_SECONDS,
        "args": ("OPENAI",),
    },
    "fetch_classify_notify_anthropic": {
        "task": "src.worker.tasks.fetch_classify_notify",
        "schedule": NEWS_REFETCH_INTERVAL_SECONDS,
        "args": ("ANTHROPIC",),
    },
    "fetch_classify_notify_hackernoon": {
        "task": "src.worker.tasks.fetch_classify_notify",
        "schedule": NEWS_REFETCH_INTERVAL_SECONDS,
        "args": ("HACKERNOON",),
    },
    "fetch_classify_notify_google": {
        "task": "src.worker.tasks.fetch_classify_notify",
        "schedule": GOOGLE_NEWS_REFETCH,
        "args": ("GOOGLE",),
    },
}


app.conf.beat_schedule = CELERY_BEAT_SCHEDULE
