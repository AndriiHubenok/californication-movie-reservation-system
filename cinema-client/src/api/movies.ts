import type { Showtime } from '../types/showtime.ts';
import {apiClient} from "./client.ts";
import type {MovieWithShowtimes} from "../types/movie.ts";

export async function fetchMoviesWithShowtimes(): Promise<MovieWithShowtimes[]> {
    const response: Showtime[] = await apiClient<Showtime[]>('/api/movies/showtimes?date=20261110', {
        method: 'GET',
    })
    const movies: MovieWithShowtimes[] = [];

    response.forEach((showtime) => {
        const movieIndex = movies.findIndex((movie) => movie.id === showtime.movie);
        if (movieIndex === -1) {
            movies.push({
                id: showtime.movie,
                title: showtime.movie_title,
                description: movie.movie_description,
                poster: movie.movie_poster,
                showtimes: [showtime],
            });
        } else {
            movies[movieIndex].showtimes.push(showtime);
        }
    });

    return movies;
}