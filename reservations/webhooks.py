import stripe
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt

from cinema_config import settings
from reservations.models import Reservation, Payment


@csrf_exempt
def stripe_webhook(request):
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
    endpoint_secret = settings.STRIPE_WEBHOOK_SECRET

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, endpoint_secret
        )
    except ValueError as e:
        print("WEBHOOK ERROR: Invalid payload", e)
        return HttpResponse(status=400)
    except stripe.error.SignatureVerificationError as e:
        print("WEBHOOK ERROR: Invalid signature! Check STRIPE_WEBHOOK_SECRET in .env", e)
        return HttpResponse(status=400)
    except Exception as e:
        print("WEBHOOK ERROR: Unknown error", e)
        return HttpResponse(status=400)

    if event['type'] == 'payment_intent.succeeded':
        payment_intent = event['data']['object']

        payment_intent_data = payment_intent.to_dict()
        reservation_id = payment_intent_data.get("metadata", {}).get("reservation_id")

        if reservation_id:
            try:
                reservation = Reservation.objects.get(id=reservation_id)

                if reservation.status == 'pending':
                    reservation.status = 'confirmed'
                    reservation.save()

                    Payment.objects.create(
                        user=reservation.user,
                        amount=reservation.showtime.price,
                        reservation=reservation,
                        status='confirmed',
                        transaction_id=payment_intent.id
                    )
            except Reservation.DoesNotExist:
                pass


    return HttpResponse(status=200)