
const orderSummaryContainer = document.getElementById('order-summary');
const formContainer = document.getElementById('checkout-form');
const fullNameInput = document.getElementById('fullName');
const fullNameError = document.getElementById('fullName-error');
const emailInput = document.getElementById('email');
const emailError = document.getElementById('email-error');
const phoneInput = document.getElementById('phone');
const phoneError = document.getElementById('phone-error');
const termsCheckbox = document.getElementById('terms');
const termsError = document.getElementById('terms-error');
const submitBtn = document.getElementById('submit-btn');

const rawReservation = localStorage.getItem('latestReservation')
if (!rawReservation) {
    window.location.href = 'index.html'
}

const reservation = JSON.parse(rawReservation)

document.getElementById('order-summary-movie-title').textContent = reservation.movieTitle;
document.getElementById('order-summary-hall-time').textContent = `Hall 1 - 19:30`;
document.getElementById('order-summary-seats').textContent = `Seats: ${reservation.seats.map((seat) => JSON.stringify(seat)).join(', ')}`;
document.getElementById('order-summary-total').textContent = `Total: $${reservation.totalPrice.toFixed(2)}`;

function validateForm(data) {

    let isValid = true;

    if (data.fullName && data.fullName.length > 2) {
        fullNameInput.classList.remove('input-error');
        fullNameError.textContent = '';
    } else {
        fullNameInput.classList.add('input-error');
        fullNameError.textContent = 'Full name must be at least 3 characters long.';
        isValid = false;
    }

    if (data.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        emailInput.classList.remove('input-error');
        emailError.textContent = '';
    } else {
        emailInput.classList.add('input-error');
        emailError.textContent = 'Please enter a valid email address.';
        isValid = false;
    }

    if (data.phone && /^\+\d{10,}$/.test(data.phone)) {
        phoneInput.classList.remove('input-error');
        phoneError.textContent = '';
    } else {
        phoneInput.classList.add('input-error');
        phoneError.textContent = 'Phone number must be at least 10 digits.';
        isValid = false;
    }

    if (data.terms) {
        termsCheckbox.classList.remove('input-error');
        termsError.textContent = '';
    } else {
        termsCheckbox.classList.add('input-error');
        termsError.textContent = 'You must agree to the terms and conditions.';
        isValid = false;
    }

    return isValid;
}

formContainer.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = Object.fromEntries(new FormData(event.target).entries())

    if (validateForm(formData)) {
        submitBtn.disabled = true
        submitBtn.textContent = 'Submitting...'
        const order = {...formData, ...reservation}
        console.log(`Data for API:`, order)
        alert('Booking confirmed! Check the console for the data that would be sent to the API.')
    }
})
