import {useNavigate} from 'react-router-dom';
import {MoviesWithShowtimesList} from '../components/MoviesWithShowtimesList.tsx';
import type {Showtime} from "../types/showtime.ts";

export const HomePage = () => {
    const navigate = useNavigate();



    const handleSelectMovie = (showtime: Showtime) => {
        localStorage.setItem('selectedShowtime', JSON.stringify(showtime))
        navigate(`/booking/${showtime.id}`);
    };

    return (
        <main>
            <MoviesWithShowtimesList onSelectMovie={handleSelectMovie}/>
        </main>
    );
};