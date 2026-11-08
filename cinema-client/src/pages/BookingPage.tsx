import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchSeats } from '../api/showtimes';
import { CinemaHall } from '../components/CinemaHall';
import type { Seat } from '../types/seat';

export const BookingPage = () => {
    const { movieId } = useParams<{ movieId: string }>();
    const navigate = useNavigate();

    const TICKET_PRICE = 150;

    const [seats, setSeats] = useState<Seat[]>([]);
    const [selectedSeatIds, setSelectedSeatIds] = useState<number[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!movieId) {
            setIsLoading(false);
            setError('Missing ID in route.');
            return;
        }

        let isCancelled = false;

        const loadSeats = async () => {
            setIsLoading(true);
            setError(null);
            setSelectedSeatIds([]);

            try {
                const data = await fetchSeats(movieId);
                if (!isCancelled) {
                    setSeats(data);
                }
            } catch (err) {
                if (!isCancelled) {
                    setError(
                        err instanceof Error ? err.message : 'Failed to load seats.'
                    );
                }
            } finally {
                if (!isCancelled) {
                    setIsLoading(false);
                }
            }
        };

        loadSeats();

        return () => {
            isCancelled = true;
        };
    }, [movieId]);

    const handleSeatToggle = (seatId: number) => {
        setSelectedSeatIds((prev) =>
            prev.includes(seatId) ? prev.filter((id) => id !== seatId) : [...prev, seatId]
        );
    };

    const handleConfirm = () => {
        localStorage.setItem('selectedSeats', JSON.stringify(selectedSeatIds));
        navigate('/checkout');
    };

    return (
        <main style={{ padding: '24px 0' }}>
            <button
                type="button"
                className="btn btn-secondary"
                style={{
                    marginTop: '12px',
                    display: 'block',
                    marginRight: 'auto',
                    marginLeft: '48px',
                }}
                onClick={() => {
                    localStorage.removeItem('selectedShowtime');
                    localStorage.removeItem('selectedSeats');
                    navigate('/');
                }}
            >
                ← Back to Home
            </button>
            <h2 style={{ textAlign: 'center', marginBottom: '8px' }}>
                Booking seats for movie #{movieId}
            </h2>
            <p style={{ textAlign: 'center', color: '#a0a0a0', marginBottom: '24px' }}>
                Select your seats below.
            </p>

            {isLoading ? (
                <p style={{ textAlign: 'center' }}>Loading seats...</p>
            ) : error ? (
                <p style={{ textAlign: 'center', color: '#ff6b6b' }}>{error}</p>
            ) : (
                <CinemaHall
                    seats={seats}
                    selectedSeatIds={selectedSeatIds}
                    onSeatToggle={handleSeatToggle}
                />
            )}

            <div className="booking-summary" style={{ marginTop: '24px', textAlign: 'center' }}>
                <p className="booking-summary-text">
                    Selected seats: <strong>{selectedSeatIds.length}</strong> | Total:{' '}
                    <strong>{selectedSeatIds.length * TICKET_PRICE}$</strong>
                </p>
                <button
                    type="button"
                    className="btn btn-primary"
                    disabled={isLoading || selectedSeatIds.length === 0}
                    style={{ marginTop: '12px' }}
                    onClick={handleConfirm}
                >
                    Proceed to checkout
                </button>
            </div>
        </main>
    );
};