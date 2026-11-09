import { apiClient } from './client';

export interface CreateReservationPayload {
    showtime: number;
    seats: number[];
}

export interface ReservationResponse {
    id: number;
    showtime?: number;
    status: string;
    created_at: string;
    tickets: number[];
}

export async function createReservation(payload: CreateReservationPayload): Promise<ReservationResponse> {
    return apiClient<ReservationResponse>('/api/reservations/', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
}