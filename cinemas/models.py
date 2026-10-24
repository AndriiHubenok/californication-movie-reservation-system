from django.contrib.gis.db import models

class Cinema(models.Model):
    name = models.CharField(max_length=100)
    location = models.PointField()
    address = models.CharField(max_length=200)

    def __str__(self):
        return self.name

class Hall(models.Model):
    cinema = models.ForeignKey(Cinema, on_delete=models.CASCADE, related_name='halls', null=True)
    name = models.CharField(max_length=100)
    total_seats = models.IntegerField()

    def __str__(self):
        cinema_name = self.cinema.name if self.cinema else "No Cinema"
        return f"{cinema_name} - {self.name} - {self.total_seats}"

class Seat(models.Model):
    hall = models.ForeignKey(Hall, on_delete=models.CASCADE, related_name='seats')
    row = models.CharField(max_length=10)
    number = models.IntegerField()

    class Meta:
        unique_together = ('hall', 'row', 'number')

    def __str__(self):
        return f"{self.hall.name} - Row {self.row}, Seat {self.number}"