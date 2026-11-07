import { useState, useEffect } from 'react';
import type { Showtime } from '../types/showtime.ts';
import { MovieWithShowtimesCard } from './MovieWithShowtimesCard.tsx';
import { fetchMoviesWithShowtimes } from '../api/movies';
import type {MovieWithShowtimes} from "../types/movie.ts";

interface ShowtimeListProps {
    onSelectShowtime: (showtime: Showtime) => void;
}

export const MoviesWithShowtimesList = ({ onSelectShowtime: onSelectShowtime }: ShowtimeListProps) => {
    const [movies, setMovies] = useState<MovieWithShowtimes[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const loadShowtimesData = async () => {
        setIsLoading(true);
        setErrorMessage(null);
        try {
            const data = await fetchMoviesWithShowtimes();
            setMovies(data);
        } catch (err) {
            setErrorMessage(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadShowtimesData();
    }, []);

    if (isLoading) {
        return (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
                <p style={{ fontSize: '1.2rem', color: '#a0a0a0' }}>Loading...</p>
            </div>
        );
    }

    if (errorMessage) {
        return (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
                <p style={{ color: '#ff4d4d', marginBottom: '16px' }}>{errorMessage}</p>
                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={loadShowtimesData}
                >
                    Try again
                </button>
            </div>
        );
    }

    return (
        <section className="movies-section">
            <h2 className="movies-section-title">Today in Cinema</h2>
            <div className="movies-grid">
                {movies.map((movie) => (
                    <MovieWithShowtimesCard
                        key={movie.id}
                        movie={movie}
                        onSelect={onSelectShowtime}
                    />
                ))}
            </div>
        </section>
    );
};