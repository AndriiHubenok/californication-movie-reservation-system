import type { Movie } from '../types/movie';

interface MovieCardProps {
    movie: Movie;
    onSelect: (movie: Movie) => void;
}

export const MovieCard = ({ movie, onSelect }: MovieCardProps) => {
    return (
        <article className="movie-card">
            <img src={movie.poster} alt={movie.title} className="movie-poster" />
            <h3>{movie.title}</h3>
            <p>{movie.description}</p>
            <p>Duration: {movie.duration} min.</p>
            <p>Genres: {movie.genres.join(', ')}</p>
            <button
                type="button"
                className="btn btn-primary"
                onClick={() => onSelect(movie)}
            >
                Select Showtime
            </button>
        </article>
    );
};