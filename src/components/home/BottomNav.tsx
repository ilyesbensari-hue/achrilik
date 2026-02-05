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
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-gray-100/50 shadow-[0_-4px_20px_-8px_rgba(0,0,0,0.08)] md:hidden pb-safe">
            <div className="grid grid-cols-5 h-16 relative">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center justify-center gap-1 transition-all duration-300 relative group`}
                        >
                            {/* Active Indicator Pill */}
                            {isActive && (
                                <span className="absolute -top-[1px] w-12 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-100 rounded-b-full shadow-[0_2px_8px_rgba(220,38,38,0.4)]" />
                            )}

                            {/* Icon Container with subtle bounce on active */}
                            <div className={`relative p-1.5 rounded-2xl transition-all duration-300 ${isActive ? '-translate-y-0.5' : 'group-active:scale-90'}`}>
                                <Icon
                                    className={`h-[22px] w-[22px] transition-colors duration-300 ${isActive ? 'text-[#D32F2F]' : 'text-gray-400 group-hover:text-gray-600'}`}
                                    strokeWidth={isActive ? 2.5 : 2}
                                />
                                {isActive && (
                                    <div className="absolute inset-0 bg-red-500/10 rounded-2xl blur-lg scale-150 active-glow" />
                                )}
                            </div>

                            <span className={`text-[10px] transition-all duration-300 tracking-wide ${isActive ? 'font-bold text-[#D32F2F] scale-105' : 'font-medium text-gray-500 scale-100'}`}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>

            {/* Safe Area for iPhone Home Indicator */}
            <div className="h-[env(safe-area-inset-bottom)] bg-white/95 backdrop-blur-xl" />
        </nav>
    );
}
