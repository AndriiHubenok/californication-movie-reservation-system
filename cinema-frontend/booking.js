
const TICKET_PRICE = 10

const cinemaHallContainer = document.querySelector('.cinema-hall')
const seatCountElement = document.querySelector('#count')
const totalPriceElement = document.querySelector('#total')

function updateSummary() {
    const selectedSeats = cinemaHallContainer.querySelectorAll('.seat.selected')
    const count = selectedSeats.length

    seatCountElement.textContent = count.toString()
    totalPriceElement.textContent = (count * TICKET_PRICE).toString()
}

cinemaHallContainer.addEventListener('click', (event) => {

    if (event.target.classList.contains('seat') && !event.target.classList.contains('occupied')) {

        event.target.classList.toggle('selected')
        updateSummary()
    }
})