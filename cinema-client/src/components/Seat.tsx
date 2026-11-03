

import type { SeatData } from '../types/cinema';

interface SeatProps {
    seat: SeatData;
    isSelected: boolean;
    onToggle: (seatId: number) => void;
}

export const Seat = ({ seat, isSelected, onToggle }: SeatProps) => {
    let seatClasses = "seat";
    if (seat.isOccupied) seatClasses += " occupied";
    if (isSelected) seatClasses += " selected";

    return (
        <button
            type="button"
            className={seatClasses}
            disabled={seat.isOccupied}
            onClick={() => onToggle(seat.id)}
            aria-label={`Row ${seat.row}, Seat ${seat.number}`}
        />
    );
};