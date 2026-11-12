import { useState, useEffect } from 'react';
import type { Showtime } from '../types/showtime.ts';
import { MovieWithShowtimesCard } from './MovieWithShowtimesCard.tsx';
import { fetchMoviesWithShowtimes } from '../api/movies';
import type {MovieWithShowtimes} from "../types/movie.ts";

interface ShowtimeListProps {
    date: string
    onSelectShowtime: (showtime: MovieWithShowtimes) => void;
}

export const MoviesWithShowtimesList = ({ date, onSelectShowtime: onSelectShowtime }: ShowtimeListProps) => {
    const [movies, setMovies] = useState<MovieWithShowtimes[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const loadShowtimesData = async () => {
        setIsLoading(true);
        setErrorMessage(null);

        const controller = new AbortController()

        try {
            if (!date) {
                throw new Error('No date found.');
            }
            const data = await fetchMoviesWithShowtimes(date, controller.signal);
            setMovies(data);
        } catch (err) {
            if (err instanceof Error && err.name === 'AbortError') {
                return;
            }
            setErrorMessage(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadShowtimesData();
    }, [date]);

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