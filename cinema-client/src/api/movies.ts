import type { Showtime } from '../types/showtime.ts';
import {apiClient} from "./client.ts";
import type {MovieWithShowtimes} from "../types/movie.ts";


export async function fetchMoviesWithShowtimes(date: string = '2026-11-10'): Promise<MovieWithShowtimes[]> {
    return apiClient<MovieWithShowtimes[]>(
        `/api/movies/showtimes/?date=${encodeURIComponent(date)}`,
        { method: 'GET' }
    );
}