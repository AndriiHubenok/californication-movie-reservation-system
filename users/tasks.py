import requests
from celery import shared_task
from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes

User = get_user_model()

@shared_task
def send_verification_email_task(user_id, domain):
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return "User not found"

    # Encode User ID and generate token
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)

    verification_link = f"http://{domain}/api/verify/{uid}/{token}/"

    subject = "Account Verification 🎬"

    text_body = f"Hello, {user.username}!\nPlease, accept your email, click on this link:\n{verification_link}"

    html_body = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f4f4f5; padding: 20px; border-radius: 8px;">
        <div style="text-align: center; padding-bottom: 20px;">
            <h1 style="color: #18181b; margin-bottom: 0;">🎬 Californication Cinema</h1>
        </div>
        <div style="background-color: #ffffff; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
            <h2 style="color: #18181b; margin-top: 0;">Hello, {user.username}! 🍿</h2>
            <p style="color: #52525b; font-size: 16px; line-height: 1.6;">
                Welcome to Californication Movie Reservation! To complete your registration and start booking tickets, please verify your email address by clicking the button below.
            </p>
            <div style="text-align: center; margin: 35px 0;">
                <a href="{verification_link}" style="background-color: #e50914; color: #ffffff; padding: 14px 32px; text-decoration: none; font-size: 16px; font-weight: bold; border-radius: 6px; display: inline-block;">Verify Email</a>
            </div>
            <p style="color: #71717a; font-size: 14px; margin-bottom: 0; line-height: 1.5;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="{verification_link}" style="color: #2563eb; word-break: break-all;">{verification_link}</a>
            </p>
        </div>
        <div style="text-align: center; padding-top: 20px; color: #a1a1aa; font-size: 12px;">
            <p>If you didn't request this email, you can safely ignore it.</p>
        </div>
    </div>
    """

    response = requests.post(
        settings.MAILGUN_URL,
        auth=("api", settings.MAILGUN_API_KEY),
        data={
            "from": "Californication Movie Reservation <postmaster@sandbox3bd2839b3f3a4069830b856b1dc8ce13.mailgun.org>",
            "to": user.email,
            "subject": subject,
            "text": text_body,
            "html": html_body,
        }
    )

    response.raise_for_status()
    return f"Email sent successfully to {user.email}"