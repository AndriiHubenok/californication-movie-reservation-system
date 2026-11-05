from django.contrib import admin

from reservations.models import Reservation


@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'showtime', 'status', 'created_at')
    list_filter = ('status', 'showtime__movie')
    search_fields = ('user__username',)
