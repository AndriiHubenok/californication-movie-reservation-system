import {useEffect, useRef, useState, type FormEvent} from 'react';
import {Link, useSearchParams} from 'react-router-dom';
import {verifyEmailRequest} from '../api/auth';
import {ApiError} from '../api/client';
import {useToast} from '../context/ToastContext';

type VerificationState =
    | { status: 'verifying' }
    | { status: 'success'; message: string }
    | { status: 'error'; message: string };

export const VerifyEmailPage = () => {
    const [searchParams] = useSearchParams();
    const {showToast} = useToast();

    const uid = searchParams.get('uid') ?? undefined;
    const token = searchParams.get('token');

    const [state, setState] = useState<VerificationState>(() =>
        token
            ? {status: 'verifying'}
            : {status: 'error', message: 'Request verification link is invalid or does not contain a token.'}
    );

    const [resendEmail, setResendEmail] = useState('');
    const [isResending, setIsResending] = useState(false);

    const hasTriggeredRef = useRef(false);

    useEffect(() => {
        if (!token || hasTriggeredRef.current) {
            return;
        }
        hasTriggeredRef.current = true;

        const confirmEmail = async () => {
            try {
                const response = await verifyEmailRequest({uid, token});
                console.log('Email verification response:', response);
                setState({
                    status: 'success',
                    message:
                        response.message ??
                        response.detail ??
                        'Your email has been successfully verified. You can now log in to your account.',
                });
            } catch (err) {
                console.error('Verify error:', err);
                setState({
                    status: 'error',
                    message:
                        err instanceof ApiError
                            ? err.message
                            : 'Failed to verify email. The verification link may have expired.',
                });
            }
        };

        confirmEmail();
    }, [uid, token]);

    return (
        <main style={{maxWidth: '460px', margin: '56px auto', padding: '0 16px'}}>
            <div
                style={{
                    backgroundColor: '#1e1e1e',
                    border: '1px solid #333',
                    borderRadius: '10px',
                    padding: '28px',
                    textAlign: 'center',
                }}
            >
                {state.status === 'verifying' && (
                    <>
                        <h2 style={{marginBottom: '12px'}}>Checking verification link...</h2>
                        <p style={{color: '#a0a0a0'}}>
                            Please wait while we verify your email address. This may take a few seconds.
                        </p>
                    </>
                )}

                {state.status === 'success' && (
                    <>
                        <h2 style={{color: '#2ec4b6', marginBottom: '12px'}}>Email Verified</h2>
                        <p style={{color: '#e0e0e0', marginBottom: '24px', lineHeight: 1.5}}>
                            {state.message}
                        </p>
                        <Link to="/login" className="btn btn-primary"
                              style={{textDecoration: 'none', display: 'inline-block'}}>
                            Go to Login
                        </Link>
                    </>
                )}

                {state.status === 'error' && (
                    <>
                        <h2 style={{color: '#ff4d4d', marginBottom: '12px'}}>Error Verifying Email</h2>
                        <p style={{color: '#e0e0e0', marginBottom: '24px', lineHeight: 1.5}}>
                            {state.message}
                        </p>

                        <form
                            onSubmit={console.log('resend email')}
                            style={{
                                borderTop: '1px solid #333',
                                paddingTop: '20px',
                                textAlign: 'left',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '12px',
                            }}
                        >
                            <label htmlFor="resend-email" style={{fontSize: '0.9rem', color: '#a0a0a0'}}>
                                Send verification link again to your email address:
                            </label>
                            <div className="form-group" style={{marginBottom: 0}}>
                                <input
                                    id="resend-email"
                                    type="email"
                                    placeholder="Enter your email"
                                    value={resendEmail}
                                    onChange={(e) => setResendEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <button type="submit" className="btn btn-primary" disabled={isResending}>
                                {isResending ? 'Sending...' : 'Resend'}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </main>
    );
};