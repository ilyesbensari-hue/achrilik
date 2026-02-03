'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Grid3x3, ShoppingCart, User, Heart } from 'lucide-react';

export default function BottomNav() {
    const pathname = usePathname();

    const navItems = [
        { href: '/', label: 'Home', icon: Home },
        { href: '/categories', label: 'Catégories', icon: Grid3x3 },
        { href: '/wishlist', label: 'Favoris', icon: Heart }, // Added Wishlist
        { href: '/cart', label: 'Panier', icon: ShoppingCart },
        { href: '/profile', label: 'Profil', icon: User },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 md:hidden">
            <div className="grid grid-cols-5 h-16"> {/* Changed cols to 5 */}
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center justify-center gap-1 transition-colors ${isActive
                                ? 'text-[#C62828]'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            <Icon
                                className="h-5 w-5" // Slightly smaller icon to fit 5 items
                                strokeWidth={isActive ? 2.5 : 2}
                            />
                            <span className={`text-[10px] ${isActive ? 'font-bold' : 'font-medium'}`}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
