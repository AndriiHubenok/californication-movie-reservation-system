import { apiClient } from './client';

export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled' | string;

export interface CreateReservationPayload {
    showtime: number;
    seats: number[];
}

export interface ReservationItem {
    id: number;
    showtime?: number;
    status: ReservationStatus;
    created_at: string;
    tickets: number[];
    cinema_name?: string;
    movie_title?: string;
    showtime_start_time?: string;
}

export async function createReservation(payload: CreateReservationPayload): Promise<ReservationItem> {
    return apiClient<ReservationItem>('/api/reservations/', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
}

export async function fetchMyReservations(signal?: AbortSignal): Promise<ReservationItem[]> {
    return apiClient<ReservationItem[]>('/api/reservations/', {
        method: 'GET',
        signal,
    });
}

export async function cancelReservation(reservationId: number): Promise<void> {
    return apiClient<void>(`/api/reservations/${reservationId}/`, {
        method: 'DELETE',
    });
}