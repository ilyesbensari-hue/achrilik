import { useState, useEffect } from 'react';
import useSWR from 'swr';

// Fetcher function for SWR
const fetcher = (url: string) => fetch(url).then(res => res.json());

export function useWishlistCount() {
    const [userId, setUserId] = useState<string | null>(null);

    // Get user ID from localStorage on mount (client-side only)
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

    // Use SWR for data fetching with deduplication
    const { data, error } = useSWR(
        userId ? `/api/wishlist?userId=${userId}` : null,
        fetcher,
        {
            revalidateOnFocus: false,
            dedupingInterval: 10000, // 10 seconds deduplication
            refreshInterval: 30000, // Refresh every 30 seconds
        }
    );

    // Listen for custom wishlist update events
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleUpdate = () => {
            // SWR will automatically revalidate due to mutate
        };

        window.addEventListener('wishlistUpdate', handleUpdate);
        return () => window.removeEventListener('wishlistUpdate', handleUpdate);
    }, []);

    // Return count from API data or fallback to localStorage
    if (error || !userId) {
        if (typeof window === 'undefined') return 0;
        const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
        return wishlist.length;
    }

    return data?.products?.length || 0;
}
