"use client";

import { useState } from 'react';
import { useWishlist } from '@/contexts/WishlistContext';

interface WishlistButtonProps {
    productId: string;
    size?: 'sm' | 'md' | 'lg';
}

export default function WishlistButton({ productId, size = 'md' }: WishlistButtonProps) {
    const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
    const [isLoading, setIsLoading] = useState(false);

    // Icon sizes - compact for product cards to avoid badge overlap
    const iconSizes = {
        sm: 'w-7 h-7',
        md: 'w-9 h-9',
        lg: 'w-11 h-11'
    };

    const isInList = isInWishlist(productId);

    const toggleWishlist = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        setIsLoading(true);

        try {
            if (isInList) {
                await removeFromWishlist(productId);
            } else {
                await addToWishlist(productId);
            }
        } catch (error) {
            console.error('Error toggling wishlist:', error);
        } finally {
            setIsLoading(false);
        }
    };



    return (
        <button
            onClick={toggleWishlist}
            disabled={isLoading}
            className={`transition-all hover:scale-110 active:scale-95 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            aria-label={isInList ? 'Remove from wishlist' : 'Add to wishlist'}
            style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
        >
            {isLoading ? (
                <svg className={`${iconSizes[size]} animate-spin text-gray-600`} fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            ) : (
                <svg
                    className={`${iconSizes[size]} transition-all duration-200 ${isInList ? 'text-red-500' : 'text-white'}`}
                    fill={isInList ? 'currentColor' : 'currentColor'}
                    stroke="currentColor"
                    strokeWidth={isInList ? 0 : 2.5}
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                </svg>
            )}
        </button>
    );
}
