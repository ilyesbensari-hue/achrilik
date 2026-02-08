"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

interface User {
    id: string;
    email: string;
    name: string;
    role: 'BUYER' | 'SELLER' | 'ADMIN';
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // Mobile menu state
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // Vérifier que l'utilisateur est admin
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            router.push('/login');
            return;
        }

        const userData = JSON.parse(userStr);
        if (userData.role !== 'ADMIN') {
            router.push('/');
            return;
        }

        setUser(userData);
        setLoading(false);
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile menu overlay */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Mobile menu toggle button */}
            <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="fixed top-4 left-4 z-50 md:hidden p-2 bg-slate-800 text-white rounded-lg shadow-lg"
                aria-label="Toggle menu"
            >
                {mobileMenuOpen ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                )}
            </button>

            {/* Sidebar */}
            <aside className={`
                fixed left-0 top-0 h-full w-64 bg-slate-800 text-white p-6 z-40
                transform transition-transform duration-300 ease-in-out
                ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
                md:translate-x-0
            `}>
                <div className="mb-8">
                    <h1 className="text-2xl font-bold">Admin Panel</h1>
                    <p className="text-sm text-gray-400 mt-1">Achrilik</p>
                </div>

                <nav className="space-y-2 overflow-y-auto max-h-[calc(100vh-200px)]">
                    <Link
                        href="/admin"
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${pathname === '/admin' ? 'bg-slate-700' : 'hover:bg-slate-700'
                            }`}
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        <span>📊</span>
                        <span>Dashboard</span>
                    </Link>
                    <Link
                        href="/admin/users"
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${pathname === '/admin/users' ? 'bg-slate-700' : 'hover:bg-slate-700'
                            }`}
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        <span>👥</span>
                        Utilisateurs
                    </Link>
                    <Link
                        href="/admin/orders"
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${pathname === '/admin/orders' ? 'bg-slate-700' : 'hover:bg-slate-700'
                            }`}
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        <span>🛒</span>
                        Commandes
                    </Link>
                    <Link
                        href="/admin/products"
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${pathname === '/admin/products' ? 'bg-slate-700' : 'hover:bg-slate-700'
                            }`}
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        <span>📦</span>
                        <span>Produits</span>
                    </Link>
                    <Link
                        href="/admin/products/bulk"
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${pathname === '/admin/products/bulk' ? 'bg-slate-700' : 'hover:bg-slate-700'
                            }`}
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        <span>⚡</span>
                        <span>Éditeur Fast</span>
                    </Link>
                    <Link
                        href="/admin/categories"
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${pathname === '/admin/categories' ? 'bg-slate-700' : 'hover:bg-slate-700'
                            }`}
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        <span>🏷️</span>
                        <span>Catégories</span>
                    </Link>
                    <Link
                        href="/admin/banners"
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${pathname === '/admin/banners' ? 'bg-slate-700' : 'hover:bg-slate-700'
                            }`}
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        <span>🎨</span>
                        <span>Banners Promo</span>
                    </Link>
                    <Link
                        href="/admin/vendors"
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${pathname === '/admin/vendors' ? 'bg-slate-700' : 'hover:bg-slate-700'
                            }`}
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        <span>🏪</span>
                        <span>Vendeurs</span>
                    </Link>

                    {/* Delivery Management */}
                    <div className="pt-4 mt-4 border-t border-slate-700">
                        <p className="text-xs text-gray-400 px-4 mb-2">LIVRAISONS</p>
                        <Link
                            href="/admin/delivery-agents"
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${pathname?.startsWith('/admin/delivery-agents') ? 'bg-slate-700' : 'hover:bg-slate-700'
                                }`}
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <span>🚚</span>
                            <span>Prestataires</span>
                        </Link>
                        <Link
                            href="/admin/deliveries"
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${pathname === '/admin/deliveries' ? 'bg-slate-700' : 'hover:bg-slate-700'
                                }`}
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <span>📍</span>
                            <span>Suivi Livraisons</span>
                        </Link>
                        <Link
                            href="/admin/delivery-config"
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${pathname === '/admin/delivery-config' ? 'bg-slate-700' : 'hover:bg-slate-700'
                                }`}
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <span>⚙️</span>
                            <span>Config Livraisons</span>
                        </Link>
                    </div>

                    {/* Analytics - Feature not implemented yet
                    <Link
                        href="/admin/analytics"
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${pathname === '/admin/analytics' ? 'bg-slate-700' : 'hover:bg-slate-700'
                            }`}
                    >
                        <span>📈</span>
                        <span>Analytics</span>
                    </Link>
                    */}
                </nav>

                <div className="absolute bottom-6 left-6 right-6">
                    <div className="border-t border-slate-700 pt-4">
                        <p className="text-sm text-gray-400 mb-2">{user.name}</p>
                        <Link
                            href="/"
                            className="text-sm text-indigo-400 hover:text-indigo-300"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            ← Retour au site
                        </Link>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="md:ml-64 p-4 md:p-8 pt-16 md:pt-8">
                {children}
            </main>
        </div>
    );
}
