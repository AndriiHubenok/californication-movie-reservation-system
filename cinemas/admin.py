from django.contrib import admin

from cinemas.models import Cinema, Hall, Seat

admin.site.register(Cinema)
admin.site.register(Seat)
admin.site.register(Hall)