import {useEffect} from "react";


export const TicketSuccessPage = () => {
    const movie = JSON.parse(localStorage.getItem('selectedMovie') || '{}');
    const rawSeats = localStorage.getItem('selectedSeats');
    const seatIds: number[] = rawSeats ? JSON.parse(rawSeats) : [];

    useEffect(() => {
        localStorage.removeItem('selectedSeats');
        localStorage.removeItem('selectedMovie');
    }, []);

    return (
        <main style={{ maxWidth: '600px', margin: '40px auto', padding: '0 16px', backgroundColor: '#f5f5f5', color : '#333', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
            <h2 style={{ color: '#333', fontWeight: 'bold' }}>Order Confirmation</h2>
            <p style={{ margin: '16px 0' }}>
                Your order has been successfully confirmed!
            </p>
            <p style={{ margin: '16px 0' }}>
                Movie: <strong>{movie.title || 'N/A'}</strong>
            </p>
            <p style={{ margin: '16px 0' }}>
                Selected tickets (seat IDs): <strong>{seatIds.join(', ') || 'No seats selected'}</strong>
            </p>
        </main>
    );
}