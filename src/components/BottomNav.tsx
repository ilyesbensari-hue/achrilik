"use client";

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useWishlistCount } from '@/hooks/useWishlistCount';

export default function BottomNav() {
    const pathname = usePathname();
    const [cartCount, setCartCount] = useState(0);
    const wishlistCount = useWishlistCount();

    useEffect(() => {
        // Update counts
        const updateCounts = () => {
            // Cart (Local Storage)
            const cart = JSON.parse(localStorage.getItem('cart') || '[]');
            setCartCount(cart.length);
        };

        updateCounts();

        // Listeners
        window.addEventListener('storage', updateCounts);

        return () => {
            window.removeEventListener('storage', updateCounts);
        };
    }, []); // Re-check on nav change too

    const isActive = (path: string) => {
        if (path === '/') {
            return pathname === '/';
        }
        return pathname.startsWith(path);
    };

    const navItems = [
        {
            href: '/',
            label: 'Accueil',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            ),
        },
        {
            href: '/categories',
            label: 'Catégories',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
            ),
        },
        {
            href: '/wishlist',
            label: 'Wishlist',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
            ),
            badge: wishlistCount,
        },
        {
            href: '/profile',
            label: 'Profil',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            ),
        },
        {
            href: '/cart',
            label: 'Panier',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
            ),
            badge: cartCount,
        },
    ];

    return (
        <nav
            className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 pb-safe"
            style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 0.5rem)' }}
        >
            {/* Navigation Items */}
            <div className="flex items-center justify-around px-2 py-2">
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`flex flex-col items-center justify-center min-w-[60px] py-1 px-2 rounded-lg transition-all ${isActive(item.href)
                            ? 'text-[#006233]'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <div className="relative">
                            {item.icon}
                            {item.badge !== undefined && item.badge > 0 && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#D21034] text-white text-[9px] font-bold flex items-center justify-center rounded-full ring-1 ring-white">
                                    {item.badge > 9 ? '9+' : item.badge}
                                </span>
                            )}
                        </div>
                        <span className={`text-[10px] mt-1 font-medium ${isActive(item.href) ? 'text-[#006233]' : 'text-gray-600'
                            }`}>
                            {item.label}
                        </span>
                    </Link>
                ))}
            </div>

            {/* Logo Footer */}
            <div className="flex justify-center pb-1 pt-1">
                <Image
                    src="/achrilik-logo-final.png"
                    alt="Achrilik"
                    width={80}
                    height={20}
                    className="h-4 w-auto object-contain opacity-30"
                />
            </div>
        </nav>
    );
}
