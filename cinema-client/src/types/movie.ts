import type { Showtime } from './showtime';

export interface MovieWithShowtimes {
    id: number;
    title: string;
    description?: string;
    poster?: string;
    showtimes: Showtime[];
}

export interface MovieInfo {
    id: number;
    title: string;
    description?: string;
    rating: number;
    poster?: string;
    genres?: string[];
    showtimes: Showtime[];
    reviews: MovieReview[];
}

export interface MovieReview {
    id: number;
    user?: number;
    username: string;
    movie?: number;
    movie_title?: string;
    grade: number;
    points: number;
    comment: string;
    created_at: string;
}