import type { Showtime } from './showtime';

export interface MovieWithShowtimes {
    id: number;
    title: string;
    description?: string;
    poster?: string;
    showtimes: Showtime[];
}