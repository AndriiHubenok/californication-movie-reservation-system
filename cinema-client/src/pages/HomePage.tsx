import {useEffect, useMemo, useState, useCallback} from 'react';
import {useNavigate} from 'react-router-dom';
import {MoviesWithShowtimesList} from '../components/MoviesWithShowtimesList.tsx';
import type {Showtime} from "../types/showtime.ts";
import {useDebounce} from "../hooks/useDebounce.ts";
import {fetchMoviesWithShowtimes} from "../api/movies.ts";

export const HomePage = () => {
    const navigate = useNavigate();

    const [movies, setMovies] = useState<MovieWithShowtimes[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState<number>(0);

    const [searchQuery, setSearchQuery] = useState<string>('');
    const [selectedGenre, setSelectedGenre] = useState<string>('ALL');
    const [selectedDate, setSelectedDate] = useState<string>(
        () => new Date().toISOString().split('T')[0]
    );

    const debouncedSearch = useDebounce(searchQuery, 400);

    const loadShowtimesData = useCallback(
        async (signal: AbortSignal) => {
            setIsLoading(true);
            setErrorMessage(null);

            try {
                if (!selectedDate) {
                    throw new Error('No date found.');
                }
                const data = await fetchMoviesWithShowtimes(selectedDate, signal);
                setMovies(data);
            } catch (err) {
                if (err instanceof Error && err.name === 'AbortError') {
                    return;
                }
                setErrorMessage(err instanceof Error ? err.message : 'Unknown error');
            } finally {
                if (!signal.aborted) {
                    setIsLoading(false);
                }
            }
        },
        [selectedDate]
    );

    useEffect(() => {
        const controller = new AbortController();
        loadShowtimesData(controller.signal);

        return () => controller.abort();
    }, [selectedDate]);

    const availableGenres = useMemo(() => {
        const allGenres = movies.flatMap((movie) => movie.genres ?? []);
        return Array.from(new Set(allGenres)).sort();
    }, [movies]);

    const filteredMovies = useMemo(() => {
        const normalizedQuery = debouncedSearch.trim().toLowerCase();

        return movies.filter((movie) => {
            const matchesTitle =
                !normalizedQuery ||
                movie.title.toLowerCase().includes(normalizedQuery);
            const matchesGenre =
                selectedGenre === 'ALL' ||
                (movie.genres ?? []).includes(selectedGenre);

            return matchesTitle && matchesGenre;
        });
    }, [movies, debouncedSearch, selectedGenre]);

    const handleSelectShowtime = (showtime: Showtime) => {
        localStorage.setItem('selectedShowtime', JSON.stringify(showtime));
        navigate(`/booking/${showtime.id}`);
    };

    const handleDateChange = (newDate: string) => {
        setSelectedDate(newDate);
        setSelectedGenre('ALL');
    };

    const handleClearFilters = () => {
        setSearchQuery('');
        setSelectedGenre('ALL');
    };

    return (
        <main>
            <div className="filters-bar">
                <input
                    type="search"
                    className="search-input"
                    placeholder="Search movies by title..."
                    aria-label="Search movies by title"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <select
                    className="genre-select"
                    aria-label="Filter by genre"
                    value={selectedGenre}
                    onChange={(e) => setSelectedGenre(e.target.value)}
                    disabled={isLoading || availableGenres.length === 0}
                >
                    <option value="ALL">All Genres</option>
                    {availableGenres.map((genre) => (
                        <option key={genre} value={genre}>
                            {genre}
                        </option>
                    ))}
                </select>
                <input
                    type="date"
                    className="date-input"
                    aria-label="Select showtime date"
                    value={selectedDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                />
            </div>

            <MoviesWithShowtimesList
                movies={filteredMovies}
                hasAnyMovies={movies.length > 0}
                date={selectedDate}
                hasActiveFilters={Boolean(debouncedSearch.trim()) || selectedGenre !== 'ALL'}
                isLoading={isLoading}
                errorMessage={errorMessage}
                onRetry={() => setRetryCount((c) => c + 1)}
                onClearFilters={handleClearFilters}
                onSelectShowtime={handleSelectShowtime}
            />
        </main>
    );
};