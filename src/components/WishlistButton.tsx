"use client";

import { useState } from 'react';
import { useWishlist } from '@/contexts/WishlistContext';
import { useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';

interface WishlistButtonProps {
    productId: string;
    size?: 'sm' | 'md' | 'lg';
}

export default function WishlistButton({ productId, size = 'md' }: WishlistButtonProps) {
    const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    // Container sizes
    const containerSizes = {
        sm: 'w-8 h-8',
        md: 'w-10 h-10',
        lg: 'w-12 h-12'
    };

    // Icon sizes
    const iconSizes = {
        sm: 16,
        md: 20,
        lg: 24
    };

    const isInList = isInWishlist(productId);

    const toggleWishlist = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        // Check if user is logged in
        if (typeof window !== 'undefined') {
            const userSession = localStorage.getItem('user');
            if (!userSession) {
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
                ${containerSizes[size]}
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
                <svg className="w-4 h-4 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            ) : (
                <Heart
                    size={iconSizes[size]}
                    className={`transition-all duration-200 ${isInList
                            ? 'text-red-500 scale-110 fill-red-500'
                            : 'text-gray-400 group-hover:text-red-500 group-hover:fill-red-100'
                        }`}
                    strokeWidth={2}
                />
            )}
        </button>
    );
}
