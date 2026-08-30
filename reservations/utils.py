import requests

from cinema_config import settings


def send_reservation_email(reservation, email, user, payment_intent_id):
    movie_title = reservation.showtime.movie.title
    start_time = reservation.showtime.start_time.strftime("%d %b %Y, %H:%M")
    price = reservation.showtime.price

    subject = f"🎬 Your ticket for '{movie_title}' accepted!"

    text_body = f"""
    Hello, {user.username}!
    
    Your payment was processing successfully. Details of your reservation:
    
    Movie: {movie_title}
    Time: {start_time}
    Paid: ${price}
    Reservation number: #{reservation.id}
    Transaction: {payment_intent_id}
    
    Enjoy your stay!
    """

    html_body = f"""
    <h2>Hello, {user.username}! 🍿</h2>
    <p>Your payment was processing successfully. Details of your reservation:</p>
    <ul>
        <li><strong>Movie:</strong> {movie_title}</li>
        <li><strong>Time:</strong> {start_time}</li>
        <li><strong>Paid:</strong> ${price}</li>
        <li><strong>Reservation number:</strong> #{reservation.id}</li>
    </ul>
    <p><small>Transaction: {payment_intent_id}</small></p>
    <p>Enjoy your stay!</p>
    """

    requests.post(
        settings.MAILGUN_URL,
        auth=("api", settings.MAILGUN_API_KEY),
        data={
            "from": "Cinema Reservation <postmaster@sandbox3bd2839b3f3a4069830b856b1dc8ce13.mailgun.org>",
            "to": email,
            "subject": subject,
            "text": text_body,
            "html": html_body
        }
    )