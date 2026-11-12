import type { Showtime } from '../types/showtime.ts';
import {apiClient} from "./client.ts";
import type {MovieWithShowtimes} from "../types/movie.ts";


export async function fetchMoviesWithShowtimes(date: string, signal: AbortSignal): Promise<MovieWithShowtimes[]> {
    return apiClient<MovieWithShowtimes[]>(
        `/api/movies/showtimes/?date=${encodeURIComponent(date)}`, {
            method: 'GET',
            signal
        }
    );
}