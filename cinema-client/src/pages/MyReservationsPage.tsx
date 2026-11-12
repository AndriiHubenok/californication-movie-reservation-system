import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    cancelReservation,
    fetchMyReservations,
    type ReservationItem,
} from '../api/reservations';
import { ApiError } from '../api/client';
import { ConfirmModal } from '../components/ConfirmModal';

export const MyReservationsPage = () => {
    const [reservations, setReservations] = useState<ReservationItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [targetReservation, setTargetReservation] = useState<ReservationItem | null>(null);
    const [isCancelling, setIsCancelling] = useState<boolean>(false);
    const [actionError, setActionError] = useState<string | null>(null);

    type FilterReservationType = 'all' | 'active' | 'cancelled' | 'pending'
    const [filter, setFilter] = useState<FilterReservationType>('all');

    const FILTER_OPTIONS: { label: string; value: FilterReservationType }[] = [
        { label: 'All', value: 'all' },
        { label: 'Active', value: 'active' },
        { label: 'Cancelled', value: 'cancelled' },
        { label: 'Pending', value: 'pending' },
    ];

    const formatDateTime = (isoDate: string) =>
        new Date(isoDate).toLocaleString([], {
            dateStyle: 'short',
            timeStyle: 'short',
        });

    useEffect(() => {
        const controller = new AbortController();

        const loadReservations = async () => {
            setIsLoading(true);
            setError(null);

            try {

                let data: ReservationItem[] = (await fetchMyReservations(controller.signal));
                setReservations(data);

            } catch (err) {
                if (err instanceof Error && err.name === 'AbortError') {
                    return;
                }
                setError(
                    err instanceof ApiError
                        ? err.message
                        : 'Failed to load your reservations.'
                );
            } finally {
                if (!controller.signal.aborted) {
                    setIsLoading(false);
                }
            }
        };

        loadReservations();

        return () => {
            controller.abort();
        };
    }, []);

    const filteredReservations = reservations.filter((reservation) => {
        const status = reservation.status.toLowerCase();
        if (filter === 'active') return status === 'confirmed';
        if (filter === 'cancelled') return status === 'cancelled';
        if (filter === 'pending') return status === 'pending';
        return true;
    });

    const handleConfirmCancel = async () => {
        if (!targetReservation) return;

        setIsCancelling(true);
        setActionError(null);

        try {
            await cancelReservation(targetReservation.id);
            setReservations((prev) =>
                prev.filter((item) => item.id !== targetReservation.id)
            );
            setTargetReservation(null);
        } catch (err) {
            setActionError(
                err instanceof ApiError
                    ? err.message
                    : 'Error occurred while cancelling the reservation. Please try again later.'
            );
        } finally {
            setIsCancelling(false);
        }
    };

    if (isLoading) {
        return (
            <main className="reservations-page">
                <p>Loading your reservations...</p>
            </main>
        );
    }

    if (error) {
        return (
            <main className="reservations-page">
                <p style={{ color: '#ff4d4d', marginBottom: '12px' }}>{error}</p>
                <Link to="/" className="btn btn-primary" style={{ textDecoration: 'none' }}>
                    Homepage
                </Link>
            </main>
        );
    }

    return (
        <main className="reservations-page">
            <h2>My Reservations</h2>
            <p style={{ color: '#a0a0a0', marginBottom: '12px' }}>You have {filteredReservations.length} reservation(s).</p>
            <div className="filter-reservation-options" style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                {FILTER_OPTIONS.map((option) => {
                    const isActive = filter === option.value;

                    return (
                        <button
                            key={option.value}
                            type="button"
                            className={`btn ${isActive ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setFilter(option.value)}
                        >
                            {option.label}
                        </button>
                    );
                })}
            </div>

            {actionError && (
                <div style={{ color: '#ff4d4d', background: '#2a1818', padding: '12px', borderRadius: '4px', marginTop: '16px' }}>
                    {actionError}
                </div>
            )}

            {filteredReservations.length === 0 ? (
                <div style={{ marginTop: '32px', textAlign: 'center', padding: '32px', background: '#1e1e1e', borderRadius: '8px' }}>
                    <p style={{ color: '#a0a0a0', marginBottom: '16px' }}>
                        You have not any reservation yet :(
                    </p>
                    <Link to="/" className="btn btn-primary" style={{ textDecoration: 'none' }}>
                        Now Showing
                    </Link>
                </div>
            ) : (
                <div className="reservations-list">
                    {filteredReservations.map((item) => (
                        <article key={item.id} className="reservation-card">
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                    <h3>Reservation #{item.id}</h3>
                                    <span className={`status-badge status-${item.status.toLowerCase()}`}>
                                        {item.status}
                                    </span>
                                </div>
                                <p style={{ color: '#a0a0a0', fontSize: '0.9rem' }}>
                                    {item?.cinema_name} - {item?.movie_title} {formatDateTime(item?.start_time)} · Tickets: {item.tickets?.length ?? 0} ·{' '}
                                    Created: {formatDateTime(item.created_at)}
                                </p>
                            </div>

                            <div>
                                <button
                                    type="button"
                                    className="btn btn-danger"
                                    disabled={item.status.toLowerCase() === 'cancelled'}
                                    onClick={() => {
                                        setActionError(null);
                                        setTargetReservation(item);
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </article>
                    ))}
                </div>
            )}

            <ConfirmModal
                isOpen={targetReservation !== null}
                title="Cancellation of reservation"
                message={`Are you sure, that you want to cancel reservation #${targetReservation?.id}? This action cannot be undone.`}
                confirmLabel="Yes, cancel"
                cancelLabel="Keep"
                isProcessing={isCancelling}
                onConfirm={handleConfirmCancel}
                onCancel={() => setTargetReservation(null)}
            />
        </main>
    );
};