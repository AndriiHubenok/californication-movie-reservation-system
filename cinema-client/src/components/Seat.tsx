import type { Seat } from '../types/seat';

interface SeatProps {
    seat: Seat;
    isSelected: boolean;
    onToggle: (seatId: number) => void;
}

export const Seat = ({ seat, isSelected, onToggle }: SeatProps) => {
    let seatClasses = "seat";
    if (seat.is_occupied) seatClasses += " occupied";
    if (isSelected) seatClasses += " selected";

    return (
        <button
            type="button"
            className={seatClasses}
            disabled={seat.is_occupied}
            onClick={() => onToggle(seat.id)}
            aria-label={`Row ${seat.row}, Seat ${seat.number}`}
        />
    );
};