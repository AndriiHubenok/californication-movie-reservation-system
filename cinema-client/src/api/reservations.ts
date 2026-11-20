import {apiBlobClient, apiClient} from './client';

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
    start_time: string;
}

export interface CheckoutSessionResponse {
    checkout_url: string;
    session_id?: string;
}

export interface PaymentConfirmedResponse {
    id: number;
    transaction_id: string;
    user: number;
    reservation: number;
    amount: string;
    status: 'confirmed';
    created_at: string;
}

export interface PaymentRequiresActionResponse {
    status: 'requires_action';
    client_secret: string;
}

export type PayReservationResponse =
    | PaymentConfirmedResponse
    | PaymentRequiresActionResponse;

export interface TicketValidationResponse {
    message: string;
    ticket_id: number;
    movie_title: string;
    showtime: string;
    seat: string;
    user: string;
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

export async function payReservation(
    reservationId: number,
    paymentMethodId: string
): Promise<PayReservationResponse> {
    return apiClient<PayReservationResponse>(`/api/reservations/${reservationId}/pay/`, {
        method: 'POST',
        body: JSON.stringify({ payment_method_id: paymentMethodId }),
    });
}

export async function fetchReservationById(
    reservationId: string | number,
    signal?: AbortSignal
): Promise<ReservationItem> {
    return apiClient<ReservationItem>(`/api/reservations/${reservationId}/`, {
        method: 'GET',
        signal,
    });
}

export async function downloadTicketPdf(reservationId: number): Promise<void> {
    const blob = await apiBlobClient(`/api/reservations/${reservationId}/ticket/`);
    const objectUrl = URL.createObjectURL(blob);

    try {
        const link = document.createElement('a');
        link.href = objectUrl;
        link.download = `cinema-ticket-${reservationId}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } finally {
        URL.revokeObjectURL(objectUrl);
    }
}

export async function validateTicket(qrCode: string): Promise<TicketValidationResponse> {
    return apiClient<TicketValidationResponse>(`/api/reservations/validate?qr_data=${qrCode}`, {
        method: 'GET',
    });
}