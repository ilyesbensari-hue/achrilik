"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface SellerDashboardClientProps {
    initialUser: any;
}

export default function SellerDashboardClient({ initialUser }: SellerDashboardClientProps) {
    const [store, setStore] = useState<any>(null);
    const [stats, setStats] = useState({
        totalProducts: 0,
        activeProducts: 0,
        pendingOrders: 0,
        totalOrders: 0,
        totalRevenue: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Fetch seller's store
                const storesRes = await fetch('/api/stores');
                const stores = await storesRes.json();
                const myStore = stores.find((s: any) => s.ownerId === initialUser.id);

                if (myStore) {
                    setStore(myStore);

                    // 2. Fetch products count
                    const productsRes = await fetch(`/api/products?storeId=${myStore.id}`);
                    const products = await productsRes.json();
                    const activeProducts = products.filter((p: any) => p.isActive).length;

                    // 3. Fetch orders
                    const ordersRes = await fetch(`/api/orders?storeId=${myStore.id}`);
                    const orders = await ordersRes.json();

                    const pendingOrders = orders.filter((o: any) =>
                        o.status === 'PENDING' || o.status === 'CONFIRMED'
                    ).length;

                    // Calculate total revenue from delivered orders
                    const totalRevenue = orders
                        .filter((o: any) => o.status === 'DELIVERED')
                        .reduce((sum: number, o: any) => sum + o.total, 0);

                    setStats({
                        totalProducts: products.length,
                        activeProducts,
                        pendingOrders,
                        totalOrders: orders.length,
                        totalRevenue
                    });
                }
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [initialUser.id]);

    if (loading) {
        return (
            <div className="container py-20 text-center">
                <div className="text-4xl mb-4">⏳</div>
                <p className="text-gray-600">Chargement de votre boutique...</p>
            </div>
        );
    }

    if (!store) {
        return (
            <div className="container py-20 text-center">
                <div className="text-4xl mb-4">🏪</div>
                <h1 className="text-3xl font-bold mb-4">Aucune boutique trouvée</h1>
                <p className="text-gray-600 mb-6">Vous devez créer une boutique pour accéder au dashboard vendeur.</p>
                <Link href="/become-seller" className="btn btn-primary">
                    Créer ma boutique
                </Link>
            </div>
        );
    }

    return (
        <div className="container py-10">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3">
                            <span>🏪</span>
                            {store.name}
                        </h1>
                        <p className="text-gray-600 mt-1">
                            📍 {store.city} • {store.address}
                        </p>
                    </div>
                    <Link href="/profile" className="btn btn-outline">
                        ← Retour au profil
                    </Link>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="card p-6 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-3xl">📦</span>
                        <span className="text-xs font-bold text-blue-600 uppercase">Produits</span>
                    </div>
                    <p className="text-3xl font-bold text-blue-900">{stats.activeProducts}</p>
                    <p className="text-xs text-blue-700 mt-1">
                        {stats.totalProducts} au total
                    </p>
                </div>

                <div className="card p-6 bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-3xl">⏳</span>
                        <span className="text-xs font-bold text-orange-600 uppercase">En attente</span>
                    </div>
                    <p className="text-3xl font-bold text-orange-900">{stats.pendingOrders}</p>
                    <p className="text-xs text-orange-700 mt-1">
                        Commandes à traiter
                    </p>
                </div>

                <div className="card p-6 bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-3xl">📊</span>
                        <span className="text-xs font-bold text-green-600 uppercase">Commandes</span>
                    </div>
                    <p className="text-3xl font-bold text-green-900">{stats.totalOrders}</p>
                    <p className="text-xs text-green-700 mt-1">
                        Total reçues
                    </p>
                </div>

                <div className="card p-6 bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-3xl">💰</span>
                        <span className="text-xs font-bold text-purple-600 uppercase">Revenus</span>
                    </div>
                    <p className="text-3xl font-bold text-purple-900">
                        {stats.totalRevenue.toLocaleString()} DA
                    </p>
                    <p className="text-xs text-purple-700 mt-1">
                        Commandes livrées
                    </p>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Manage Products */}
                <Link href="/sell" className="card p-8 bg-white hover:shadow-xl transition-shadow group">
                    <div className="flex items-start gap-4">
                        <div className="text-5xl group-hover:scale-110 transition-transform">
                            🛍️
                        </div>
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold mb-2 group-hover:text-green-600 transition-colors">
                                Gérer mes produits
                            </h2>
                            <p className="text-gray-600 mb-4">
                                Ajoutez, modifiez ou supprimez vos produits. Gérez votre catalogue.
                            </p>
                            <div className="flex items-center gap-2 text-green-600 font-medium">
                                <span>Accéder aux produits</span>
                                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </Link>

                {/* Manage Orders */}
                <Link href="/sell/orders" className="card p-8 bg-white hover:shadow-xl transition-shadow group">
                    <div className="flex items-start gap-4">
                        <div className="text-5xl group-hover:scale-110 transition-transform">
                            📦
                        </div>
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold mb-2 group-hover:text-green-600 transition-colors">
                                Gérer mes commandes
                            </h2>
                            <p className="text-gray-600 mb-4">
                                Consultez et traitez les commandes reçues. Suivez leur statut.
                            </p>
                            <div className="flex items-center gap-2 text-green-600 font-medium">
                                <span>Accéder aux commandes</span>
                                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                            {stats.pendingOrders > 0 && (
                                <div className="mt-3 inline-block px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-bold">
                                    {stats.pendingOrders} en attente
                                </div>
                            )}
                        </div>
                    </div>
                </Link>
            </div>

            {/* Info Banner */}
            <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200">
                <div className="flex items-start gap-4">
                    <span className="text-3xl">💡</span>
                    <div>
                        <h3 className="font-bold text-lg mb-2">Bienvenue sur votre espace vendeur !</h3>
                        <p className="text-gray-700 text-sm">
                            Gérez facilement votre boutique en ligne. Ajoutez des produits, suivez vos commandes et développez votre activité sur Achrilik.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
