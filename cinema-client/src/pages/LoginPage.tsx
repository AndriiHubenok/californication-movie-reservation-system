import { useState, type FormEvent } from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';

export const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || '/';

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!email || !password) {
            setError('Fill in both email and password fields.');
            return;
        }

        const mockAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock';
        const mockUser = { id: 1, email };

        login(mockAccessToken, mockUser);
        navigate(from, { replace: true });
    };

    return (
        <main style={{ maxWidth: '400px', margin: '48px auto', padding: '0 16px' }}>
            <h2>Login to your account</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}>
                <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <input
                        id="username"
                        type="text"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="user"
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                    />
                </div>
                {error && <p style={{ color: '#ff4d4d', fontSize: '0.9rem' }}>{error}</p>}
                <button type="submit" className="btn btn-primary">Login</button>
            </form>
        </main>
    );
};