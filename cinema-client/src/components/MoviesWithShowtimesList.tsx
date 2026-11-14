import {useState, useEffect, useMemo} from 'react';
import type {Showtime} from '../types/showtime.ts';
import {MovieWithShowtimesCard} from './MovieWithShowtimesCard.tsx';
import {fetchMoviesWithShowtimes} from '../api/movies';
import type {MovieWithShowtimes} from "../types/movie.ts";

interface ShowtimeListProps {
    movies: MovieWithShowtimes[];
    hasAnyMovies: boolean;
    date: string;
    hasActiveFilters: boolean;
    isLoading: boolean;
    errorMessage: string | null;
    onRetry: () => void;
    onClearFilters: () => void;
    onSelectShowtime: (showtime: Showtime) => void;
}

export const MoviesWithShowtimesList = ({
                                            movies,
                                            hasAnyMovies,
                                            date,
                                            hasActiveFilters,
                                            isLoading,
                                            errorMessage,
                                            onRetry,
                                            onClearFilters,
                                            onSelectShowtime,
                                        }: ShowtimeListProps) => {
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
                    onClick={onRetry}
                >
                    Try again
                </button>
            </div>
        );
    }

    return (
        <section className="movies-section">
            <h2 className="movies-section-title">Today in Cinema</h2>

            {!hasAnyMovies ? (
                <p style={{ textAlign: 'center', color: '#a0a0a0', marginTop: '24px' }}>
                    No showtimes scheduled for {date}.
                </p>
            ) : movies.length === 0 && hasActiveFilters ? (
                <div style={{ textAlign: 'center', padding: '32px 16px' }}>
                    <p style={{ color: '#a0a0a0', marginBottom: '12px' }}>
                        No movies match your current filters.
                    </p>
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={onClearFilters}
                    >
                        Clear filters
                    </button>
                </div>
            ) : (
                <div className="movies-grid">
                    {movies.map((movie) => (
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