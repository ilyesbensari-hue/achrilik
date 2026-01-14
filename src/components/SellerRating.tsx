import React from 'react';

interface SellerRatingProps {
  rating: number;
  count?: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
}

const SellerRating: React.FC<SellerRatingProps> = ({ rating, count = 0, size = 'sm', showCount = true }) => {
  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const roundedRating = Math.round(rating);

  return (
    <div className="flex items-center gap-1">
      <div className={`flex text-yellow-400 ${sizeClasses[size]}`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i}>{i < roundedRating ? '★' : '☆'}</span>
        ))}
      </div>
      {showCount && count > 0 && (
        <span className={`text-gray-400 ${sizeClasses[size] === 'text-xs' ? 'text-[10px]' : 'text-xs'}`}>
          ({count})
        </span>
      )}
    </div>
  );
};

export default SellerRating;
