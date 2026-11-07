import type { Showtime } from '../types/showtime.ts';
import type {MovieWithShowtimes} from "../types/movie.ts";

interface MovieCardProps {
    movie: MovieWithShowtimes;
    onSelect: (showtime: MovieWithShowtimes) => void;
}

export const MovieWithShowtimesCard = ({ movie, onSelect }: MovieCardProps) => {

    return (
        <article className="movie-card">
            <img src={movie.poster} alt={movie.title} className="movie-poster" />
            <h3>{movie.title}</h3>
            <p>{movie.description}</p>
            {/*<p>Duration: {movie.duration} min.</p>*/}
            {/*<p>Genres: {movie.genres.join(', ')}</p>*/}
            <div className="showtimes">
                {movie.showtimes.map((showtime) => (
                    <span key={showtime.id} className="showtime" onClick={() => onSelect(showtime)}>
                        {showtime.time}
                    </span>
                ))}
            </div>
        </article>
    );
};