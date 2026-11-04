import {apiClient} from "./client.ts";


export interface ShowtimeSeatsResponse {
    seats: {
        id: number;
        row: number;
        number: number;
        is_booked: boolean;
    }
}

export async function getShowtimeSeats(showtimeId: number): Promise<ShowtimeSeatsResponse> {
    return apiClient<ShowtimeSeatsResponse>(`/api/showtimes/${showtimeId}/seats/`, {
        method: 'GET',
    });
}