

export interface Reservation {
    id: number;
    showtime: number;
    seat: number;
    status: 'pending' | 'confirmed' | 'cancelled';
    ticket: string | null;
    created_at: string; // ISO: "2026-05-12T14:30:00Z"
}

export interface CreateReservationDTO {
    showtime: number;
    seat: number;
}

export interface Payment {
    id: number;
    transaction_id: string;
    user: number;
    reservation: number;
    amount: number;
    status: 'pending' | 'completed' | 'failed';
    created_at: string; // ISO: "2026-05-12T14:30:00Z"
}

export interface CardPaymentDTO {
    payment_method_id: string;
}