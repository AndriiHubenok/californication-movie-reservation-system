import { useNavigate } from 'react-router-dom';
import {useEffect} from "react";

export const CheckoutPage = () => {
    const navigate = useNavigate();
    const rawSeats = localStorage.getItem('selectedSeats');
    const seatIds: number[] = rawSeats ? JSON.parse(rawSeats) : [];

    useEffect(() => {
        if (seatIds.length === 0) {
            navigate('/');
        }
    }, [])

    return (
        <main style={{ maxWidth: '600px', margin: '40px auto', padding: '0 16px' }}>
            <h2>Confirm your order</h2>
            <p style={{ margin: '16px 0' }}>
                Selected tickets (seat IDs): <strong>{seatIds.join(', ') || 'No seats selected'}</strong>
            </p>
            <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                    alert('Order confirmed successfully!');
                    navigate('/ticket');
                }}
            >
                Confirm Order
            </button>
        </main>
    );
};