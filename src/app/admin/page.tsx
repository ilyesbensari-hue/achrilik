"use client";

import { useEffect, useState } from 'react';

interface Stats {
    users: {
        total: number;
        buyers: number;
        sellers: number;
        admins: number;
        newThisWeek: number;
    };
    products: {
        total: number;
        pending: number;
        approved: number;
    };
    orders: {
        total: number;
        today: number;
        thisWeek: number;
        thisMonth: number;
    };
    revenue: {
        total: number;
        thisMonth: number;
        averageOrderValue: number;
    };
    topProducts?: Array<{
        productTitle: string;
        orders: number;
        totalQuantity: number;
        totalRevenue: number;
    }>;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/admin/stats');
            const data = await res.json();
            setStats(data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="text-center py-12">Chargement...</div>;
    }

    if (!stats) {
        return <div className="text-center py-12">Erreur de chargement</div>;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard Admin</h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Utilisateurs */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-gray-600">Utilisateurs</h3>
                        <span className="text-2xl">👥</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{stats.users.total}</p>
                    <p className="text-sm text-gray-500 mt-2">
                        +{stats.users.newThisWeek} cette semaine
                    </p>
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex justify-between text-xs text-gray-600">
                            <span>Acheteurs: {stats.users.buyers}</span>
                            <span>Vendeurs: {stats.users.sellers}</span>
                        </div>
                    </div>
                </div>

                {/* Produits */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-gray-600">Produits</h3>
                        <span className="text-2xl">📦</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{stats.products.total}</p>
                    <p className="text-sm text-gray-500 mt-2">{stats.products.approved} approuvés</p>
                    {stats.products.pending > 0 && (
                        <div className="mt-4 p-2 bg-yellow-50 rounded-lg">
                            <p className="text-xs text-yellow-800 font-medium">
                                ⚠️ {stats.products.pending} en attente de modération
                            </p>
                        </div>
                    )}
                </div>

                {/* Commandes */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-gray-600">Commandes</h3>
                        <span className="text-2xl">🛒</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{stats.orders.total}</p>
                    <p className="text-sm text-gray-500 mt-2">
                        {stats.orders.today} aujourd'hui
                    </p>
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex justify-between text-xs text-gray-600">
                            <span>Semaine: {stats.orders.thisWeek}</span>
                            <span>Mois: {stats.orders.thisMonth}</span>
                        </div>
                    </div>
                </div>

                {/* Revenus */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-gray-600">Revenus</h3>
                        <span className="text-2xl">💰</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">
                        {stats.revenue.total.toLocaleString()} DA
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                        {stats.revenue.thisMonth.toLocaleString()} DA ce mois
                    </p>
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-xs text-gray-600">
                            Panier moyen: {Math.round(stats.revenue.averageOrderValue).toLocaleString()} DA
                        </p>
                    </div>
                </div>
            </div>

            {/* Top Products */}
            {stats.topProducts && stats.topProducts.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">Top Produits</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produit</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commandes</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantité</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenus</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {stats.topProducts.slice(0, 10).map((product, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm text-gray-900">{product.productTitle}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{product.orders}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{product.totalQuantity}</td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                            {product.totalRevenue.toLocaleString()} DA
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions Rapides</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <a
                        href="/admin/users"
                        className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all"
                    >
                        <span className="text-2xl">👥</span>
                        <div>
                            <p className="font-medium text-gray-900">Gérer Utilisateurs</p>
                            <p className="text-sm text-gray-500">Voir tous les utilisateurs</p>
                        </div>
                    </a>
                    <a
                        href="/admin/products"
                        className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all"
                    >
                        <span className="text-2xl">📦</span>
                        <div>
                            <p className="font-medium text-gray-900">Modérer Produits</p>
                            <p className="text-sm text-gray-500">Approuver/Rejeter</p>
                        </div>
                    </a>
                    <a
                        href="/admin/logs"
                        className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border- indigo-500 hover:bg-indigo-50 transition-all"
                    >
                        <span className="text-2xl">📋</span>
                        <div>
                            <p className="font-medium text-gray-900">Logs d'Actions</p>
                            <p className="text-sm text-gray-500">Historique admin</p>
                        </div>
                    </a>
                    <a
                        href="/admin/settings"
                        className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all"
                    >
                        <span className="text-2xl">⚙️</span>
                        <div>
                            <p className="font-medium text-gray-900">Paramètres</p>
                            <p className="text-sm text-gray-500">Configuration système</p>
                        </div>
                    </a>
                </div>
            </div>
        </div>
    );
}
