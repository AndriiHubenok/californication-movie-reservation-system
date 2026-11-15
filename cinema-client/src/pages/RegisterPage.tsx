import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerRequest } from '../api/auth';
import { ApiError } from '../api/client';
import { useToast } from '../context/ToastContext';
import {PasswordInput} from "../components/PasswordInput.tsx";

export const RegisterPage = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

    const clearFieldError = (field: string) => {
        setFieldErrors((prev) => {
            if (!prev[field]) return prev;
            const updated = { ...prev };
            delete updated[field];
            return updated;
        });
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setFieldErrors({});

        const clientErrors: Record<string, string[]> = {};
        if (password.length < 8) {
            clientErrors.password = ['Password must be at least 8 characters long.'];
            return;
        }

        if (password !== confirmPassword) {
            clientErrors.confirmPassword = ['Passwords do not match.'];
            return;
        }

        if (Object.keys(clientErrors).length > 0) {
            setFieldErrors(clientErrors);
            return;
        }

        setIsSubmitting(true);

        try {
            await registerRequest({
                username: username.trim(),
                email: email.trim(),
                password,
            });
            showToast('Account created! Now check your email for verification.', 'success');
            navigate('/login');
        } catch (err) {
            if (err instanceof ApiError) {
                setFieldErrors(err.fieldErrors);

                if (err.fieldErrors.non_field_errors) {
                    setError(err.fieldErrors.non_field_errors.join(' '));
                } else if (Object.keys(err.fieldErrors).length === 0) {
                    setError(err.message);
                }
            } else {
                setError('Failed to register. Please check your connection.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main style={{ maxWidth: '420px', margin: '48px auto', padding: '0 16px' }}>
            <h2>Register</h2>
            <form
                onSubmit={handleSubmit}
                noValidate
                style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}
            >
                <div className="form-group">
                    <label htmlFor="reg-username">Username</label>
                    <input
                        id="reg-username"
                        type="text"
                        className={fieldErrors.username ? 'input-error' : ''}
                        value={username}
                        onChange={(e) => {
                            setUsername(e.target.value);
                            clearFieldError('username');
                        }}
                        required
                    />
                    {fieldErrors.username && (
                        <span className="error-message">{fieldErrors.username.join(' ')}</span>
                    )}
                </div>

                <div className="form-group">
                    <label htmlFor="reg-email">Email</label>
                    <input
                        id="reg-email"
                        type="email"
                        className={fieldErrors.email ? 'input-error' : ''}
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            clearFieldError('email');
                        }}
                        required
                    />
                    {fieldErrors.email && (
                        <span className="error-message">{fieldErrors.email.join(' ')}</span>
                    )}
                </div>

                <PasswordInput
                    value={password}
                    error={fieldErrors.password?.join(' ')}
                    onChange={(val) => {
                        setPassword(val);
                        clearFieldError('password');
                    }}
                />

                <div className="form-group">
                    <label htmlFor="reg-confirm">Confirm Password</label>
                    <input
                        id="reg-confirm"
                        type="password"
                        className={fieldErrors.confirmPassword ? 'input-error' : ''}
                        value={confirmPassword}
                        onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            clearFieldError('confirmPassword');
                        }}
                        required
                    />
                    {fieldErrors.confirmPassword && (
                        <span className="error-message">
                            {fieldErrors.confirmPassword.join(' ')}
                        </span>
                    )}
                </div>

                {error && <p className="error-message">{error}</p>}

                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? 'Creating account...' : 'Register'}
                </button>
            </form>

            <p style={{ marginTop: '16px', color: '#a0a0a0', fontSize: '0.9rem' }}>
                Already have an account? <Link to="/login" style={{ color: '#fff' }}>Log in</Link>
            </p>
        </main>
    );
};