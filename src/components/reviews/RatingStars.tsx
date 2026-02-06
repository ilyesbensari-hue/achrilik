'use client';

import { Star } from 'lucide-react';

interface RatingStarsProps {
    rating: number;
    maxRating?: number;
    size?: 'sm' | 'md' | 'lg';
    showNumber?: boolean;
    interactive?: boolean;
    onChange?: (rating: number) => void;
}

export function RatingStars({
    rating,
    maxRating = 5,
    size = 'md',
    showNumber = false,
    interactive = false,
    onChange
}: RatingStarsProps) {
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-5 w-5',
        lg: 'h-6 w-6'
    };

    const handleClick = (newRating: number) => {
        if (interactive && onChange) {
            onChange(newRating);
        }
    };

    return (
        <div className="flex items-center gap-1">
            {Array.from({ length: maxRating }).map((_, index) => {
                const starValue = index + 1;
                const isFilled = starValue <= rating;
                const isPartial = !isFilled && starValue - 1 < rating && rating < starValue;

                return (
                    <button
                        key={index}
                        type="button"
                        disabled={!interactive}
                        onClick={() => handleClick(starValue)}
                        className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}`}
                    >
                        <Star
                            className={`${sizeClasses[size]} ${isFilled
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : isPartial
                                        ? 'fill-yellow-200 text-yellow-400'
                                        : 'fill-none text-gray-300'
                                }`}
                        />
                    </button>
                );
            })}
            {showNumber && (
                <span className="ml-2 text-sm font-medium text-gray-700">
                    {rating.toFixed(1)}
                </span>
            )}
        </div>
    );
}
