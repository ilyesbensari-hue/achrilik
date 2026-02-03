"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface DeliveryDashboardClientProps {
    initialUser: any;
}

interface Delivery {
    id: string;
    orderId: string;
    status: string;
    pickupAddress: string;
    deliveryAddress: string;
    customerName: string;
    customerPhone: string;
    totalAmount: number;
    createdAt: string;
}

export default function DeliveryDashboardClient({ initialUser }: DeliveryDashboardClientProps) {
    const [deliveries, setDeliveries] = useState<Delivery[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'IN_TRANSIT' | 'DELIVERED'>('ALL');

    useEffect(() => {
        fetchDeliveries();
    }, []);

    const fetchDeliveries = async () => {
        try {
            const res = await fetch(`/api/deliveries?agentId=${initialUser.id}`);
            const data = await res.json();
            setDeliveries(data);
        } catch (error) {
            console.error('Failed to fetch deliveries:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredDeliveries = filter === 'ALL'
        ? deliveries
        : deliveries.filter(d => d.status === filter);

    const stats = {
        total: deliveries.length,
        pending: deliveries.filter(d => d.status === 'PENDING').length,
        inTransit: deliveries.filter(d => d.status === 'IN_TRANSIT').length,
        delivered: deliveries.filter(d => d.status === 'DELIVERED').length
    };

    return (
        <div className="container py-10 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-black text-gray-900">
                        🚚 Tableau de Bord Livreur
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Bienvenue, {initialUser.name}
                    </p>
                </div>
                <Link
                    href="/livreur/history"
                    className="btn btn-outline"
                >
                    📊 Historique
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <div className="text-2xl font-black text-gray-900">{stats.total}</div>
                    <div className="text-sm text-gray-600">Total</div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                    <div className="text-2xl font-black text-yellow-700">{stats.pending}</div>
                    <div className="text-sm text-yellow-600">En attente</div>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                    <div className="text-2xl font-black text-blue-700">{stats.inTransit}</div>
                    <div className="text-sm text-blue-600">En cours</div>
                </div>
                <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                    <div className="text-2xl font-black text-green-700">{stats.delivered}</div>
                    <div className="text-sm text-green-600">Livrées</div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {(['ALL', 'PENDING', 'IN_TRANSIT', 'DELIVERED'] as const).map(status => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={`px-4 py-2 rounded-lg font-bold whitespace-nowrap ${filter === status
                            ? 'bg-[#006233] text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        {status === 'ALL' ? 'Toutes' :
                            status === 'PENDING' ? 'En attente' :
                                status === 'IN_TRANSIT' ? 'En cours' : 'Livrées'}
                    </button>
                ))}
            </div>

            {/* Deliveries List */}
            {loading ? (
                <div className="text-center py-20">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#006233]"></div>
                    <p className="text-gray-600 mt-4">Chargement...</p>
                </div>
            ) : filteredDeliveries.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-2xl">
                    <p className="text-2xl mb-2">📭</p>
                    <p className="text-gray-600 font-bold">Aucune livraison</p>
                    <p className="text-sm text-gray-500">
                        {filter === 'ALL'
                            ? 'Vous n\'avez pas encore de livraisons assignées'
                            : `Aucune livraison ${filter.toLowerCase()}`}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredDeliveries.map(delivery => (
                        <Link
                            key={delivery.id}
                            href={`/livreur/orders/${delivery.orderId}`}
                            className="block bg-white p-6 rounded-xl border border-gray-200 hover:border-[#006233] hover:shadow-md transition-all"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className="font-bold text-lg text-gray-900">
                                        Commande #{delivery.orderId.slice(0, 8)}
                                    </div>
                                    <div className="text-sm text-gray-600 mt-1">
                                        {new Date(delivery.createdAt).toLocaleDateString('fr-FR', {
                                            day: 'numeric',
                                            month: 'long',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${delivery.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                    delivery.status === 'IN_TRANSIT' ? 'bg-blue-100 text-blue-700' :
                                        'bg-green-100 text-green-700'
                                    }`}>
                                    {delivery.status === 'PENDING' ? 'En attente' :
                                        delivery.status === 'IN_TRANSIT' ? 'En cours' : 'Livrée'}
                                </span>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <div className="text-gray-600 mb-1">Client</div>
                                    <div className="font-bold text-gray-900">{delivery.customerName}</div>
                                    <div className="text-gray-600">{delivery.customerPhone}</div>
                                </div>
                                <div>
                                    <div className="text-gray-600 mb-1">Adresse livraison</div>
                                    <div className="font-bold text-gray-900">{delivery.deliveryAddress}</div>

                                    {/* GPS Navigation Button - NOUVEAU */}
                                    {(delivery as any).deliveryLatitude && (delivery as any).deliveryLongitude && (
                                        <a
                                            href={`https://www.google.com/maps/dir/?api=1&destination=${(delivery as any).deliveryLatitude},${(delivery as any).deliveryLongitude}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                            className="inline-flex items-center gap-1 mt-2 px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            🚗 Ouvrir itinéraire
                                        </a>
                                    )}
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                                <div className="font-bold text-[#006233]">
                                    {delivery.totalAmount.toLocaleString()} DA
                                </div>
                                <div className="text-[#006233] font-bold flex items-center gap-1">
                                    Voir détails →
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
