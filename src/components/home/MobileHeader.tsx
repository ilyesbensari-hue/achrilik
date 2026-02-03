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
        <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
            <div className="flex items-center justify-between px-4 h-14 gap-3">
                {/* Logo & Bilingual Brand */}
                <Link href="/" className="flex-shrink-0 flex items-center gap-2 group">
                    <div className="relative h-10 w-24 group-active:scale-95 transition-transform">
                        <Logo width={96} height={40} />
                    </div>
                </Link>

                {/* Search Bar */}
                <Link
                    href="/search"
                    className="flex-1 flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-full px-4 py-2 max-w-md transition-colors hover:bg-gray-100 active:scale-[0.98]"
                >
                    <Search className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span className="text-sm text-gray-400 font-medium">Recherche...</span>
                </Link>

                {/* Icons */}
                <div className="flex items-center gap-3 flex-shrink-0">
                    {/* Cart */}
                    <Link href="/cart" className="relative p-2 rounded-full hover:bg-gray-50 active:scale-90 transition-all">
                        <ShoppingCart className="h-6 w-6 text-gray-800" strokeWidth={1.5} />
                        {cartCount > 0 && (
                            <span className="absolute top-0 right-0 h-4 w-4 bg-[#C62828] text-white text-[10px] font-bold flex items-center justify-center rounded-full shadow-sm ring-2 ring-white">
                                {cartCount}
                            </span>
                        )}
                    </Link>

                    {/* Profile */}
                    <Link href="/profile" className="p-2 rounded-full hover:bg-gray-50 active:scale-90 transition-all">
                        <User className="h-6 w-6 text-gray-800" strokeWidth={1.5} />
                    </Link>
                </div>
            </div>
        </header>
    );
}
