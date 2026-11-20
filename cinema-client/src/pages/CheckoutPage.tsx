import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import {
    createReservation,
    fetchReservationById,
    type PaymentConfirmedResponse,
    type ReservationItem,
} from '../api/reservations';
import { ApiError } from '../api/client';
import { useToast } from '../context/ToastContext';
import { StripePaymentForm } from '../components/StripePaymentForm';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string);
const RESERVATION_TTL_SECONDS = 900;

interface StoredShowtime {
    id: number;
    price: string | number;
    movie_title?: string;
    start_time?: string;
}

export const CheckoutPage = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();

    const rawSeats = localStorage.getItem('selectedSeats');
    const rawShowtime = localStorage.getItem('selectedShowtime');
    const pendingReservation = localStorage.getItem('pendingReservation') ?? null;

    const seatIds: number[] = rawSeats ? (JSON.parse(rawSeats) as number[]) : [];
    const showtime: StoredShowtime | null = rawShowtime
        ? (JSON.parse(rawShowtime) as StoredShowtime)
        : null;

    const [reservation, setReservation] = useState<ReservationItem | null>(pendingReservation ? JSON.parse(pendingReservation) : null);
    const [isCreating, setIsCreating] = useState(false);
    const [createError, setCreateError] = useState<string | null>(null);
    const [secondsLeft, setSecondsLeft] = useState<number>(RESERVATION_TTL_SECONDS);

    useEffect(() => {
        if (!reservation && (!showtime || seatIds.length === 0)) {
            navigate('/', { replace: true });
        }
    }, [reservation, showtime, seatIds.length, navigate]);

    useEffect(() => {
        if (!reservation) return;

        const expiresAt =
            new Date(reservation.created_at).getTime() + RESERVATION_TTL_SECONDS * 1000;

        const updateTimer = () => {
            const remaining = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
            setSecondsLeft(remaining);
        };

        updateTimer();
        const intervalId = window.setInterval(updateTimer, 1000);
        return () => window.clearInterval(intervalId);
    }, [reservation]);

    if (!reservation && (!showtime || seatIds.length === 0)) {
        return null;
    }

    const unitPrice = Number(showtime?.price ?? 0);
    const totalAmount = unitPrice * seatIds.length;
    const isExpired = reservation !== null && secondsLeft === 0;

    const handleLockSeats = async () => {
        if (!showtime) return;
        setIsCreating(true);
        setCreateError(null);

        try {
            const created = await createReservation({
                showtime: showtime.id,
                seats: seatIds,
            });
            setReservation(created);
            showToast('Seats reserved for 15 minutes. Complete your payment.', 'info');
        } catch (err) {
            setCreateError(
                err instanceof ApiError
                    ? err.message
                    : 'Could not reserve seats. They may have just been taken.'
            );
        } finally {
            setIsCreating(false);
        }
    };

    const handlePaymentSuccess = async (payment: PaymentConfirmedResponse) => {
        localStorage.removeItem('selectedSeats');
        localStorage.removeItem('selectedShowtime');
        showToast('Payment confirmed! Ticket sent to your email.', 'success');

        try {
            const confirmedReservation = await fetchReservationById(payment.reservation);
            navigate('/ticket', {
                state: { reservation: confirmedReservation, payment },
                replace: true,
            });
        } catch {
            navigate('/my-reservations', { replace: true });
        }
    };

    const formattedMinutes = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
    const formattedSeconds = String(secondsLeft % 60).padStart(2, '0');

    return (
        <main style={{ maxWidth: '560px', margin: '40px auto', padding: '0 16px' }}>
            <h2>Checkout</h2>

            <div style={{ background: '#242424', padding: '20px', borderRadius: '8px', margin: '20px 0' }}>
                {showtime?.movie_title && (
                    <p style={{ marginBottom: '8px' }}>
                        Movie: <strong>{showtime.movie_title}</strong>
                    </p>
                )}
                <p style={{ marginBottom: '8px' }}>
                    Selected seats: <strong>{seatIds.length}</strong> (IDs: {seatIds.join(', ')})
                </p>
                <p>
                    Total to pay: <strong>${totalAmount.toFixed(2)}</strong>
                </p>
            </div>

            {!reservation ? (
                <>
                    {createError && (
                        <p className="error-message" style={{ marginBottom: '16px' }}>
                            {createError}
                        </p>
                    )}
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                            type="button"
                            className="btn btn-primary"
                            disabled={isCreating}
                            onClick={handleLockSeats}
                        >
                            {isCreating ? 'Reserving seats...' : 'Lock Seats & Proceed to Payment'}
                        </button>
                        <button
                            type="button"
                            className="btn btn-secondary"
                            disabled={isCreating}
                            onClick={() => navigate(-1)}
                        >
                            Back
                        </button>
                    </div>
                </>
            ) : (
                <div style={{ background: '#1e1e1e', border: '1px solid #333', padding: '24px', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <span>Reservation #{reservation.id}</span>
                        <span style={{ color: isExpired ? '#ff4d4d' : '#ffc107', fontWeight: 600 }}>
                            {isExpired
                                ? 'Reservation Expired'
                                : `Time left: ${formattedMinutes}:${formattedSeconds}`}
                        </span>
                    </div>

                    {isExpired ? (
                        <div>
                            <p className="error-message" style={{ marginBottom: '12px' }}>
                                Your 15-minute reservation window has expired. Please select your seats again.
                            </p>
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={() => {
                                    localStorage.removeItem('selectedSeats');
                                    localStorage.removeItem('selectedShowtime');
                                    navigate('/');
                                }}
                            >
                                Return to Showtimes
                            </button>
                        </div>
                    ) : (
                        <Elements stripe={stripePromise}>
                            <StripePaymentForm
                                reservationId={reservation.id}
                                totalAmount={totalAmount}
                                onPaymentSuccess={handlePaymentSuccess}
                            />
                        </Elements>
                    )}
                </div>
            )}
        </main>
    );
};