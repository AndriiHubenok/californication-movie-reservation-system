from django.contrib.gis.db import models

class Cinema(models.Model):
    name = models.CharField(max_length=100)
    location = models.PointField()
    address = models.CharField(max_length=200)
