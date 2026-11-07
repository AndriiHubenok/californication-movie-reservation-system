import type { Seat } from '../types/seat';
import { Seat as SeatComponent } from './Seat';

interface CinemaHallProps {
    seats: Seat[];
    selectedSeatIds: number[];
    onSeatToggle: (seatId: number) => void;
}

export const CinemaHall = ({ seats, selectedSeatIds, onSeatToggle }: CinemaHallProps) => {
    return (
        <div className="booking-container">
            <div className="screen"></div>

            <div className="cinema-hall">
                {seats.map((seat) => (
                    <SeatComponent
                        key={seat.id}
                        seat={seat}
                        isSelected={selectedSeatIds.includes(seat.id)}
                        onToggle={onSeatToggle}
                    />
                ))}
            </div>

            <div className="legend">
                <div className="legend-item">
                    <span className="seat">Available</span>
                </div>
                <div className="legend-item">
                    <span className="seat selected">Selected</span>
                </div>
                <div className="legend-item">
                    <span className="seat occupied">Occupied</span>
                </div>
            </div>
        </div>
    );
};