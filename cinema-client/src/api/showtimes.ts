import {apiClient} from "./client.ts";
import type {Seat} from "../types/seat.ts";


export interface ShowtimeSeatsResponse {
    seats: {
        id: number;
        row: number;
        number: number;
        is_booked: boolean;
    }
}

export async function fetchSeats(movieId: string) {
    const response: Seat[] = await apiClient<Seat[]>(`/api/showtimes/${movieId}/seats/`, {
        method: 'GET',
    });

    return response
}