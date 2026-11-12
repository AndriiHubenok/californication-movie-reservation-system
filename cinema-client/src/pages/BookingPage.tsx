import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchShowtimeDetails } from '../api/showtimes';
import { CinemaHall } from '../components/CinemaHall';
import type { Seat } from '../types/seat';

export const BookingPage = () => {
    const { movieId: showtimeId } = useParams<{ movieId: string }>();
    const navigate = useNavigate();

    const [hallName, setHallName] = useState<string>();
    const [movieName, setMovieName] = useState<string>();
    const [price, setPrice] = useState<number>();
    const [startTime, setStartTime] = useState<string>();
    const [endTime, setEndTime] = useState<string>();
    const [seats, setSeats] = useState<Seat[]>([]);
    const [selectedSeatIds, setSelectedSeatIds] = useState<number[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!showtimeId) {
            setIsLoading(false);
            setError('Missing ID in route.');
            return;
        }

        const controller = new AbortController();

        const loadSeats = async () => {
            setIsLoading(true);
            setError(null);
            setSelectedSeatIds([]);

            const formatTime = (isoDate: string) =>
                new Date(isoDate).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                });

            try {
                const data = await fetchShowtimeDetails(showtimeId, controller.signal);
                setMovieName(data.movie_title)
                setHallName(data.hall_name)
                setStartTime(formatTime(data.start_time))
                setEndTime(formatTime(data.end_time))
                setPrice(Number(data.price).toFixed(2))
                setSeats(data.seats);
            } catch (err) {
                if (err instanceof Error && err.name === 'AbortError') {
                    return;
                }
                setError(
                    err instanceof Error ? err.message : 'Failed to load seats.'
                );
            } finally {
                setIsLoading(false);
            }
        };

        loadSeats();

        return () => {
            controller.abort();
        };
    }, [showtimeId]);

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
                {movieName}
            </h2>
            <p style={{ textAlign: 'center', color: '#a0a0a0', marginBottom: '24px' }}>
                {hallName} - {startTime} to {endTime}
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
                    <strong>{selectedSeatIds.length * price}$</strong>
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