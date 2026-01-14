"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import CategoryList from './CategoryList';

interface User {
    id: string;
    email: string;
    name: string;
    role: 'BUYER' | 'SELLER';
}

export default function Navbar() {
    const [cartCount, setCartCount] = useState(0);
    const [scrolled, setScrolled] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        // Check for user session
        const userSession = localStorage.getItem('user');
        if (userSession) {
            try {
                setUser(JSON.parse(userSession));
            } catch (e) {
                localStorage.removeItem('user');
            }
        }

        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        setCartCount(cart.length);

        const handleStorage = () => {
            const c = JSON.parse(localStorage.getItem('cart') || '[]');
            setCartCount(c.length);

            // Check for user changes
            const u = localStorage.getItem('user');
            if (u) {
                try {
                    setUser(JSON.parse(u));
                } catch (e) {
                    setUser(null);
                }
            } else {
                setUser(null);
            }
        }
        window.addEventListener('storage', handleStorage);

        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('storage', handleStorage);
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const handleLogout = () => {
        // Clear new key
        localStorage.removeItem('user');
        // Clear old keys for backwards compatibility
        localStorage.removeItem('userId');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userName');

        setUser(null);

        // Trigger storage event for other components
        window.dispatchEvent(new Event('storage'));

        window.location.href = '/';
    };



    return (
        <nav className={`sticky top-0 z-50 transition-all duration-300 ${scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-md'
            : 'bg-white border-b'
            }`}>
            <div className="container flex items-center justify-between h-16 px-4">
                {/* Mobile Left: Hamburger (Green Square) + Logo */}
                <div className="flex items-center gap-3 lg:hidden">
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="p-2.5 bg-[#006233] text-white rounded-lg hover:bg-[#004d28] transition-colors shadow-sm active:scale-95"
                        aria-label="Menu"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {mobileMenuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                    <Link href="/" className="flex-shrink-0">
                        <Image
                            src="/achrilik-logo.png"
                            alt="Achrilik Logo"
                            width={100}
                            height={40}
                            className="h-8 w-auto object-contain"
                            priority
                        />
                    </Link>
                </div>

                {/* Desktop Logo */}
                <Link href="/" className="hidden lg:flex items-center gap-2 group hover:opacity-80 transition-opacity">
                    <Image
                        src="/achrilik-logo.png"
                        alt="Achrilik Logo"
                        width={150}
                        height={60}
                        className="h-14 w-auto object-contain"
                        priority
                    />
                </Link>

                {/* Desktop Search */}
                <div className="hidden md:block flex-1 max-w-xl mx-8">
                    <form action="/" method="GET" className="relative">
                        <input
                            type="text"
                            name="search"
                            placeholder="Rechercher un produit, une marque..."
                            className="w-full bg-gray-100 border-none rounded-full pl-5 pr-12 py-2.5 text-sm focus:ring-2 focus:ring-[#cce8dd] outline-none transition-all hover:bg-gray-50"
                        />
                        <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-white rounded-full shadow-sm hover:scale-105 transition-transform">
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </button>
                    </form>
                </div>



                {/* Mobile Right: Seller + User + Cart */}
                <div className="flex items-center gap-1 lg:hidden">
                    {/* Seller Icon (Mobile) - REMOVED to save space, moved to menu */}

                    {/* User Icon (Mobile) */}
                    <Link href={user ? "/profile" : "/login"} className="p-2 text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </Link>

                    {/* Cart Icon (Mobile) */}
                    <Link href="/cart" className="relative p-2 text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        {cartCount > 0 && (
                            <span className="absolute top-1 right-0 bg-[#D21034] text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                                {cartCount}
                            </span>
                        )}
                    </Link>
                </div>

                {/* Desktop Actions */}
                <div className="hidden lg:flex items-center gap-4">
                    {/* Show "Espace Vendeur" only if NOT logged in */}
                    {!user && (
                        <Link href="/sell" className="text-sm font-medium hover:text-[#006233] transition-colors border-2 border-[#006233] px-4 py-2 rounded-lg hover:bg-[#e8f5f0] text-[#006233]">
                            Devenir Vendeur
                        </Link>
                    )}

                    {/* Show "Mes Produits" if logged in as SELLER */}
                    {user && user.role === 'SELLER' && (
                        <Link href="/sell" className="text-sm font-medium hover:text-blue-600 transition-colors border-2 border-green-600 px-4 py-2 rounded-lg hover:bg-green-50 text-green-700 border-green-600">
                            📦 Mes Produits
                        </Link>
                    )}

                    {/* Auth buttons */}
                    {user ? (
                        <div className="flex items-center gap-3">
                            <Link href="/profile" className="text-sm text-gray-700 hover:text-[#006233] transition-colors font-medium">👋 {user.name}</Link>
                            <button
                                onClick={handleLogout}
                                className="btn btn-outline text-sm px-4 py-2 h-9"
                            >
                                Déconnexion
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link href="/login" className="text-sm font-semibold hover:text-[#006233] px-3 py-2 transition-colors">
                                Connexion
                            </Link>
                            <Link href="/register" className="btn btn-primary text-sm px-4 py-2 h-9">
                                Inscription
                            </Link>
                        </div>
                    )}

                    <Link href="/cart" className="relative p-2 ml-1 hover:bg-gray-100 rounded-full transition-colors group">
                        <svg className="w-6 h-6 text-gray-700 group-hover:text-[#006233] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        {cartCount > 0 && (
                            <span className="absolute top-0 right-0 bg-[#D21034] text-white text-xs w-5 h-5 flex items-center justify-center rounded-full animate-scale-in border-2 border-white">
                                {cartCount}
                            </span>
                        )}
                    </Link>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="lg:hidden fixed inset-0 z-[60] bg-black/50 transition-opacity"
                        onClick={() => setMobileMenuOpen(false)}
                    />

                    {/* Drawer */}
                    <div className="lg:hidden fixed top-0 bottom-0 left-0 z-[61] w-[85%] max-w-xs bg-white shadow-xl transform transition-transform duration-300 ease-in-out overflow-y-auto overscroll-contain h-[100dvh]">
                        {/* Header for Mobile Menu */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-100 sticky top-0 bg-white z-10">
                            <h3 className="text-lg font-bold text-[#006233]">Menu</h3>
                            <button
                                onClick={() => setMobileMenuOpen(false)}
                                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-4">
                            <div className="space-y-6">
                                {/* Mobile Auth/Actions */}
                                <div>
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">Compte</h3>
                                    {user ? (
                                        <div className="space-y-3">
                                            <Link
                                                href="/profile"
                                                onClick={() => setMobileMenuOpen(false)}
                                                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-[#006233] hover:bg-[#e8f5f0] rounded-lg transition-colors"
                                            >
                                                👋 {user.name} <span className="text-xs text-gray-400 ml-1">(Accéder au profil)</span>
                                            </Link>
                                            <button
                                                onClick={handleLogout}
                                                className="w-full text-left p-3 rounded-xl bg-gray-50 text-red-600 font-medium hover:bg-red-50 transition-colors"
                                            >
                                                Déconnexion
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-3">
                                            <Link
                                                href="/login"
                                                onClick={() => setMobileMenuOpen(false)}
                                                className="flex items-center justify-center p-3 rounded-xl bg-gray-50 text-[#006233] font-medium hover:bg-[#e8f5f0] transition-colors"
                                            >
                                                Connexion
                                            </Link>
                                            <Link
                                                href="/register"
                                                onClick={() => setMobileMenuOpen(false)}
                                                className="flex items-center justify-center p-3 rounded-xl bg-[#006233] text-white font-medium hover:bg-[#004d28] transition-colors"
                                            >
                                                S'inscrire
                                            </Link>
                                        </div>
                                    )}
                                </div>

                                {/* Link to Seller Dashboard ONLY if already seller */}
                                {user && user.role === 'SELLER' && (
                                    <div>
                                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">Vendre</h3>
                                        <Link
                                            href="/sell"
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="flex items-center gap-3 p-3 rounded-xl bg-green-50 text-green-700 font-medium border border-green-100"
                                        >
                                            <span>📦</span> Mes Produits
                                        </Link>
                                    </div>
                                )}
                                {/* "Devenir Vendeur" for mobile viewers (not logged in) */}
                                {!user && (
                                    <div className="mb-6">
                                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">Vendre</h3>
                                        <Link
                                            href="/sell"
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="flex items-center gap-3 p-3 rounded-xl bg-white text-[#006233] font-bold border-2 border-[#006233] hover:bg-[#e8f5f0] transition-colors"
                                        >
                                            <span>💼</span> Devenir Vendeur
                                        </Link>
                                    </div>
                                )}

                                {/* Separator */}
                                <div className="border-t border-gray-100"></div>

                                {/* Mobile Categories */}
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">Explorer</h3>
                                <CategoryList variant="mobile" onNavigate={() => setMobileMenuOpen(false)} />
                            </div>

                            {/* Mobile Search */}
                            <div>
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">Recherche</h3>
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        const form = e.target as HTMLFormElement;
                                        const search = (form.elements.namedItem('search') as HTMLInputElement).value;
                                        if (search.trim()) {
                                            setMobileMenuOpen(false);
                                            window.location.href = `/?search=${encodeURIComponent(search)}`;
                                        }
                                    }}
                                    className="relative"
                                >
                                    <input
                                        type="text"
                                        name="search"
                                        placeholder="Rechercher..."
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-4 pr-10 py-3 text-sm focus:ring-2 focus:ring-[#cce8dd] outline-none transition-all"
                                    />
                                    <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 bg-white rounded-lg shadow-sm">
                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </nav>
    );
}
