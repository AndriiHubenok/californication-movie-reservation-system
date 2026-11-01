const API_BASE_URL = 'http://127.0.0.1:8000/api';

export const Auth = {
    getAccessToken: () => localStorage.getItem('accessToken'),
    getRefreshToken: () => localStorage.getItem('refreshToken'),
    setTokens: (access, refresh) => {
        localStorage.setItem('accessToken', access);
        localStorage.setItem('refreshToken', refresh);
    },
    clearTokens: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
    },
    isAuthenticated: () => Boolean(localStorage.getItem('accessToken'))
};

export async function authFetch(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = Auth.getAccessToken();

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, { ...options, headers });

    if (response.status === 401) {
        Auth.clearTokens();
        window.location.href = 'login.html';
        throw new Error('Session expired. Please log in again.');
    }

    return response;
}

export async function loginUser(username, password) {
    return await fetch(`${API_BASE_URL}/token/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    });
}

