import {apiClient} from "./client.ts";
import type {MovieWithShowtimes, MovieInfo} from "../types/movie.ts";

export interface CreateReviewPayload {
    grade: number;
    comment: string;
}

export async function fetchMoviesWithShowtimes(date: string, signal: AbortSignal): Promise<MovieWithShowtimes[]> {
    return apiClient<MovieWithShowtimes[]>(
        `/api/movies/showtimes/?date=${encodeURIComponent(date)}`, {
            method: 'GET',
            signal
        }
    );
}

export async function fetchMovieInfo(movieId: string, signal?: AbortSignal): Promise<MovieInfo> {
    return apiClient<MovieInfo>(`/api/movies/${movieId}/info/`, {
        method: 'GET',
        signal,
    });
}

export async function createMovieReview(
    movieId: string,
    payload: CreateReviewPayload
): Promise<MovieReview> {
    return apiClient<MovieReview>(`/api/movies/${movieId}/review/`, {
        method: 'POST',
        body: JSON.stringify(payload),
    });
}