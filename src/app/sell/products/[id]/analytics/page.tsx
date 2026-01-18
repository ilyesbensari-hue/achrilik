'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

interface ProductAnalytics {
    product: {
        id: string;
        title: string;
        price: number;
        images: string[];
        category?: string;
    };
    metrics: {
        totalSales: number;
        totalRevenue: number;
        averageRating: number;
        reviewCount: number;
        totalStock: number;
    };
    variantPerformance: Array<{
        size: string;
        color: string;
        stock: number;
        sold: number;
        revenue: number;
    }>;
    salesTrend: Array<{
        date: string;
        sales: number;
        revenue: number;
    }>;
    recentReviews: Array<{
        id: string;
        rating: number;
        comment: string;
        userName: string;
        createdAt: string;
    }>;
}

export default function ProductAnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [analytics, setAnalytics] = useState<ProductAnalytics | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, [id]);

    const fetchAnalytics = async () => {
        try {
            const res = await fetch(`/api/products/${id}/analytics`);
            const data = await res.json();

            if (data.success) {
                setAnalytics(data.analytics);
            }
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#006233] mx-auto"></div>
                    <p className="mt-4 text-gray-600">Chargement des analytics...</p>
                </div>
            </div>
        );
    }

    if (!analytics) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-xl text-gray-600">Produit introuvable</p>
                    <Link href="/sell/analytics" className="mt-4 inline-block text-[#006233] hover:underline">
                        ← Retour au dashboard
                    </Link>
                </div>
            </div>
        );
    }

    const chartData = {
        labels: analytics.salesTrend.map(d => new Date(d.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })),
        datasets: [
            {
                label: 'Ventes (unités)',
                data: analytics.salesTrend.map(d => d.sales),
                borderColor: '#006233',
                backgroundColor: 'rgba(0, 98, 51, 0.1)',
                tension: 0.4
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: 'Évolution des ventes (30 derniers jours)'
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1
                }
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <Link href="/sell/analytics" className="text-[#006233] hover:underline mb-4 inline-block">
                        ← Retour au dashboard
                    </Link>

                    <div className="flex items-start justify-between">
                        <div className="flex gap-6">
                            {analytics.product.images[0] && (
                                <img
                                    src={analytics.product.images[0]}
                                    alt={analytics.product.title}
                                    className="w-32 h-32 object-cover rounded-lg shadow-md"
                                />
                            )}
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                    {analytics.product.title}
                                </h1>
                                <p className="text-2xl font-bold text-[#006233] mb-2">
                                    {analytics.product.price.toLocaleString()} DA
                                </p>
                                {analytics.product.category && (
                                    <span className="inline-block px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm">
                                        {analytics.product.category}
                                    </span>
                                )}
                            </div>
                        </div>

                        <Link
                            href={`/sell/products/${id}/edit`}
                            className="px-6 py-3 bg-[#006233] text-white rounded-lg hover:bg-[#004d28] transition-colors"
                        >
                            ✏️ Modifier le produit
                        </Link>
                    </div>
                </div>

                {/* Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="text-sm text-gray-600 mb-2">Ventes totales</div>
                        <div className="text-3xl font-bold text-gray-900">{analytics.metrics.totalSales}</div>
                        <div className="text-xs text-gray-500 mt-1">unités vendues</div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="text-sm text-gray-600 mb-2">Revenu total</div>
                        <div className="text-3xl font-bold text-[#006233]">{analytics.metrics.totalRevenue.toLocaleString()} DA</div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="text-sm text-gray-600 mb-2">Note moyenne</div>
                        <div className="text-3xl font-bold text-yellow-500">
                            {analytics.metrics.averageRating.toFixed(1)} ⭐
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{analytics.metrics.reviewCount} avis</div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="text-sm text-gray-600 mb-2">Stock total</div>
                        <div className="text-3xl font-bold text-gray-900">{analytics.metrics.totalStock}</div>
                        <div className="text-xs text-gray-500 mt-1">unités disponibles</div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="text-sm text-gray-600 mb-2">Taux de stock</div>
                        <div className="text-3xl font-bold text-blue-600">
                            {analytics.metrics.totalSales > 0
                                ? Math.round((analytics.metrics.totalStock / (analytics.metrics.totalStock + analytics.metrics.totalSales)) * 100)
                                : 100}%
                        </div>
                        <div className="text-xs text-gray-500 mt-1">restant</div>
                    </div>
                </div>

                {/* Sales Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
                    <Line data={chartData} options={chartOptions} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Variant Performance */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Performance par variante</h2>

                        {analytics.variantPerformance.length > 0 ? (
                            <div className="space-y-3">
                                {analytics.variantPerformance.map((variant, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <div className="font-semibold text-gray-900">
                                                {variant.size} - {variant.color}
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                Stock: {variant.stock} unités
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-[#006233]">
                                                {variant.sold} vendus
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                {variant.revenue.toLocaleString()} DA
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center py-8">Aucune vente pour le moment</p>
                        )}
                    </div>

                    {/* Recent Reviews */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Avis récents</h2>

                        {analytics.recentReviews.length > 0 ? (
                            <div className="space-y-4">
                                {analytics.recentReviews.map((review) => (
                                    <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="font-semibold text-gray-900">{review.userName}</div>
                                            <div className="text-yellow-500">
                                                {'⭐'.repeat(review.rating)}
                                            </div>
                                        </div>
                                        {review.comment && (
                                            <p className="text-gray-600 text-sm">{review.comment}</p>
                                        )}
                                        <div className="text-xs text-gray-400 mt-1">
                                            {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center py-8">Aucun avis pour le moment</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
