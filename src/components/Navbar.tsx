"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import CategoryList from './CategoryList';
import SearchBar from './SearchBar';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
    const { user, logout } = useAuth();

    const [cartCount, setCartCount] = useState(0);
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleStorage = () => {
            const c = JSON.parse(localStorage.getItem('cart') || '[]');
            setCartCount(c.length);
        }

        // Initial load
        handleStorage();

        window.addEventListener('storage', handleStorage);
        const handleScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('storage', handleStorage);
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const handleLogout = async () => {
        await logout();
    };



    return (
        <nav className={`sticky top-0 z-50 transition-all duration-300 ${scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-md'
            : 'bg-white border-b'
            }`}>
            <div className="container flex items-center justify-between h-16 px-4 gap-4">
                {/* Hamburger Menu - Left */}
                <button
                    onClick={() => setMobileMenuOpen(true)}
                    className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                    aria-label="Menu"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>

                {/* Search Bar - Center (visible on both mobile and desktop) */}
                <div className="flex-1 max-w-md md:max-w-2xl mx-4">
                    <SearchBar />
                </div>

                {/* Right Side: Logo + Actions */}
                <div className="flex items-center gap-2 md:gap-4">
                    {/* Logo - Right */}
                    <Link href="/" className="flex-shrink-0">
                        <Image
                            src="/achrilik-logo.png"
                            alt="Achrilik Logo"
                            width={120}
                            height={40}
                            className="h-8 md:h-10 w-auto object-contain"
                            priority
                        />
                    </Link>

                    {/* Account - Hidden on Mobile */}
                    {user ? (
                        <Link href="/profile" className="hidden lg:flex p-2 text-gray-700 hover:text-[#006233] transition-colors relative group">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </Link>
                    ) : (
                        <div className="hidden lg:flex items-center gap-3">
                            <Link href="/login" className="text-sm font-bold text-gray-700 hover:text-[#006233]">
                                Connexion
                            </Link>
                            <Link href="/register" className="btn btn-primary text-xs px-4 py-2">
                                S'inscrire
                            </Link>
                        </div>
                    )}

                    {/* Desktop: Devenir Vendeur CTA for BUYERS */}
                    {user && user.role === 'BUYER' && (
                        <Link
                            href="/become-seller"
                            className="hidden lg:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white text-sm font-medium rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-sm"
                        >
                            <span>🚀</span>
                            Devenir Vendeur
                        </Link>
                    )}

                    {/* Cart - Hidden on Mobile */}
                    <Link href="/cart" className="hidden lg:flex p-2 text-gray-700 hover:text-[#006233] transition-colors relative">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        {cartCount > 0 && (
                            <span className="absolute top-0 right-0 w-5 h-5 bg-[#D21034] text-white text-[10px] font-bold flex items-center justify-center rounded-full ring-2 ring-white animate-scale-in">
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
                                            {user.role === 'ADMIN' && (
                                                <Link
                                                    href="/admin"
                                                    onClick={() => setMobileMenuOpen(false)}
                                                    className="block px-3 py-2 text-base font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                                                >
                                                    👑 Dashboard Admin
                                                </Link>
                                            )}
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
                                {/* "Devenir Vendeur" for BUYERS (mobile) */}
                                {user && user.role === 'BUYER' && (
                                    <div className="mb-6">
                                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">Vendre</h3>
                                        <Link
                                            href="/become-seller"
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-green-600 to-green-700 text-white font-bold hover:from-green-700 hover:to-green-800 transition-all shadow-md"
                                        >
                                            <span>🏪</span> Ouvrir ma boutique
                                        </Link>
                                    </div>
                                )}

                                {/* Separator */}
                                <div className="border-t border-gray-100"></div>

                                {/* Mobile Categories */}
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">Explorer</h3>
                                <CategoryList variant="mobile" onNavigate={() => setMobileMenuOpen(false)} />
                            </div>
                        </div>
                    </div>
                </>
            )}
        </nav>
    );
}
