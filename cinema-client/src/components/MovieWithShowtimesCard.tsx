import type { Showtime } from '../types/showtime.ts';
import type {MovieWithShowtimes} from "../types/movie.ts";
import {Link} from "react-router-dom";

interface MovieCardProps {
    movie: MovieWithShowtimes;
    onSelect: (showtime: MovieWithShowtimes) => void;
}

export const MovieWithShowtimesCard = ({ movie, onSelect }: MovieCardProps) => {

    const formatTime = (isoDate: string) =>
        new Date(isoDate).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
        });

    return (
        <article className="movie-card">
            <img src={movie.poster} alt={movie.title} className="movie-poster" />
            <h3><Link to={`/movies/${movie.id}`} className="details-link" style={{
                textDecoration: 'none',
                color: 'inherit',
            }}>
                {movie.title}
            </Link></h3>
            <p>{movie.description}</p>
            <div className="showtimes">
                {movie.showtimes.map((showtime) => (
                    <span style={{ cursor: 'pointer', color: 'orange' }} key={showtime.id} className="showtime" onClick={() => onSelect(showtime)}>
                        {formatTime(showtime.start_time)+" "}
                    </span>
                ))}
            </div>
        </article>
    );
};