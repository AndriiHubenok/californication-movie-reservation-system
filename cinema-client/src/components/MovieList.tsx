import { useState, useEffect } from 'react';
import type { Movie } from '../types/movie';
import { MovieCard } from './MovieCard';
import { fetchMovies } from '../api/movies';

interface MovieListProps {
    onSelectMovie: (movie: Movie) => void;
}

export const MovieList = ({ onSelectMovie }: MovieListProps) => {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const loadMoviesData = async () => {
        setIsLoading(true);
        setErrorMessage(null);
        try {
            const data = await fetchMovies();
            setMovies(data);
        } catch (err) {
            setErrorMessage(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadMoviesData();
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
                    onClick={loadMoviesData}
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
                    <MovieCard
                        key={movie.id}
                        movie={movie}
                        onSelect={onSelectMovie}
                    />
                ))}
            </div>
        </section>
    );
};