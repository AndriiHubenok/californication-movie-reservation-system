# Californication Movie Reservation System

A Django-based movie theater reservation system with REST API, user authentication, and payment processing.

## Features

- **Movie Management**: Browse movies, showtimes, and cinema halls
- **Seat Reservation**: Real-time seat selection and booking
- **User Authentication**: JWT-based authentication with role-based access control
- **Payment Integration**: Stripe payment processing for reservations
- **Email Notifications**: Automated confirmation and reminder emails via Celery
- **REST API**: Full-featured API built with Django REST Framework

## Tech Stack

- **Backend**: Django 5.x, Django REST Framework
- **Database**: PostgreSQL
- **Authentication**: JWT (SimpleJWT)
- **Task Queue**: Celery with Redis broker
- **Payment**: Stripe API
- **Containerization**: Docker & Docker Compose

## Project Structure

```
californication-movie-reservation-system/
├── cinema_config/          # Django project settings
│   ├── settings.py         # Configuration (DB, Stripe, Celery, etc.)
│   ├── urls.py             # Main URL routing
│   ├── celery.py           # Celery app configuration
│   └── wsgi.py / asgi.py   # WSGI/ASGI entry points
├── movies/                 # Movie & showtime management
│   ├── models.py           # Movie, Showtime, CinemaHall, Seat models
│   ├── views.py            # API endpoints for movies/showtimes
│   ├── serializers.py      # DRF serializers
│   └── urls.py             # Movie app routes
├── reservations/           # Booking & payment logic
│   ├── models.py           # Reservation, Payment models
│   ├── views.py            # Reservation & payment endpoints
│   ├── tasks.py            # Celery tasks (emails, cleanup)
│   ├── webhooks.py         # Stripe webhook handlers
│   └── utils.py            # Reservation utilities
├── users/                  # User authentication
│   ├── models.py           # Custom User model
│   ├── views.py            # Auth endpoints
│   └── serializers.py      # User serializers
├── manage.py               # Django CLI entry point
├── requirements.txt        # Python dependencies
├── Dockerfile              # Docker image definition
├── compose.yaml            # Docker Compose services
└── .env.example            # Environment variables template
```

## Getting Started

### Prerequisites

- Docker & Docker Compose
- Python 3.11+ (for local development)

### Quick Start with Docker

1. **Clone the repository**
   ```bash
   git clone https://github.com/AndriiHubenok/californication-movie-reservation-system.git
   cd californication-movie-reservation-system
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your Stripe keys, DB credentials, etc.
   ```

3. **Start services**
   ```bash
   docker compose up --build
   ```

4. **Run migrations**
   ```bash
   docker compose exec web python manage.py migrate
   ```

5. **Create superuser**
   ```bash
   docker compose exec web python manage.py createsuperuser
   ```

6. **Access the API**
   - API: http://localhost:8000/api/
   - Django Admin: http://localhost:8000/admin/

### Local Development

1. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Run PostgreSQL & Redis (via Docker)**
   ```bash
   docker compose up db redis
   ```

4. **Run migrations**
   ```bash
   python manage.py migrate
   ```

5. **Start development server**
   ```bash
   python manage.py runserver
   ```

6. **Start Celery worker**
   ```bash
   celery -A cinema_config worker --loglevel=info
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register/` - Register new user
- `POST /api/auth/login/` - Login (returns JWT tokens)
- `POST /api/auth/refresh/` - Refresh access token
- `POST /api/auth/logout/` - Logout (blacklist token)

### Movies
- `GET /api/movies/` - List all movies
- `GET /api/movies/{id}/` - Get movie details
- `GET /api/showtimes/` - List showtimes
- `GET /api/cinema-halls/` - List cinema halls and seats

### Reservations
- `GET /api/reservations/` - List user's reservations
- `POST /api/reservations/` - Create reservation
- `GET /api/reservations/{id}/` - Get reservation details
- `DELETE /api/reservations/{id}/` - Cancel reservation

### Payments
- `POST /api/payments/create-intent/` - Create Stripe payment intent
- `POST /api/payments/webhook/` - Stripe webhook endpoint

## Environment Variables

See `.env.example` for required configuration:

```env
# Database
DB_NAME=movie_reservation
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=db
DB_PORT=5432

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Celery/Redis
CELERY_BROKER_URL=redis://redis:6379/0

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your_email@gmail.com
EMAIL_HOST_PASSWORD=your_app_password
```

## Development

### Running Tests
```bash
python manage.py test
```

### Code Style
This project follows PEP 8 guidelines. Consider using:
- `black` for formatting
- `flake8` for linting
- `isort` for import sorting

### Celery Tasks
- `send_reservation_confirmation` - Sends email after successful booking
- `send_reminder_email` - Sends reminder 24h before showtime
- `cleanup_expired_reservations` - Releases unconfirmed seats

## License

MIT License - feel free to use this project for learning or as a starting point for your own cinema reservation system.

## Author

**Andrii Hubenok**  
GitHub: [@AndriiHubenok](https://github.com/AndriiHubenok)
