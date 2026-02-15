"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import useSWR, { mutate } from 'swr';

interface WishlistContextType {
    wishlistIds: Set<string>;
    isLoading: boolean;
    addToWishlist: (productId: string) => Promise<void>;
    removeFromWishlist: (productId: string) => Promise<void>;
    isInWishlist: (productId: string) => boolean;
    wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function WishlistProvider({ children }: { children: ReactNode }) {
    const [userId, setUserId] = useState<string | null>(null);
    const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());

    // Get user ID from localStorage on mount
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const userSession = localStorage.getItem('user');
        if (userSession) {
            try {
                const user = JSON.parse(userSession);
                setUserId(user.id);
            } catch (e) {
                console.error('Failed to parse user session', e);
            }
        }
    }, []);

    // Use SWR for data fetching with deduplication - ONE REQUEST FOR ENTIRE APP
    const { data, error, isLoading } = useSWR(
        userId ? `/api/wishlist?userId=${userId}` : null,
        fetcher,
        {
            revalidateOnFocus: false,
            dedupingInterval: 60000, // 60 seconds deduplication
            refreshInterval: 0, // Only refresh on demand
        }
    );

    // Update wishlist IDs set when data changes
    useEffect(() => {
        if (data?.success && data?.products) {
            const ids = new Set<string>(data.products.map((p: any) => p.id));
            setWishlistIds(ids);
        }
    }, [data]);

    // Listen for custom wishlist update events
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleUpdate = () => {
            // Force SWR to revalidate
            if (userId) {
                mutate(`/api/wishlist?userId=${userId}`);
            }
        };

        window.addEventListener('wishlistUpdate', handleUpdate);
        return () => window.removeEventListener('wishlistUpdate', handleUpdate);
    }, [userId]);

    const addToWishlist = async (productId: string) => {
        if (!userId) return;

        try {
            const response = await fetch('/api/wishlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, productId })
            });

            const result = await response.json();
            if (result.success) {
                // Optimistically update local state
                setWishlistIds(prev => new Set([...prev, productId]));
                // Trigger global update event
                window.dispatchEvent(new Event('wishlistUpdate'));
            }
        } catch (error) {
            console.error('Error adding to wishlist:', error);
        }
    };

    const removeFromWishlist = async (productId: string) => {
        if (!userId) return;

        try {
            const response = await fetch('/api/wishlist', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, productId })
            });

            const result = await response.json();
            if (result.success) {
                // Optimistically update local state
                setWishlistIds(prev => {
                    const updated = new Set(prev);
                    updated.delete(productId);
                    return updated;
                });
                // Trigger global update event
                window.dispatchEvent(new Event('wishlistUpdate'));
            }
        } catch (error) {
            console.error('Error removing from wishlist:', error);
        }
    };

    const isInWishlist = (productId: string) => {
        return wishlistIds.has(productId);
    };

    return (
        <WishlistContext.Provider value={{
            wishlistIds,
            isLoading,
            addToWishlist,
            removeFromWishlist,
            isInWishlist,
            wishlistCount: wishlistIds.size
        }}>
            {children}
        </WishlistContext.Provider>
    );
}

export function useWishlist() {
    const context = useContext(WishlistContext);
    if (context === undefined) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
}
