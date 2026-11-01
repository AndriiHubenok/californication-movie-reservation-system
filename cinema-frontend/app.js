import { MOCK_MOVIES } from './data.js';

const container = document.getElementById('movies-container');

async function getMovies() {
    return new Promise((resolve) => {
        setTimeout(() => resolve(MOCK_MOVIES), 800);
    });
}

function createMovieCardHTML(movie) {
    return `
        <article class="movie-card">
            <img src="${movie.poster}" alt="${movie.title} Poster" class="movie-poster">
            <h3>${movie.title}</h3>
            <p>${movie.description}</p>
            <p>Duration: ${movie.duration} mins</p>
            <p>Genres: ${movie.genres.join(', ')}</p>
            <button class="btn-primary" type="button" data-id="${movie.id}">Book Now</button>
        </article>
    `;
}

async function initCatalog() {
    try {
        container.innerHTML = '<p class="loading">Loading...</p>';
        const movies = await getMovies();
        container.innerHTML = movies.map(createMovieCardHTML).join('');
    } catch (error) {
        console.error('Error initializing catalog:', error);
        document.getElementById('movies-container').innerHTML = '<p class="error">Error loading movies.</p>';
    }
}

container.addEventListener('click', (event) => {
    if (event.target.classList.contains('btn-primary')) {
        const movieId = event.target.getAttribute('data-id');
        window.location.href = `booking.html?movieId=${movieId}`;
    }
});

document.addEventListener('DOMContentLoaded', initCatalog);
