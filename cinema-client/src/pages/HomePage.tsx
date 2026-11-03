import {useNavigate} from 'react-router-dom';
import {MovieList} from '../components/MovieList';
import type {Movie} from "../types/movie.ts";

export const HomePage = () => {
    const navigate = useNavigate();



    const handleSelectMovie = (movie: Movie) => {
        localStorage.setItem('selectedMovie', JSON.stringify(movie));
        navigate(`/booking/${movie.id}`);
    };

    return (
        <main>
            <MovieList onSelectMovie={handleSelectMovie}/>
        </main>
    );
};