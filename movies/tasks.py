from datetime import datetime

from celery import shared_task
from django.utils import timezone

from movies.models import Showtime

@shared_task
def delete_completed_showtime(showtime_id):
    try:
        showtime = Showtime.objects.get(id=showtime_id)
    except Showtime.DoesNotExist:
        return f"Showtime {showtime_id} already deleted or not found."

    if showtime.end_time <= timezone.now():
        showtime.delete()
        return f"Showtime {showtime_id} deleted successfully."

    return f"Showtime {showtime_id} not deleted. End time was changed."