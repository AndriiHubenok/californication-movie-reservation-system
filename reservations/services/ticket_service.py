import base64
import io
import uuid

import qrcode
from django.core import signing
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from django.template.loader import render_to_string
from weasyprint import HTML, CSS

from movies.models import Showtime
from reservations.models import Ticket, Reservation


def generate_qr_code_base64(data: str) -> str:
    """
    Generate QR-Code and return it with base64
    """
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=8,
        border=2,
    )
    qr.add_data(data)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")
    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    qr_base64 = base64.b64encode(buffer.getvalue()).decode("utf-8")
    return f"data:image/png;base64,{qr_base64}"

def generate_ticket_pdf(reservation: Reservation) -> bytes:
    """
    Generates a PDF for the given reservation, including all tickets and their QR codes.
    """
    signer = signing.Signer(salt="ticket-check-in")

    tickets_data = []
    tickets = reservation.tickets.select_related(
        'showtime__movie',
        'showtime__hall__cinema',
        'seat'
    ).all()

    for ticket in tickets:
        signed_token = signer.sign(str(ticket.ticket_token))
        qr_code_uri = generate_qr_code_base64(signed_token)

        tickets_data.append({
            "ticket": ticket,
            "movie": ticket.showtime.movie,
            "cinema": ticket.showtime.hall.cinema,
            "hall": ticket.showtime.hall,
            "showtime": ticket.showtime,
            "seat": ticket.seat,
            "qr_code_uri": qr_code_uri,
        })

    context = {
        "reservation": reservation,
        "tickets_data": tickets_data,
    }

    html_content = render_to_string("tickets/all_tickets.html", context)

    pdf_bytes = HTML(string=html_content).write_pdf()

    filename = f"tickets/reservation_{reservation.id}_tickets.pdf"

    saved_path = default_storage.save(filename, ContentFile(pdf_bytes))

    reservation.tickets.all().update(ticket_url=saved_path)

    return pdf_bytes

def validate_scanned_ticket(qr_data: str):
    signer = signing.Signer(salt="ticket-check-in")
    try:
        ticket_token = signer.unsign(qr_data)
        return uuid.UUID(ticket_token)
    except (signing.BadSignature, ValueError):
        return None