# Californication Movie Reservation System

A robust backend API for a cinema management and ticket reservation platform. Built with Django REST Framework, this system handles user authentication, movie schedules, ticket bookings, payment processing, and asynchronous background tasks.

## Core Features

* **Movie & Showtime Management:** Browse current movies, manage reviews, and track daily showtimes.
* **Ticketing & Reservations:** Create bookings, track transaction statuses, and process payment events via secure webhooks.
* **Automated Background Tasks:** Asynchronous task processing—such as automatically canceling unpaid reservations after a timeout—powered by Celery.
* **Administrative Reporting:** Track showtime occupancy and access detailed cinema management analytics.
* **User Management:** Secure registration, authentication, and role-based access control.

## Tech Stack

* **Framework:** Python, Django, Django REST Framework (DRF)
* **Database:** PostgreSQL
* **Message Broker / Task Queue:** RabbitMQ & Celery
* **Containerization:** Docker & Docker Compose

## Project Structure

The repository is organized into modular Django apps:

* `cinema_config/`: Core Django settings, routing (URL/ASGI/WSGI), and Celery app configuration.
* `movies/`: Models, views, and serializers for managing movies, reviews, and cinema catalog data.
* `reservations/`: Booking logic, payment tracking (`transaction_id`), webhook handlers, and background tasks (`tasks.py`).
* `users/`: Custom user models, authentication protocols, and permission logic.

## Getting Started

### Prerequisites

* Docker and Docker Compose installed on your machine.

### Installation & Setup

1. **Clone the repository:**
```bash
git clone <repository-url>
cd californication-movie-reservation-system

```


2. **Configure Environment Variables:**
Copy the example environment file and update it with your local credentials (database connection, message broker URLs, and secret keys).
```bash
cp .env.example .env

```


3. **Build and Run the Containers:**
Start the application, database, and message broker services using Docker Compose.
```bash
docker compose up --build

```


4. **Apply Database Migrations:**
Once the containers are running, apply the initial migrations to set up your database schema.
```bash
docker compose exec web python manage.py migrate

```


5. **Create a Superuser (Optional):**
To access the Django admin panel and administrative reporting features.
```bash
docker compose exec web python manage.py createsuperuser

```
