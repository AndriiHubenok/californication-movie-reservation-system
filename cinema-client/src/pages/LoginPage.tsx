import {useState, type FormEvent} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {useAuth} from '../context/AuthContext.tsx';
import {getOwnUserInfo, loginRequest} from "../api/auth.ts";
import {useToast} from "../context/ToastContext.tsx";
import {PasswordInput} from "../components/PasswordInput.tsx";

export const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const {showToast} = useToast();
    const {login} = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || '/';

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!username || !password) {
            setError('Fill in both username and password fields.');
            return;
        }

        try {
            const {access, refresh} = await loginRequest({username, password});
            login(access, refresh, {username, isStaff: false});
            const {is_staff} = await getOwnUserInfo();
            login(access, refresh, {username, isStaff: is_staff});
            navigate(from, {replace: true});
            showToast('Logged in successfully as ' + username, 'success');

        } catch (e) {
            showToast("Invalid username or password", 'error');
        }
    };

    return (
        <main style={{maxWidth: '400px', margin: '48px auto', padding: '0 16px'}}>
            <h2>Login to your account</h2>
            <form onSubmit={handleSubmit}
                  style={{display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px'}}>
                <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="user"
                        required
                    />
                </div>
                <PasswordInput onChange={setPassword}/>
                {error && <p style={{color: '#ff4d4d', fontSize: '0.9rem'}}>{error}</p>}
                <button type="submit" className="btn btn-primary">Login</button>
            </form>
            <p style={{ marginTop: '16px', color: '#a0a0a0', fontSize: '0.9rem' }}>
                Don't have an account? <a href="/register">Register here</a>
            </p>
        </main>
    );
};