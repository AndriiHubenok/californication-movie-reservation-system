import {Auth, loginUser} from "./api.js";

const username = document.getElementById('username');
const password = document.getElementById('password');
const authError = document.getElementById('auth-error');

export function updateNavbarAuth() {
    const navItem = document.getElementById('auth-nav-item');

    if (Auth.isAuthenticated()) {
        navItem.innerHTML = '<a href="#" id="logout-link">Logout</a>';
        document.getElementById('logout-link')?.addEventListener('click', (e) => {
            e.preventDefault();
            Auth.clearTokens();
            updateNavbarAuth();
            window.location.href = 'login.html';
        });

    } else {
        navItem.innerHTML = '<a href="login.html">Login</a>';
    }
}

const loginForm = document.getElementById('login-form');
if (loginForm) {
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const authError = document.getElementById('auth-error');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (authError) authError.textContent = '';

        const user = usernameInput.value.trim();
        const pass = passwordInput.value;

        try {
            const response = await loginUser(user, pass);
            const data = await response.json();

            if (response.ok && data.access && data.refresh) {
                Auth.setTokens(data.access, data.refresh);
                window.location.href = 'index.html';
            } else {
                if (authError) {
                    authError.textContent = data.detail || 'Invalid username or password.';
                }
            }
        } catch (err) {
            if (authError) {
                authError.textContent = 'Server connection error. Please try again.';
            }
        }
    });
}

updateNavbarAuth();