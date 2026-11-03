import type { Movie } from './types/movie';
import { MovieCard } from './components/MovieCard';
import './App.css';
import type {SeatData} from "./types/cinema.ts";
import {useState} from "react";
import {CinemaHall} from "./components/CinemaHall.tsx";
import { MovieList } from './components/MovieList';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { BookingPage } from './pages/BookingPage';
import { CheckoutPage } from './pages/CheckoutPage';
import {NotFoundPage} from "./pages/NotFoundPage.tsx";
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { LoginPage } from './pages/LoginPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import {TicketSuccessPage} from "./pages/TicketSuccessPage.tsx";

const Header = () => {
    const { user, isAuthenticated, logout } = useAuth();

    return (
        <header className="header">
            <h1>Cinema</h1>
            <nav className="nav">
                <ul className="nav-list">
                    <li><NavLink to="/" end>Now Showing</NavLink></li>
                    <li><NavLink to="/checkout">Checkout</NavLink></li>
                    {isAuthenticated ? (
                        <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ fontSize: '0.9rem', color: '#a0a0a0' }}>{user?.email}</span>
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
                        <Route path="/booking/:movieId" element={<BookingPage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/ticket" element={<TicketSuccessPage />} />
                        <Route path="*" element={<NotFoundPage />} />

                        <Route element={<ProtectedRoute />}>
                            <Route path="/checkout" element={<CheckoutPage />} />
                        </Route>
                    </Routes>
                </div>
            </BrowserRouter>
        </AuthProvider>
    );
}

// function App() {
//     return (
//         <BrowserRouter>
//             <div className="app-container">
//                 <header className="header">
//                     <h1>Cinema</h1>
//                     <nav className="nav">
//                         <ul className="nav-list">
//                             <li>
//                                 <NavLink to="/" end>Home</NavLink>
//                             </li>
//                             <li>
//                                 <NavLink to="/checkout">Checkout</NavLink>
//                             </li>
//                         </ul>
//                     </nav>
//                 </header>
//
//                 <Routes>
//                     <Route path="/" element={<HomePage />} />
//                     <Route path="/booking/:movieId" element={<BookingPage />} />
//                     <Route path="/checkout" element={<CheckoutPage />} />
//                     <Route path="*" element={<NotFoundPage />} />
//                 </Routes>
//             </div>
//         </BrowserRouter>
//     );
// }

// function App() {
//   const handleMovieSelect = (movieId: number) => {
//     console.log(`Selected movie ID: ${movieId}`);
//   };
//
//   return (
//       <div>
//         <header className="header">
//           <h1>Cinema</h1>
//         </header>
//         <main>
//           <MovieList onSelectMovie={handleMovieSelect} />
//         </main>
//       </div>
//   );
// }

// const TICKET_PRICE = 150;
//
// const INITIAL_SEATS: SeatData[] = Array.from({ length: 48 }, (_, index) => {
//   const row = Math.floor(index / 8) + 1;
//   const number = (index % 8) + 1;
//   const isOccupied = [4, 5, 11, 12, 31, 46].includes(index + 1);
//
//   return {
//     id: index + 1,
//     row,
//     number,
//     isOccupied
//   };
// });
//
// function App() {
//   const [seats] = useState<SeatData[]>(INITIAL_SEATS);
//   const [selectedSeatIds, setSelectedSeatIds] = useState<number[]>([]);
//
//   const handleSeatToggle = (seatId: number) => {
//     setSelectedSeatIds((prevSelected) => {
//       if (prevSelected.includes(seatId)) {
//         return prevSelected.filter((id) => id !== seatId);
//       } else {
//         return [...prevSelected, seatId];
//       }
//     });
//   };
//
//   const selectedCount = selectedSeatIds.length;
//   const totalPrice = selectedCount * TICKET_PRICE;
//
//   return (
//       <div>
//         <header className="header">
//           <h1>Cinema</h1>
//         </header>
//
//         <main>
//           <h2 style={{ textAlign: 'center', margin: '20px 0' }}>Booking: Inception</h2>
//
//           <CinemaHall
//               seats={seats}
//               selectedSeatIds={selectedSeatIds}
//               onSeatToggle={handleSeatToggle}
//           />
//
//           <div className="booking-summary" style={{ marginTop: '24px' }}>
//             <p className="booking-summary-text">
//               Selected seats: <strong>{selectedCount}</strong> on the total amount: <strong>{totalPrice}$</strong>
//             </p>
//             <button
//                 type="button"
//                 className="btn btn-primary"
//                 disabled={selectedCount === 0}
//                 style={{ marginTop: '12px' }}
//                 onClick={() => alert(`Order for ${totalPrice} $ confirmed!`)}
//             >
//               Confirm Booking
//             </button>
//           </div>
//         </main>
//       </div>
//   );
// }

// const INITIAL_MOVIES: Movie[] = [
//   {
//     id: 1,
//     title: "Forrest Gump",
//     description: "A chronicle of the life of a man named Forrest Gump.",
//     duration: 142,
//     poster: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSUVjnnyK_0eE_hHAkCsWur3ZWhHOjVA-mxdEBk6f5BDQ&s=10",
//     genres: ["Drama", "Romance"]
//   },
//   {
//     id: 2,
//     title: "Inception",
//     description: "A thief who steals corporate secrets through dream-sharing technology.",
//     duration: 148,
//     poster: "https://m.media-amazon.com/images/I/912AErFSBHL._AC_UF894,1000_QL80_.jpg",
//     genres: ["Action", "Sci-Fi"]
//   }
// ];

// function App() {
//   const handleMovieSelect = (id: number) => {
//     alert(`Selected movie with ID: ${id}`);
//   };
//
//   return (
//       <div>
//         <header className="header">
//           <h1>Cinema</h1>
//           <nav className="nav">
//             <ul className="nav-list">
//               <li id="auth-nav-item"><a href="login.html">Login</a></li>
//               <li><a href="index.html">Home</a></li>
//               <li><a href="movies.html">Movies</a></li>
//               <li><a href="contact.html">Contact</a></li>
//             </ul>
//           </nav>
//         </header>
//         <main>
//           <section className="movies-section">
//             <h2 className="movies-section-title">Now Showing</h2>
//             <div className="movies-grid">
//               {INITIAL_MOVIES.map((movie) => (
//                   <MovieCard
//                       key={movie.id}
//                       movie={movie}
//                       onSelect={handleMovieSelect}
//                   />
//               ))}
//             </div>
//           </section>
//         </main>
//         <footer className="footer">
//           <p>&copy; 2026 Cinema. All rights reserved.</p>
//         </footer>
//       </div>
//   );
// }

export default App;