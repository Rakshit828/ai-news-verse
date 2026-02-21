from celery import Celery
from celery.schedules import crontab, schedule
from app.config import CONFIG

app = Celery(
    "celery_app",
    broker=CONFIG.CELERY_BROKER_URL,
)

app.autodiscover_tasks(['app.background_tasks'])


# Optional global configuration
app.conf.update(
    task_track_started=True,  # Track when tasks start
    task_serializer='json',  # Options: json, pickle, msgpack
    accept_content=['json'],  # Only accept JSON tasks
    timezone='UTC',
    enable_utc=True,
)


CELERY_BEAT_SCHEDULE = {
    "fetch_classify_notify_google": {
        "task": "app.background_tasks.tasks.fetch_classify_notify",
        "schedule": crontab(hour=0, minute=0),
        "args": ('GOOGLE',)
    },
    "fetch_classify_notify_openai": {
        "task": "app.background_tasks.tasks.fetch_classify_notify",
        "schedule": crontab(hour=0, minute=0),
        "args": ('OPENAI',)
    },
    "fetch_classify_notify_anthropic": {
        "task": "app.background_tasks.tasks.fetch_classify_notify",
        "schedule": crontab(hour=0, minute=0),
        "args": ('ANTHROPIC',)
    },
    "fetch_classify_notify_hackernoon": {
        "task": "app.background_tasks.tasks.fetch_classify_notify",
        "schedule": crontab(hour=0, minute=0),
        "args": ('HACKERNOON',)
    },
    "test_task_every_60s": {
        "task": "app.background_tasks.tasks.test_task",
        "schedule": schedule(run_every=60),
        "args": (1,)
    },
    "test_task_at_22_08": {
        "task": "app.background_tasks.tasks.test_task",
        "schedule": crontab(hour=22, minute=20),
        "args": (2,)
    }

}

app.conf.beat_schedule = CELERY_BEAT_SCHEDULE
