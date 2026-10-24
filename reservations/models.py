from django.db import models

from cinema_config import settings
from cinemas.models import Seat
from movies.models import Showtime


class Reservation(models.Model):

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reservations')
    showtime = models.ForeignKey(Showtime, on_delete=models.CASCADE, related_name='reservations')

    seat = models.ForeignKey(Seat, on_delete=models.PROTECT, related_name='reservations')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    ticket = models.FileField(upload_to='tickets/', blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:

        unique_together = ('showtime', 'seat')

    def __str__(self):
        return f"{self.user.username} - {self.showtime.movie.title} ({self.seat})"

class Payment(models.Model):

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
    ]

    transaction_id = models.CharField()
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='payments')
    reservation = models.ForeignKey(Reservation, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=6, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    created_at = models.DateTimeField(auto_now_add=True)

