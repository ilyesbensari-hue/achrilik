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
    // Pickup (Point A)
    pickupAddress: string;
    storeName: string;
    storeAddress: string;
    storeCity: string;
    storePhone: string;
    storeContact: string;
    storeLatitude: number | null;
    storeLongitude: number | null;
    // Delivery (Point B)
    deliveryAddress: string;
    deliveryWilaya: string;
    customerName: string;
    customerPhone: string;
    deliveryLatitude: number | null;
    deliveryLongitude: number | null;
    // Order details
    totalAmount: number;
    items: Array<{
        productName: string;
        image: string | null;
        size: string;
        color: string;
        quantity: number;
        price: number;
    }>;
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
            // API returns {deliveries, stats}, extract deliveries array
            setDeliveries(data.deliveries || data || []);
        } catch (error) {
            console.error('Failed to fetch deliveries:', error);
            setDeliveries([]); // Set empty array on error
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
                            href={`/livreur/orders/${delivery.id}`}
                            className="block bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
                        >
                            {/* Header: Order ID + Status */}
                            <div className="flex justify-between items-start mb-6 pb-4 border-b border-gray-200">
                                <div>
                                    <div className="text-xs text-gray-500 mb-1">Commande</div>
                                    <div className="font-mono text-sm font-bold text-gray-900">
                                        #{delivery.orderId.slice(0, 8).toUpperCase()}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        {new Date(delivery.createdAt).toLocaleDateString('fr-FR', {
                                            day: 'numeric',
                                            month: 'short',
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

                            {/* 📦 PICKUP - Point A (Magasin) */}
                            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-2xl">📦</span>
                                    <div className="font-bold text-green-800">RÉCUPÉRATION (Point A)</div>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <div>
                                        <div className="text-gray-600 text-xs mb-1">Magasin</div>
                                        <div className="font-bold text-gray-900">{delivery.storeName}</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-600 text-xs mb-1">Adresse pickup</div>
                                        <div className="font-semibold text-gray-900">{delivery.pickupAddress}</div>
                                    </div>
                                    {delivery.storePhone && (
                                        <div>
                                            <div className="text-gray-600 text-xs mb-1">Téléphone magasin</div>
                                            <a href={`tel:${delivery.storePhone}`}
                                                className="font-semibold text-green-700 hover:underline"
                                                onClick={(e) => e.stopPropagation()}>
                                                📞 {delivery.storePhone}
                                            </a>
                                        </div>
                                    )}
                                    {delivery.storeContact && (
                                        <div>
                                            <div className="text-gray-600 text-xs mb-1">Contact vendeur</div>
                                            <div className="text-gray-800">{delivery.storeContact}</div>
                                        </div>
                                    )}
                                    {delivery.storeLatitude && delivery.storeLongitude && (
                                        <a
                                            href={`https://www.google.com/maps/dir/?api=1&destination=${delivery.storeLatitude},${delivery.storeLongitude}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                            className="inline-flex items-center gap-1 mt-2 px-3 py-1.5 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 transition-colors"
                                        >
                                            🗺️ GPS vers magasin
                                        </a>
                                    )}
                                </div>
                            </div>

                            {/* 🚚 DELIVERY - Point B (Client) */}
                            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-2xl">🚚</span>
                                    <div className="font-bold text-blue-800">LIVRAISON (Point B)</div>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <div>
                                        <div className="text-gray-600 text-xs mb-1">Client</div>
                                        <div className="font-bold text-gray-900">{delivery.customerName}</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-600 text-xs mb-1">Téléphone client</div>
                                        <a href={`tel:${delivery.customerPhone}`}
                                            className="font-semibold text-blue-700 hover:underline"
                                            onClick={(e) => e.stopPropagation()}>
                                            📞 {delivery.customerPhone}
                                        </a>
                                    </div>
                                    <div>
                                        <div className="text-gray-600 text-xs mb-1">Adresse livraison</div>
                                        <div className="font-semibold text-gray-900">{delivery.deliveryAddress}</div>
                                        {delivery.deliveryWilaya && (
                                            <div className="text-xs text-gray-600 mt-1">Wilaya: {delivery.deliveryWilaya}</div>
                                        )}
                                    </div>
                                    {delivery.deliveryLatitude && delivery.deliveryLongitude && (
                                        <a
                                            href={`https://www.google.com/maps/dir/?api=1&destination=${delivery.deliveryLatitude},${delivery.deliveryLongitude}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                            className="inline-flex items-center gap-1 mt-2 px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            🗺️ GPS vers client
                                        </a>
                                    )}
                                </div>
                            </div>

                            {/* 📋 PRODUITS À TRANSPORTER */}
                            {delivery.items && delivery.items.length > 0 && (
                                <div className="mb-6">
                                    <div className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                                        <span>📋</span>
                                        Produits ({delivery.items.length})
                                    </div>
                                    <div className="space-y-2">
                                        {delivery.items.map((item, idx) => (
                                            <div key={idx} className="flex gap-3 bg-gray-50 rounded-lg p-3 text-sm">
                                                {item.image && (
                                                    <img
                                                        src={item.image}
                                                        alt={item.productName}
                                                        className="w-16 h-16 object-cover rounded-md"
                                                    />
                                                )}
                                                <div className="flex-1">
                                                    <div className="font-semibold text-gray-900">{item.productName}</div>
                                                    <div className="text-xs text-gray-600 mt-1">
                                                        {item.size && <span className="mr-2">Taille: {item.size}</span>}
                                                        {item.color && <span>Couleur: {item.color}</span>}
                                                    </div>
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        Qté: {item.quantity} × {item.price.toLocaleString()} DA
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* 💰 TOTAL */}
                            <div className="mt-6 pt-4 border-t border-gray-200 flex justify-between items-center">
                                <div className="font-bold text-[#006233] text-xl">
                                    {(delivery.totalAmount || 0).toLocaleString()} DA
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
