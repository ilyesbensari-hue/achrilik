
import { useState, useEffect } from 'react';

export function useWishlistCount() {
    const [wishlistCount, setWishlistCount] = useState(0);

    useEffect(() => {
        const updateCount = () => {
            const userSession = localStorage.getItem('user');
            if (userSession) {
                try {
                    const user = JSON.parse(userSession);
                    fetch(`/api/wishlist?userId=${user.id}`)
                        .then(res => res.json())
                        .then(data => {
                            if (data.success) {
                                setWishlistCount(data.products.length);
                            }
                        })
                        .catch(console.error);
                } catch (e) {
                    console.error(e);
                }
            } else {
                const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
                setWishlistCount(wishlist.length);
            }
        };

        // Initial fetch
        updateCount();

        // Listen for updates
        window.addEventListener('wishlistUpdate', updateCount);
        window.addEventListener('storage', updateCount);

        return () => {
            window.removeEventListener('wishlistUpdate', updateCount);
            window.removeEventListener('storage', updateCount);
        };
    }, []);

    return wishlistCount;
}
