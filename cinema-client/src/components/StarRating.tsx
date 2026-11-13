import {useState} from 'react';

interface StarRatingProps {
    value: number;
    onChange?: (rating: number) => void;
    readOnly?: boolean;
    maxStars?: number;
}

export const StarRating = ({
                               value,
                               onChange,
                               readOnly = false,
                               maxStars = 5,
                           }: StarRatingProps) => {
    const [hoverValue, setHoverValue] = useState<number>(0);

    const activeValue = hoverValue > 0 ? hoverValue : value;

    return (
        <div
            className="star-rating"
            role={readOnly ? 'img' : 'radiogroup'}
            aria-label={`Rating: ${value} of ${maxStars}`}
            onMouseLeave={() => {
                if (!readOnly) setHoverValue(0);
            }}
        >
            {Array.from({length: maxStars}, (_, index) => {
                const starNumber = index + 1;
                const isFilled = starNumber <= activeValue;

                return (
                    <button
                        key={starNumber}
                        type="button"
                        className={`star-btn ${isFilled ? 'filled' : ''}`}
                        disabled={readOnly}
                        aria-label={`Rating: ${starNumber} of ${maxStars}`}
                        onMouseEnter={() => {
                            if (!readOnly) setHoverValue(starNumber);
                        }}
                        onClick={() => {
                            if (!readOnly && onChange) {
                                onChange(starNumber);
                            }
                        }}
                    >
                        ★
                    </button>
                );
            })}
        </div>
    );
};