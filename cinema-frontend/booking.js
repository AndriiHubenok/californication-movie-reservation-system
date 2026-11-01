import { MOCK_MOVIES } from './data.js';

const TICKET_PRICE = 10

const cinemaHallContainer = document.querySelector('.cinema-hall')
const movieTitleElement = document.querySelector('#movie-title')
const movieDetailsElement = document.querySelector('#movie-details')
const seatCountElement = document.querySelector('#count')
const totalPriceElement = document.querySelector('#total')
const confirmBookingBtn = document.querySelector('#confirm-booking-btn')

const movieId = new URLSearchParams(window.location.search).get('movieId')
const movie = MOCK_MOVIES.find(m => m.id === Number(movieId))
if (!movie) {
    window.location.href = 'index.html'
}

movieTitleElement.textContent = movie.title
movieDetailsElement.textContent = `Hall 1 - (${movie.duration} mins)`

let selectedSeats = []

function updateSummary() {
    const selectedSeats = cinemaHallContainer.querySelectorAll('.seat.selected')
    const count = selectedSeats.length

    seatCountElement.textContent = count.toString()
    totalPriceElement.textContent = (count * TICKET_PRICE).toString()
}

cinemaHallContainer.addEventListener('click', (event) => {

    if (event.target.classList.contains('seat') && !event.target.classList.contains('occupied')) {
        const row = Number(event.target.dataset.row)
        const seat = Number(event.target.dataset.seat)

        const seatIndex = selectedSeats.findIndex(s => s.row === row && s.seat === seat);
        if (seatIndex !== -1) {
            selectedSeats.splice(seatIndex, 1);
        } else {
            selectedSeats.push({ row, seat });
        }

        event.target.classList.toggle('selected')
        updateSummary()
    }
})

confirmBookingBtn.addEventListener('click', () => {
    if (selectedSeats.length === 0) {
        alert('Please select at least one seat to book.')
        return
    }

    const order = {
        movieId: movie.id,
        movieTitle: movie.title,
        seats: selectedSeats,
        totalPrice: selectedSeats.length * 10,
        createdAt: new Date().toISOString()
    }

    localStorage.setItem('latestReservation', JSON.stringify(order))
    console.log('Data for API:', order)
    window.location.href = 'checkout.html'
})