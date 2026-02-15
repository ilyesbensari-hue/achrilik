"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useWishlist } from '@/contexts/WishlistContext';
import Logo from '@/components/ui/Logo';
import CategoryList from './CategoryList';
import SearchBar from './SearchBar';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
    const { user, logout } = useAuth();

    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [cartCount, setCartCount] = useState(0);
    const { wishlistCount } = useWishlist();
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
            <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-4 gap-3">

                {/* --- MOBILE LAYOUT (md:hidden) --- */}
                <div className="flex md:hidden items-center justify-between w-full gap-3">
                    {/* 1. Logo (Left) */}
                    <Link href="/" className="flex-shrink-0">
                        <Logo width={80} height={32} isHeader={true} />
                    </Link>

                    {/* 2. Search (Center) */}
                    <div className="flex-1">
                        <SearchBar />
                    </div>

                    {/* 3. Icons (Right) */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                        {/* Cart */}
                        <Link href="/cart" className="relative p-1 text-gray-700">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 h-3 w-3 bg-[#C62828] rounded-full border border-white"></span>
                            )}
                        </Link>
                    </div>
                </div>


                {/* --- DESKTOP LAYOUT (hidden md:flex) --- */}
                <div className="hidden md:flex items-center justify-between w-full gap-4">
                    {/* Logo */}
                    <Link href="/" className="flex-shrink-0">
                        <Logo width={120} height={40} className="h-10 w-auto" />
                    </Link>

                    {/* Categories Dropdown */}
                    <div className="relative group flex-shrink-0">
                        <button className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-[#006233] font-medium transition-colors">
                            Catégories
                            <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {/* Dropdown Menu */}
                        <div className="absolute left-0 top-full mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                            <CategoryList variant="desktop" />
                        </div>
                    </div>

                    {/* Search - Centered with max width */}
                    <div className="flex-1 flex justify-center px-4">
                        <div className="w-full max-w-2xl">
                            <SearchBar />
                        </div>
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                        {/* Authentication: Login Button or User Dropdown */}
                        {!user ? (
                            /* Login Button for non-authenticated users */
                            <Link
                                href="/login"
                                className="px-4 py-2 text-sm font-medium text-[#006233] border border-[#006233] rounded-lg hover:bg-[#006233] hover:text-white transition-colors"
                            >
                                Connexion
                            </Link>
                        ) : (
                            /* User Dropdown for authenticated users */
                            <div className="relative group">
                                <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                                    <div className="w-8 h-8 rounded-full bg-[#006233] text-white flex items-center justify-center text-sm font-bold">
                                        {user.name[0].toUpperCase()}
                                    </div>
                                    <span className="text-sm font-medium text-gray-700 max-w-[100px] truncate">{user.name}</span>
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {/* User Dropdown Menu */}
                                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2 z-50">
                                    <Link
                                        href="/profile"
                                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                                    >
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        <span className="text-sm font-medium text-gray-700">Mon Profil</span>
                                    </Link>

                                    {user.role === 'SELLER' && (
                                        <Link
                                            href="/sell"
                                            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                                        >
                                            <span className="text-lg">🏪</span>
                                            <span className="text-sm font-medium text-gray-700">Ma Boutique</span>
                                        </Link>
                                    )}

                                    {user.role === 'ADMIN' && (
                                        <Link
                                            href="/admin"
                                            className="flex items-center gap-3 px-4 py-3 bg-purple-50 hover:bg-purple-100 transition-colors"
                                        >
                                            <span className="text-lg">👑</span>
                                            <span className="text-sm font-bold text-purple-700">Admin Panel</span>
                                        </Link>
                                    )}

                                    <div className="border-t border-gray-100 my-2"></div>

                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors text-left"
                                    >
                                        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        <span className="text-sm font-medium text-red-600">Déconnexion</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Wishlist Icon */}
                        <Link href="/wishlist" className="p-2 text-gray-700 hover:text-[#006233] relative transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            {wishlistCount > 0 && (
                                <span className="absolute top-0 right-0 w-5 h-5 bg-[#D21034] text-white text-[10px] font-bold flex items-center justify-center rounded-full ring-2 ring-white">
                                    {wishlistCount}
                                </span>
                            )}
                        </Link>

                        {/* Cart Icon */}
                        <Link href="/cart" className="p-2 text-gray-700 hover:text-[#006233] relative transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            {cartCount > 0 && (
                                <span className="absolute top-0 right-0 w-5 h-5 bg-[#D21034] text-white text-[10px] font-bold flex items-center justify-center rounded-full ring-2 ring-white">
                                    {cartCount}
                                </span>
                            )}
                        </Link>
                    </div>
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
