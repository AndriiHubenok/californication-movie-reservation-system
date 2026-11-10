import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createReservation } from '../api/reservations';
import { ApiError } from '../api/client';

export const CheckoutPage = () => {
    const navigate = useNavigate();
    const rawSeats = localStorage.getItem('selectedSeats');
    const rawShowtime = localStorage.getItem('selectedShowtime')
    const seatIds: number[] = rawSeats ? (JSON.parse(rawSeats) as number[]) : [];

    if (!rawShowtime || seatIds.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
                <p style={{ fontSize: '1.2rem', color: '#a0a0a0' }}>
                    No showtime or seats selected. Please go back and select a showtime and seats.
                </p>
                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => navigate('/')}
                >
                    Back to Home
                </button>
            </div>
        )
    }

    const showtime: Showtime = JSON.parse(rawShowtime);
    const showtimeId: number = showtime.id;
    const price: number = showtime.price;

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);



    const handleConfirmBooking = async () => {
        if (seatIds.length === 0) {
            setErrorMessage('Seats are not selected. Please select at least one seat before proceeding.');
            return;
        }

        setIsSubmitting(true);
        setErrorMessage(null);

        try {
            const result = await createReservation({ showtime: showtimeId, seats: seatIds });
            localStorage.removeItem('selectedSeats');
            localStorage.removeItem('selectedShowtime');
            navigate('/ticket', { state: { reservation: result }, replace: true });
        } catch (error) {
            if (error instanceof ApiError) {
                setErrorMessage(error.message);
            } else {
                setErrorMessage('An unexpected error occurred. Please try again later.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main style={{ maxWidth: '600px', margin: '40px auto', padding: '0 16px' }}>
            <h2>Checkout</h2>

            <div style={{ background: '#242424', padding: '24px', borderRadius: '8px', margin: '20px 0' }}>
                <p style={{ marginBottom: '8px' }}>
                    Amount of selected seats: <strong>{seatIds.length}</strong>
                </p>
                <p style={{ marginBottom: '8px' }}>
                    Numbers of selected seats: <strong>{seatIds.join(', ') || 'None'}</strong>
                </p>
                <p>
                    Total amount to pay: <strong>{seatIds.length * price}$</strong>
                </p>
            </div>

            {errorMessage && (
                <div style={{ color: '#ff4d4d', background: '#2a1818', padding: '12px', borderRadius: '4px', marginBottom: '16px' }}>
                    {errorMessage}
                </div>
            )}

            <div style={{ display: 'flex', gap: '12px' }}>
                <button
                    type="button"
                    className="btn btn-primary"
                    disabled={isSubmitting || seatIds.length === 0}
                    onClick={handleConfirmBooking}
                >
                    {isSubmitting ? 'Booking...' : 'Accept a payment'}
                </button>
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    disabled={isSubmitting}
                    style={{ background: 'transparent', border: '1px solid #444', color: '#fff', padding: '10px 16px', borderRadius: '4px', cursor: 'pointer' }}
                >
                    Back to choosing
                </button>
            </div>
        </main>
    );
};