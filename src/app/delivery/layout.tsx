"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

export default function DeliveryLayout({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // Vérifier que l'utilisateur est livreur
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            router.push('/auth/role-select');
            return;
        }

        const userData = JSON.parse(userStr);
        const roles = userData.role?.split(',') || [];

        if (!roles.includes('DELIVERY_AGENT')) {
            router.push('/');
            return;
        }

        setUser(userData);
        setLoading(false);
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('userId');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userMode');
        router.push('/');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-orange-600 to-orange-700 text-white p-6 shadow-xl">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <span>🚚</span> Livreur
                    </h1>
                    <p className="text-sm text-orange-100 mt-1">Achrilik Delivery</p>
                </div>

                <nav className="space-y-2">
                    <Link
                        href="/delivery/dashboard"
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${pathname === '/delivery/dashboard'
                                ? 'bg-white text-orange-600 shadow-md'
                                : 'hover:bg-orange-500'
                            }`}
                    >
                        <span>📦</span>
                        <span>Livraisons disponibles</span>
                    </Link>

                    <Link
                        href="/delivery/active"
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${pathname === '/delivery/active'
                                ? 'bg-white text-orange-600 shadow-md'
                                : 'hover:bg-orange-500'
                            }`}
                    >
                        <span>🚚</span>
                        <span>Mes livraisons en cours</span>
                    </Link>

                    <Link
                        href="/delivery/history"
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${pathname === '/delivery/history'
                                ? 'bg-white text-orange-600 shadow-md'
                                : 'hover:bg-orange-500'
                            }`}
                    >
                        <span>✅</span>
                        <span>Historique</span>
                    </Link>

                    <Link
                        href="/delivery/earnings"
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${pathname === '/delivery/earnings'
                                ? 'bg-white text-orange-600 shadow-md'
                                : 'hover:bg-orange-500'
                            }`}
                    >
                        <span>💰</span>
                        <span>Mes gains</span>
                    </Link>

                    <Link
                        href="/delivery/settings"
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${pathname === '/delivery/settings'
                                ? 'bg-white text-orange-600 shadow-md'
                                : 'hover:bg-orange-500'
                            }`}
                    >
                        <span>⚙️</span>
                        <span>Paramètres</span>
                    </Link>
                </nav>

                <div className="absolute bottom-6 left-6 right-6">
                    <div className="border-t border-orange-500 pt-4">
                        <p className="text-sm text-orange-100 mb-2">{user.name}</p>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 text-sm text-orange-100 hover:text-white transition-colors"
                        >
                            <span>🚪</span>
                            <span>Se déconnecter</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="ml-64 p-8">
                {children}
            </main>
        </div>
    );
}
