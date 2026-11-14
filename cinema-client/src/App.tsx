import type { Showtime } from './types/showtime.ts';
import { MovieWithShowtimesCard } from './components/MovieWithShowtimesCard.tsx';
import './App.css';
import type {SeatData} from "./types/cinema.ts";
import {useEffect, useState} from "react";
import {CinemaHall} from "./components/CinemaHall.tsx";
import { MoviesWithShowtimesList } from './components/MoviesWithShowtimesList.tsx';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { BookingPage } from './pages/BookingPage';
import { CheckoutPage } from './pages/CheckoutPage';
import {NotFoundPage} from "./pages/NotFoundPage.tsx";
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { LoginPage } from './pages/LoginPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import {TicketSuccessPage} from "./pages/TicketSuccessPage.tsx";
import {MyReservationsPage} from "./pages/MyReservationsPage.tsx";
import {MovieDetailsPage} from "./pages/MovieDetailsPage.tsx";

const Header = () => {
    const { user, isAuthenticated, logout } = useAuth();

    return (
        <header className="header">
            <h1>Cinema</h1>
            <nav className="nav">
                <ul className="nav-list">
                    <li><NavLink to="/" end>Now Showing</NavLink></li>
                    <li><NavLink to="/checkout">Checkout</NavLink></li>
                    {isAuthenticated && (
                        <li><NavLink to="/my-reservations">My Reservations</NavLink></li>
                    )}
                    {isAuthenticated ? (
                        <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ fontSize: '0.9rem', color: '#a0a0a0' }}>{user?.username}</span>
                            <button
                                type="button"
                                onClick={logout}
                                style={{ background: 'transparent', border: '1px solid #444', color: '#fff', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}
                            >
                                Logout
                            </button>
                        </li>
                    ) : (
                        <li><NavLink to="/login">Login</NavLink></li>
                    )}
                </ul>
            </nav>
        </header>
    );
};

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <div className="app-container">
                    <Header />
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/booking/:movieId" element={<BookingPage />} />
                        <Route path="/movies/:movieId" element={<MovieDetailsPage />} />
                        <Route path="*" element={<NotFoundPage />} />

                        <Route element={<ProtectedRoute />}>
                            <Route path="/checkout" element={<CheckoutPage />} />
                            <Route path="/ticket" element={<TicketSuccessPage />} />
                            <Route path="/my-reservations" element={<MyReservationsPage />} />
                        </Route>
                    </Routes>
                </div>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;