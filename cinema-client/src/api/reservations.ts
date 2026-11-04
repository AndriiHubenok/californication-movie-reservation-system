import { apiClient } from './client';

export interface CreateReservationPayload {
    showtime: number;
    seats: number[];
}

export interface ReservationResponse {
    id: number;
    status: string;
    created_at: string;
    seat_ids: number[];
}

export async function createReservation(payload: CreateReservationPayload): Promise<ReservationResponse> {
    return apiClient<ReservationResponse>('/api/reservations/', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
}