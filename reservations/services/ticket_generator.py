import base64
import io
import qrcode
from django.template.loader import render_to_string
from weasyprint import HTML, CSS


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


def generate_ticket_pdf(reservation) -> bytes:
    """
    Render HTML-template of the ticket and compile it into a PDF using WeasyPrint.
    """
    qr_payload = f"TICKET:{reservation.id}:{reservation.user_id}"
    qr_code_uri = generate_qr_code_base64(qr_payload)

    context = {
        "reservation": reservation,
        "movie": reservation.session.movie,
        "cinema": reservation.session.cinema_hall.cinema,
        "hall": reservation.session.cinema_hall,
        "session": reservation.session,
        "seats": reservation.seats.all(),
        "qr_code_uri": qr_code_uri,
    }

    filepath = f"tickets/ticket_{reservation.id}.html"
    html_content = render_to_string(filepath, context)
    pdf_bytes = HTML(string=html_content).write_pdf()
    reservation.ticket = filepath

    return pdf_bytes