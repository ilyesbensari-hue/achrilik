'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Search, ShoppingCart, User } from 'lucide-react';
import Logo from '@/components/ui/Logo';

export default function MobileHeader() {
    const [cartCount, setCartCount] = useState(0);

    useEffect(() => {
        const handleStorage = () => {
            const c = JSON.parse(localStorage.getItem('cart') || '[]');
            setCartCount(c.length);
        };

        handleStorage();
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    return (
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-[0_4px_20px_-12px_rgba(0,0,0,0.1)]">
            <div className="flex items-center justify-between px-4 h-16 gap-4">
                {/* Logo & Bilingual Brand */}
                <Link href="/" className="flex-shrink-0 flex items-center gap-2 group">
                    <div className="relative h-10 w-24 group-active:scale-95 transition-transform">
                        <Logo width={96} height={40} />
                    </div>
                </Link>

                {/* Search Bar - Wider and Cleaner */}
                <Link
                    href="/search"
                    className="flex-1 flex items-center gap-2.5 bg-gray-50 border border-gray-200/60 rounded-full px-4 py-2.5 transition-all hover:bg-gray-100 hover:border-gray-300 active:scale-[0.98] shadow-sm"
                >
                    <Search className="h-4 w-4 text-gray-400 flex-shrink-0" strokeWidth={2} />
                    <span className="text-[13px] text-gray-500 font-medium truncate">Rechercher...</span>
                </Link>

                {/* Icons - Better Spaced */}
                <div className="flex items-center gap-3.5 flex-shrink-0 pl-1">
                    {/* Cart */}
                    <Link href="/cart" className="relative p-2.5 rounded-full hover:bg-gray-50 text-gray-700 active:scale-90 transition-all">
                        <ShoppingCart className="h-[22px] w-[22px]" strokeWidth={1.75} />
                        {cartCount > 0 && (
                            <span className="absolute top-1.5 right-1.5 h-3.5 w-3.5 bg-[#C62828] text-white text-[9px] font-bold flex items-center justify-center rounded-full shadow-sm ring-2 ring-white">
                                {cartCount}
                            </span>
                        )}
                    </Link>

                    {/* Profile */}
                    <Link href="/profile" className="p-2.5 rounded-full hover:bg-gray-50 text-gray-700 active:scale-90 transition-all">
                        <User className="h-[22px] w-[22px]" strokeWidth={1.75} />
                    </Link>
                </div>
            </div>
        </header>
    );
}
