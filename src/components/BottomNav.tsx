'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Grid, ShoppingCart, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { logger } from '@/lib/logger';

export default function BottomNav() {
    const pathname = usePathname();
    const [cartCount, setCartCount] = useState(0);

    useEffect(() => {
        const updateCounts = () => {
            try {
                const cartStorage = localStorage.getItem('cart');
                logger.log('[BottomNav] Cart raw:', cartStorage);

                if (cartStorage) {
                    const cart = JSON.parse(cartStorage);
                    const count = cart.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
                    logger.log('[BottomNav] Calculated count:', count);
                    setCartCount(count);
                } else {
                    setCartCount(0);
                }
            } catch (error) {
                logger.error('[BottomNav] Error:', error);
                setCartCount(0);
            }
        };

        // Initial
        updateCounts();

        // Events
        window.addEventListener('cart-updated', updateCounts);
        window.addEventListener('storage', updateCounts);

        // Polling 500ms
        const interval = setInterval(updateCounts, 500);

        return () => {
            window.removeEventListener('cart-updated', updateCounts);
            window.removeEventListener('storage', updateCounts);
            clearInterval(interval);
        };
    }, []);

    const navItems = [
        { name: 'Accueil', href: '/', icon: Home },
        { name: 'Catégories', href: '/categories', icon: Grid },
        { name: 'Panier', href: '/cart', icon: ShoppingCart, count: cartCount },
        { name: 'Profil', href: '/profile', icon: User },
    ];

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50 pb-safe">
            <div className="flex justify-around items-center h-16">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive ? 'text-[#C62828]' : 'text-gray-400'
                                }`}
                        >
                            <div className="relative">
                                <item.icon
                                    className={`h-6 w-6 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`}
                                />
                                {item.count && item.count > 0 ? (
                                    <span className="absolute -top-1 -right-1 bg-[#C62828] text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full border border-white">
                                        {item.count}
                                    </span>
                                ) : null}
                            </div>
                            <span className="text-[10px] font-medium">{item.name}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
