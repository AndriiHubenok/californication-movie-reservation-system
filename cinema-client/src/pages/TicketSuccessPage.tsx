import { useEffect, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import {
    downloadTicketPdf,
    fetchReservationById,
    type ReservationItem,
} from '../api/reservations';
import { ApiError } from '../api/client';
import { useToast } from '../context/ToastContext';

type TicketPageState =
    | { status: 'polling'; attempt: number }
    | { status: 'confirmed'; reservation: ReservationItem }
    | { status: 'timeout'; reservationId: string }
    | { status: 'error'; message: string };

const MAX_POLL_ATTEMPTS = 12;
const POLL_INTERVAL_MS = 2000;

export const TicketSuccessPage = () => {
    const [searchParams] = useSearchParams();
    const location = useLocation();
    const { showToast } = useToast();

    const stateReservation = (location.state as { reservation?: ReservationItem } | null)?.reservation;
    const reservationId = searchParams.get('reservation_id') ?? stateReservation?.id?.toString();

    const [pageState, setPageState] = useState<TicketPageState>(() => {
        if (stateReservation && ['paid', 'confirmed'].includes(stateReservation.status.toLowerCase())) {
            return { status: 'confirmed', reservation: stateReservation };
        }
        if (!reservationId) {
            return { status: 'error', message: 'ID for reservation not found.' };
        }
        return { status: 'polling', attempt: 1 };
    });

    const [isDownloading, setIsDownloading] = useState(false);

    useEffect(() => {
        if (!reservationId || pageState.status !== 'polling') {
            return;
        }

        const controller = new AbortController();
        let timeoutId: number | undefined;
        let currentAttempt = 1;

        const pollReservationStatus = async () => {
            try {
                const data = await fetchReservationById(reservationId, controller.signal);
                const normalizedStatus = data.status.toLowerCase();

                if (normalizedStatus === 'paid' || normalizedStatus === 'confirmed') {
                    setPageState({ status: 'confirmed', reservation: data });
                    return;
                }

                if (currentAttempt >= MAX_POLL_ATTEMPTS) {
                    setPageState({ status: 'timeout', reservationId });
                    return;
                }

                currentAttempt += 1;
                setPageState({ status: 'polling', attempt: currentAttempt });
                timeoutId = window.setTimeout(pollReservationStatus, POLL_INTERVAL_MS);
            } catch (err) {
                if (err instanceof Error && err.name === 'AbortError') {
                    return;
                }
                setPageState({
                    status: 'error',
                    message:
                        err instanceof ApiError
                            ? err.message
                            : 'Failed to check payment status.',
                });
            }
        };

        pollReservationStatus();

        return () => {
            controller.abort();
            if (timeoutId !== undefined) {
                window.clearTimeout(timeoutId);
            }
        };
    }, [reservationId, pageState.status]);

    const handleDownloadPdf = async (id: number) => {
        setIsDownloading(true);
        try {
            await downloadTicketPdf(id);
            showToast('Ticket downloaded.', 'success');
        } catch (err) {
            showToast(
                err instanceof ApiError ? err.message : 'Error downloading PDF ticket.',
                'error'
            );
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <main style={{ maxWidth: '540px', margin: '48px auto', padding: '0 16px' }}>
            <div
                style={{
                    backgroundColor: '#1e1e1e',
                    border: '1px solid #333',
                    borderRadius: '10px',
                    padding: '28px',
                    textAlign: 'center',
                }}
            >
                {pageState.status === 'polling' && (
                    <>
                        <h2 style={{ marginBottom: '12px' }}>Confirming payment...</h2>
                        <p style={{ color: '#a0a0a0', marginBottom: '8px' }}>
                            Waiting for transaction confirmation from the payment system.
                        </p>
                        <p style={{ fontSize: '0.85rem', color: '#777' }}>
                            Checking {pageState.attempt} of {MAX_POLL_ATTEMPTS}
                        </p>
                    </>
                )}

                {pageState.status === 'confirmed' && (
                    <>
                        <h2 style={{ color: '#2ec4b6', marginBottom: '12px' }}>
                            Payment confirmed!
                        </h2>
                        <p style={{ color: '#e0e0e0', marginBottom: '16px' }}>
                            Reservation <strong>#{pageState.reservation.id}</strong> successfully paid.
                        </p>
                        <div
                            style={{
                                backgroundColor: '#242424',
                                padding: '16px',
                                borderRadius: '8px',
                                marginBottom: '24px',
                                textAlign: 'left',
                            }}
                        >
                            <p style={{ marginBottom: '6px' }}>
                                <strong>Status:</strong> {pageState.reservation.status}
                            </p>
                            <p style={{ marginBottom: '6px' }}>
                                <strong>Tickets:</strong>{' '}
                                {pageState.reservation.tickets?.join(', ') || 'Formed'}
                            </p>
                            <p>
                                <strong>Date:</strong>{' '}
                                {new Date(pageState.reservation.created_at).toLocaleString()}
                            </p>
                        </div>

                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <button
                                type="button"
                                className="btn btn-primary"
                                disabled={isDownloading}
                                onClick={() => handleDownloadPdf(pageState.reservation.id)}
                            >
                                {isDownloading ? 'Forming PDF...' : 'Download PDF Ticket'}
                            </button>
                            <Link
                                to="/my-reservations"
                                className="btn btn-secondary"
                                style={{ textDecoration: 'none' }}
                            >
                                My Reservations
                            </Link>
                        </div>
                    </>
                )}

                {pageState.status === 'timeout' && (
                    <>
                        <h2 style={{ color: '#ffc107', marginBottom: '12px' }}>
                            Payment confirmation pending
                        </h2>
                        <p style={{ color: '#e0e0e0', marginBottom: '24px', lineHeight: 1.5 }}>
                            The payment system has not yet sent the final confirmation for order #
                            {pageState.reservationId}. You can check the status in your account in a minute.
                        </p>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={() => setPageState({ status: 'polling', attempt: 1 })}
                            >
                                Check again
                            </button>
                            <Link
                                to="/my-reservations"
                                className="btn btn-secondary"
                                style={{ textDecoration: 'none' }}
                            >
                                My Reservations
                            </Link>
                        </div>
                    </>
                )}

                {pageState.status === 'error' && (
                    <>
                        <h2 style={{ color: '#ff4d4d', marginBottom: '12px' }}>Error</h2>
                        <p style={{ color: '#e0e0e0', marginBottom: '24px' }}>{pageState.message}</p>
                        <Link to="/" className="btn btn-primary" style={{ textDecoration: 'none' }}>
                            Back to Home
                        </Link>
                    </>
                )}
            </div>
        </main>
    );
};