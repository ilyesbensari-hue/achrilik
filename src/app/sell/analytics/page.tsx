"use client";

import { useEffect, useState } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Link from 'next/link';

interface Analytics {
    metrics: {
        today: { orders: number; revenue: number };
        week: { orders: number; revenue: number };
        month: { orders: number; revenue: number };
        total: { orders: number; revenue: number };
    };
    ordersByStatus: {
        pending: number;
        confirmed: number;
        ready: number;
        delivered: number;
        cancelled: number;
    };
    topProducts: Array<{
        id: string;
        title: string;
        image: string;
        quantity: number;
        revenue: number;
    }>;
    salesTrend: Array<{
        date: string;
        sales: number;
        orders: number;
    }>;
    storeRating: {
        average: number;
        count: number;
    };
}

const COLORS = ['#FCD34D', '#34D399', '#60A5FA', '#A78BFA', '#F87171'];

export default function AnalyticsPage() {
    const [analytics, setAnalytics] = useState<Analytics | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        const userSession = localStorage.getItem('user');
        if (userSession) {
            try {
                const user = JSON.parse(userSession);
                if (user.role !== 'SELLER') {
                    window.location.href = '/';
                    return;
                }
                setUserId(user.id);
                fetchAnalytics(user.id);
            } catch (e) {
                console.error('Error parsing user session:', e);
                window.location.href = '/login';
            }
        } else {
            window.location.href = '/login';
        }
    }, []);

    const fetchAnalytics = async (sellerId: string) => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/seller/analytics?sellerId=${sellerId}`);
            const data = await response.json();
            if (data.success) {
                setAnalytics(data.analytics);
            }
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="container mx-auto px-4 py-12">
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#006233]"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!analytics) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="container mx-auto px-4 py-12">
                    <div className="text-center">
                        <p className="text-gray-600">Impossible de charger les analytics</p>
                    </div>
                </div>
            </div>
        );
    }

    // Prepare pie chart data
    const statusData = [
        { name: 'En attente', value: analytics.ordersByStatus.pending, color: COLORS[0] },
        { name: 'Confirmé', value: analytics.ordersByStatus.confirmed, color: COLORS[1] },
        { name: 'Prêt', value: analytics.ordersByStatus.ready, color: COLORS[2] },
        { name: 'Livré', value: analytics.ordersByStatus.delivered, color: COLORS[3] },
        { name: 'Annulé', value: analytics.ordersByStatus.cancelled, color: COLORS[4] },
    ].filter(item => item.value > 0);

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-4xl font-bold">📊 Analytics</h1>
                        <Link href="/sell" className="text-[#006233] hover:underline font-medium">
                            ← Retour au dashboard
                        </Link>
                    </div>
                    <p className="text-gray-600">Vue d'ensemble de vos performances</p>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Today */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-semibold text-gray-600 uppercase">Aujourd'hui</h3>
                            <span className="text-2xl">📅</span>
                        </div>
                        <p className="text-3xl font-bold text-gray-900 mb-1">
                            {analytics.metrics.today.revenue.toLocaleString()} DA
                        </p>
                        <p className="text-sm text-gray-500">{analytics.metrics.today.orders} commande(s)</p>
                    </div>

                    {/* Week */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-semibold text-gray-600 uppercase">Cette semaine</h3>
                            <span className="text-2xl">📈</span>
                        </div>
                        <p className="text-3xl font-bold text-gray-900 mb-1">
                            {analytics.metrics.week.revenue.toLocaleString()} DA
                        </p>
                        <p className="text-sm text-gray-500">{analytics.metrics.week.orders} commande(s)</p>
                    </div>

                    {/* Month */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-semibold text-gray-600 uppercase">Ce mois</h3>
                            <span className="text-2xl">📊</span>
                        </div>
                        <p className="text-3xl font-bold text-gray-900 mb-1">
                            {analytics.metrics.month.revenue.toLocaleString()} DA
                        </p>
                        <p className="text-sm text-gray-500">{analytics.metrics.month.orders} commande(s)</p>
                    </div>

                    {/* Rating */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-semibold text-gray-600 uppercase">Note moyenne</h3>
                            <span className="text-2xl">⭐</span>
                        </div>
                        <p className="text-3xl font-bold text-gray-900 mb-1">
                            {analytics.storeRating.average.toFixed(1)}
                        </p>
                        <p className="text-sm text-gray-500">{analytics.storeRating.count} avis</p>
                    </div>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Sales Trend */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h3 className="text-lg font-bold mb-4">Évolution des ventes (7 derniers jours)</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={analytics.salesTrend}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={(value) => new Date(value).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                                />
                                <YAxis />
                                <Tooltip
                                    formatter={(value: number | undefined) => value ? `${value.toLocaleString()} DA` : '0 DA'}
                                    labelFormatter={(label) => new Date(label).toLocaleDateString('fr-FR')}
                                />
                                <Legend />
                                <Line type="monotone" dataKey="sales" stroke="#006233" strokeWidth={2} name="Ventes (DA)" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Orders by Status */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h3 className="text-lg font-bold mb-4">Commandes par statut</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {statusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Products */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="text-lg font-bold mb-4">🏆 Produits les plus vendus</h3>
                    {analytics.topProducts.length > 0 ? (
                        <div className="space-y-4">
                            {analytics.topProducts.map((product, index) => (
                                <div key={product.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                    <div className="flex-shrink-0 w-8 h-8 bg-[#006233] text-white rounded-full flex items-center justify-center font-bold">
                                        {index + 1}
                                    </div>
                                    <img
                                        src={product.image}
                                        alt={product.title}
                                        className="w-16 h-16 object-cover rounded-lg"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-gray-900 truncate">{product.title}</h4>
                                        <p className="text-sm text-gray-600">
                                            {product.quantity} vente(s) • {product.revenue.toLocaleString()} DA
                                        </p>
                                    </div>
                                    <Link
                                        href={`/sell/products/${product.id}/analytics`}
                                        className="text-[#006233] hover:underline text-sm font-medium"
                                    >
                                        Voir →
                                    </Link>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-8">Aucune vente pour le moment</p>
                    )}
                </div>
            </div>
        </div>
    );
}
