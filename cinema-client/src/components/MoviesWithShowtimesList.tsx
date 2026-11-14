import {useState, useEffect, useMemo} from 'react';
import type {Showtime} from '../types/showtime.ts';
import {MovieWithShowtimesCard} from './MovieWithShowtimesCard.tsx';
import {fetchMoviesWithShowtimes} from '../api/movies';
import type {MovieWithShowtimes} from "../types/movie.ts";

interface ShowtimeListProps {
    date: string;
    searchQuery: string;
    onClearSearch: () => void;
    onSelectShowtime: (showtime: Showtime) => void;
}

export const MoviesWithShowtimesList = ({
                                            date,
                                            searchQuery,
                                            onClearSearch,
                                            onSelectShowtime,
                                        }: ShowtimeListProps) => {
    const [movies, setMovies] = useState<MovieWithShowtimes[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState<number>(0);

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

    const filteredMovies = useMemo(() => {
        const normalizedQuery = searchQuery.trim().toLowerCase();
        if (!normalizedQuery) {
            return movies;
        }
        return movies.filter((movie) =>
            movie.title.toLowerCase().includes(normalizedQuery)
        );
    }, [movies, searchQuery]);

    if (isLoading) {
        return (
            <div style={{textAlign: 'center', padding: '48px 0'}}>
                <p style={{fontSize: '1.2rem', color: '#a0a0a0'}}>Loading...</p>
            </div>
        );
    }

    if (errorMessage) {
        return (
            <div style={{textAlign: 'center', padding: '48px 0'}}>
                <p style={{color: '#ff4d4d', marginBottom: '16px'}}>{errorMessage}</p>
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

            {movies.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#a0a0a0', marginTop: '24px' }}>
                    No showtimes scheduled for {date}.
                </p>
            ) : filteredMovies.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 16px' }}>
                    <p style={{ color: '#a0a0a0', marginBottom: '12px' }}>
                        No movies found matching "{searchQuery}".
                    </p>
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={onClearSearch}
                    >
                        Clear search
                    </button>
                </div>
            ) : (
                <div className="movies-grid">
                    {filteredMovies.map((movie) => (
                        <MovieWithShowtimesCard
                            key={movie.id}
                            movie={movie}
                            onSelect={onSelectShowtime}
                        />
                    ))}
                </div>
            )}
        </section>
    );
};