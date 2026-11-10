import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {MoviesWithShowtimesList} from '../components/MoviesWithShowtimesList.tsx';
import type {Showtime} from "../types/showtime.ts";

export const HomePage = () => {
    const navigate = useNavigate();
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

    const handleSelectShowtime = (showtime: Showtime) => {
        localStorage.setItem('selectedShowtime', JSON.stringify(showtime))
        navigate(`/booking/${showtime.id}`);
    };

    return (
        <main>
            <form>
                <input type="date" className="date-input" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />           </form>
            <MoviesWithShowtimesList date={selectedDate} onSelectShowtime={handleSelectShowtime}/>
        </main>
    );
};