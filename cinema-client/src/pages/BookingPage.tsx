import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { CinemaHall } from '../components/CinemaHall';
import type { SeatData } from '../types/cinema';

const TICKET_PRICE = 150;

const INITIAL_SEATS: SeatData[] = Array.from({ length: 48 }, (_, index) => ({
    id: index + 1,
    row: Math.floor(index / 8) + 1,
    number: (index % 8) + 1,
    isOccupied: [3, 4, 18, 19, 35].includes(index + 1)
}));

export const BookingPage = () => {
    const { movieId } = useParams<{ movieId: string }>();
    const navigate = useNavigate();

    const [seats] = useState<SeatData[]>(INITIAL_SEATS);
    const [selectedSeatIds, setSelectedSeatIds] = useState<number[]>([]);

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
                    marginLeft: '48px'
                }}
                onClick={() => {
                    localStorage.removeItem('selectedMovie');
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

            <CinemaHall
                seats={seats}
                selectedSeatIds={selectedSeatIds}
                onSeatToggle={handleSeatToggle}
            />

            <div className="booking-summary" style={{ marginTop: '24px', textAlign: 'center' }}>
                <p className="booking-summary-text">
                    Selected seats: <strong>{selectedSeatIds.length}</strong> | Total: <strong>{selectedSeatIds.length * TICKET_PRICE}$</strong>
                </p>
                <button
                    type="button"
                    className="btn btn-primary"
                    disabled={selectedSeatIds.length === 0}
                    style={{ marginTop: '12px' }}
                    onClick={handleConfirm}
                >
                    Proceed to checkout
                </button>
            </div>
        </main>
    );
};