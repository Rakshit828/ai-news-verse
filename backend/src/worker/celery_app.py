from celery import Celery
from celery.schedules import crontab, schedule
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


NEWS_REFETCH_MINUTE = 5


CELERY_BEAT_SCHEDULE = {
    "fetch_classify_notify_openai": {
        "task": "src.worker.tasks.fetch_classify_notify",
        "schedule": schedule(run_every=NEWS_REFETCH_MINUTE * 60),
        "args": ("OPENAI",),
    },
    "fetch_classify_notify_anthropic": {
        "task": "src.worker.tasks.fetch_classify_notify",
        "schedule": schedule(run_every=NEWS_REFETCH_MINUTE * 60),
        "args": ("ANTHROPIC",),
    },
    "fetch_classify_notify_hackernoon": {
        "task": "src.worker.tasks.fetch_classify_notify",
        "schedule": schedule(run_every=NEWS_REFETCH_MINUTE * 60),
        "args": ("HACKERNOON",),
    },
    "fetch_classify_notify_google": {
        "task": "src.worker.tasks.fetch_classify_notify",
        "schedule": schedule(run_every=NEWS_REFETCH_MINUTE * 60),
        "args": ("GOOGLE",),
    },
}


app.conf.beat_schedule = CELERY_BEAT_SCHEDULE
