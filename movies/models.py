from django.db import models

from cinema_config import settings
from cinemas.models import Cinema

class Genre(models.Model):

    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

class Movie(models.Model):

    title = models.CharField(max_length=255)
    description = models.TextField()

    poster = models.ImageField(upload_to='posters/', blank=True, null=True)

    genres = models.ManyToManyField(Genre, related_name='movies')

    def __str__(self):
        return self.title

class Review(models.Model):

    movie = models.ForeignKey(Movie, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reviews')
    points = models.IntegerField(default=0)
    grade = models.PositiveIntegerField(choices=[(i, i) for i in range(1, 11)])
    comment = models.TextField(max_length=500)
    created_at = models.DateTimeField(auto_now_add=True)

class Hall(models.Model):
    cinema = models.ForeignKey(Cinema, on_delete=models.CASCADE, related_name='halls', null=True)
    name = models.CharField(max_length=100)
    total_seats = models.IntegerField()

    def __str__(self):
        return f"{self.cinema.name} - {self.name} - {self.total_seats}"

class Seat(models.Model):

    hall = models.ForeignKey(Hall, on_delete=models.CASCADE, related_name='seats')
    row = models.CharField(max_length=10)
    number = models.IntegerField()

    class Meta:
        unique_together = ('hall', 'row', 'number')

    def __str__(self):
        return f"{self.hall.name} - Row {self.row}, Seat {self.number}"

class Showtime(models.Model):

    movie = models.ForeignKey(Movie, on_delete=models.CASCADE, related_name='showtimes')
    hall = models.ForeignKey(Hall, on_delete=models.CASCADE, related_name='showtimes')
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    price = models.DecimalField(max_digits=6, decimal_places=2)

    def __str__(self):
        return f"{self.movie.title} ({self.hall.name}) - {self.start_time.strftime('%Y-%m-%d %H:%M')}"