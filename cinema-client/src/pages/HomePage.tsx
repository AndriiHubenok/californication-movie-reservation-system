import {useEffect, useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {MoviesWithShowtimesList} from '../components/MoviesWithShowtimesList.tsx';
import type {Showtime} from "../types/showtime.ts";
import {useDebounce} from "../hooks/useDebounce.ts";

export const HomePage = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

    const handleSelectShowtime = (showtime: Showtime) => {
        localStorage.setItem('selectedShowtime', JSON.stringify(showtime));
        navigate(`/booking/${showtime.id}`);
    };

    const debouncedSearch = useDebounce(searchQuery, 400);


    return (
        <main>
            <div className="filters-bar">
                <input
                    type="search"
                    placeholder="Search movies by title..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <input
                    type="date"
                    className="date-input"
                    aria-label="Select showtime date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                />
            </div>
            <MoviesWithShowtimesList
                date={selectedDate}
                searchQuery={debouncedSearch}
                onClearSearch={() => setSearchQuery('')}
                onSelectShowtime={handleSelectShowtime}
            />
        </main>
    );
};