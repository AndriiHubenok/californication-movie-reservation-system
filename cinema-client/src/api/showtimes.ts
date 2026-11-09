import {apiClient} from "./client.ts";
import type {Seat} from "../types/seat.ts";


export interface ShowtimeDetailsResponse {
    id: number;
    movie_id: number;
    movie_title: string;
    hall_id: number;
    hall_name: string;
    start_time: string;
    end_time: string;
    price: number;
    seats: {
        id: number;
        row: number;
        number: number;
        is_booked: boolean;
    }[];
}

export async function fetchShowtimeDetails(movieId: string) {
    return await apiClient<ShowtimeDetailsResponse>(`/api/showtimes/${movieId}/`, {
        method: 'GET',
    });
}