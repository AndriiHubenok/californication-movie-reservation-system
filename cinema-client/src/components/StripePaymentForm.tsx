import {useState, type FormEvent} from 'react';
import {CardElement, useElements, useStripe} from '@stripe/react-stripe-js';
import {payReservation, type PaymentConfirmedResponse} from '../api/reservations';
import {ApiError} from '../api/client';

interface StripePaymentFormProps {
    reservationId: number;
    totalAmount: number;
    disabled?: boolean;
    onPaymentSuccess: (payment: PaymentConfirmedResponse) => void;
}

const CARD_ELEMENT_OPTIONS = {
    style: {
        base: {
            color: '#ffffff',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontSize: '16px',
            '::placeholder': {
                color: '#777777',
            },
        },
        invalid: {
            color: '#ff4d4d',
            iconColor: '#ff4d4d',
        },
    },
};

export const StripePaymentForm = ({
                                      reservationId,
                                      totalAmount,
                                      disabled = false,
                                      onPaymentSuccess,
                                  }: StripePaymentFormProps) => {
    const stripe = useStripe();
    const elements = useElements();

    const [isProcessing, setIsProcessing] = useState(false);
    const [cardError, setCardError] = useState<string | null>(null);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!stripe || !elements || disabled) return;

        const cardElement = elements.getElement(CardElement);
        if (!cardElement) return;

        setIsProcessing(true);
        setCardError(null);

        try {
            const {error: stripeError, paymentMethod} = await stripe.createPaymentMethod({
                type: 'card',
                card: cardElement,
            });

            if (stripeError || !paymentMethod) {
                setCardError(stripeError?.message ?? 'Invalid card details.');
                return;
            }

            const response = await payReservation(reservationId, paymentMethod.id);

            if (response.status === 'requires_action') {
                const {error: actionError, paymentIntent} = await stripe.handleNextAction({
                    clientSecret: response.client_secret,
                });

                if (actionError) {
                    setCardError(actionError.message ?? '3D Secure authentication failed.');
                    return;
                }

                if (paymentIntent?.status === 'succeeded') {
                    onPaymentSuccess({
                        id: 0,
                        transaction_id: paymentIntent.id,
                        user: 0,
                        reservation: reservationId,
                        amount: totalAmount.toFixed(2),
                        status: 'confirmed',
                        created_at: new Date().toISOString(),
                    });
                    return;
                }

                setCardError(`Unexpected payment status: ${paymentIntent?.status}`);
                return;
            }

            onPaymentSuccess(response);
        } catch (err) {
            if (err instanceof ApiError) {
                const backendError =
                    (err.data as { error?: string } | null)?.error ?? err.message;
                setCardError(backendError);
            } else {
                setCardError('Payment failed. Please check your connection and try again.');
            }
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
            <div className="form-group">
                <label>Card Details</label>
                <div
                    style={{
                        padding: '12px',
                        borderRadius: '4px',
                        border: '1px solid #444',
                        backgroundColor: '#1a1a1a',
                    }}
                >
                    <CardElement
                        options={CARD_ELEMENT_OPTIONS}
                        onChange={(event) => {
                            setCardError(event.error ? event.error.message : null);
                        }}
                    />
                </div>
            </div>

            {cardError && <p className="error-message">{cardError}</p>}

            <button
                type="submit"
                className="btn btn-primary"
                disabled={!stripe || isProcessing || disabled}
            >
                {isProcessing ? 'Processing payment...' : `Pay $${totalAmount.toFixed(2)}`}
            </button>
        </form>
    );
};