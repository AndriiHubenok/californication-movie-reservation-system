import os
from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cinema_config.settings')

app = Celery('cinema_config')

app.config_from_object('django.conf:settings', namespace='CELERY')

app.autodiscover_tasks()

# celery -A cinema_config worker --loglevel=info -P solo