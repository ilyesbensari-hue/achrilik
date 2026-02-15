"use client";

import { useState } from 'react';
import { useWishlist } from '@/contexts/WishlistContext';
import { useRouter } from 'next/navigation';

interface WishlistButtonProps {
    productId: string;
    size?: 'sm' | 'md' | 'lg';
}

export default function WishlistButton({ productId, size = 'md' }: WishlistButtonProps) {
    const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    // Icon sizes - compact for product cards to avoid badge overlap
    const iconSizes = {
        sm: 'w-8 h-8',
        md: 'w-10 h-10',
        lg: 'w-12 h-12'
    };

    const isInList = isInWishlist(productId);

    const toggleWishlist = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        // Check if user is logged in
        if (typeof window !== 'undefined') {
            const userSession = localStorage.getItem('user');
            if (!userSession) {
                // Redirect to login
                router.push('/login?redirect=' + window.location.pathname);
                return;
            }
        }

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
            className={`
                relative group
                ${iconSizes[size]} 
                flex items-center justify-center
                rounded-full
                bg-white/90 backdrop-blur-sm
                shadow-lg
                transition-all duration-200
                hover:scale-110 hover:bg-white
                active:scale-95
                ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
            aria-label={isInList ? 'Remove from wishlist' : 'Add to wishlist'}
        >
            {isLoading ? (
                <svg className="w-5 h-5 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            ) : (
                <svg
                    className={`
                        w-5 h-5
                        transition-all duration-200
                        ${isInList
                            ? 'text-red-500 scale-110'
                            : 'text-gray-600 group-hover:text-red-500'
                        }
                    `}
                    fill={isInList ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    strokeWidth={2}
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
