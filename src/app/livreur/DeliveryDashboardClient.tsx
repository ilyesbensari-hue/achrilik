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

        // Auto-refresh every 15 seconds
        const interval = setInterval(() => {
            fetchDeliveries();
        }, 15000);

        return () => clearInterval(interval);
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

    // Helper: Extract unique stores from delivery items
    const getUniqueStores = (items: any[]) => {
        const storesMap = new Map();
        items?.forEach(item => {
            const storeId = item.storeId; // Use actual store ID from item
            if (storeId && !storesMap.has(storeId)) {
                storesMap.set(storeId, true);
            }
        });
        return storesMap.size || 1; // Default to 1 if can't determine
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
                <div className="space-y-3">
                    {filteredDeliveries.map(delivery => {
                        const pickupCount = getUniqueStores(delivery.items);
                        const pickupBadgeColor = pickupCount === 1
                            ? 'bg-green-500'
                            : pickupCount === 2
                                ? 'bg-orange-500'
                                : 'bg-red-500';

                        return (
                            <Link
                                key={delivery.id}
                                href={`/livreur/orders/${delivery.id}`}
                                className="block bg-white border-2 border-gray-100 rounded-2xl p-4 hover:shadow-xl hover:border-gray-200 transition-all active:scale-[0.98]"
                            >
                                {/* Compact Header */}
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="font-mono text-base font-black text-gray-900">
                                                #{delivery.orderId.slice(-6).toUpperCase()}
                                            </div>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${delivery.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                                delivery.status === 'IN_TRANSIT' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-green-100 text-green-700'
                                                }`}>
                                                {delivery.status === 'PENDING' ? 'En attente' :
                                                    delivery.status === 'IN_TRANSIT' ? 'En cours' : 'Livrée'}
                                            </span>
                                        </div>
                                        <div className="text-[11px] text-gray-500">
                                            {new Date(delivery.createdAt).toLocaleDateString('fr-FR', {
                                                day: 'numeric',
                                                month: 'short',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </div>
                                    </div>
                                    {/* Pickup Count Badge */}
                                    <div className={`${pickupBadgeColor} text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md`}>
                                        <span className="text-base">📍</span>
                                        <span className="text-xs font-bold">{pickupCount} Stop{pickupCount > 1 ? 's' : ''}</span>
                                    </div>
                                </div>

                                {/* Compact Points A & B */}
                                <div className="grid grid-cols-2 gap-2 mb-3">
                                    {/* Point A - Pickup */}
                                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-3">
                                        <div className="flex items-center gap-1.5 mb-2">
                                            <span className="text-lg">📦</span>
                                            <span className="text-[10px] font-bold text-green-700 uppercase">Point A</span>
                                        </div>
                                        <div className="space-y-1.5">
                                            <div className="font-bold text-sm text-gray-900 line-clamp-1">{delivery.storeName}</div>
                                            <div className="text-[11px] text-gray-600 line-clamp-2">{delivery.pickupAddress}</div>
                                            {delivery.storePhone && (
                                                <a
                                                    href={`tel:${delivery.storePhone}`}
                                                    className="text-[11px] font-semibold text-green-700 hover:underline flex items-center gap-1"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    📞 <span className="line-clamp-1">{delivery.storePhone}</span>
                                                </a>
                                            )}
                                            {delivery.storeLatitude && delivery.storeLongitude && (
                                                <a
                                                    href={`https://www.google.com/maps/dir/?api=1&destination=${delivery.storeLatitude},${delivery.storeLongitude}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="inline-flex items-center gap-1 mt-1 px-2 py-1 bg-green-600 text-white text-[10px] font-bold rounded-md hover:bg-green-700"
                                                >
                                                    🗺️ GPS
                                                </a>
                                            )}
                                        </div>
                                    </div>

                                    {/* Point B - Delivery */}
                                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-3">
                                        <div className="flex items-center gap-1.5 mb-2">
                                            <span className="text-lg">🚚</span>
                                            <span className="text-[10px] font-bold text-blue-700 uppercase">Point B</span>
                                        </div>
                                        <div className="space-y-1.5">
                                            <div className="font-bold text-sm text-gray-900 line-clamp-1">{delivery.customerName}</div>
                                            <div className="text-[11px] text-gray-600 line-clamp-2">{delivery.deliveryAddress}</div>
                                            <a
                                                href={`tel:${delivery.customerPhone}`}
                                                className="text-[11px] font-semibold text-blue-700 hover:underline flex items-center gap-1"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                📞 <span className="line-clamp-1">{delivery.customerPhone}</span>
                                            </a>
                                            {delivery.deliveryLatitude && delivery.deliveryLongitude && (
                                                <a
                                                    href={`https://www.google.com/maps/dir/?api=1&destination=${delivery.deliveryLatitude},${delivery.deliveryLongitude}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="inline-flex items-center gap-1 mt-1 px-2 py-1 bg-blue-600 text-white text-[10px] font-bold rounded-md hover:bg-blue-700"
                                                >
                                                    🗺️ GPS
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Products Summary */}
                                {delivery.items && delivery.items.length > 0 && (
                                    <div className="mb-3 bg-gray-50 rounded-lg p-2.5">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-bold text-gray-700">📋 Produits</span>
                                            <span className="text-[10px] font-bold text-gray-500 bg-white px-2 py-0.5 rounded-full">
                                                {delivery.items.length} articles
                                            </span>
                                        </div>
                                        <div className="flex gap-2 overflow-x-auto pb-1">
                                            {delivery.items.slice(0, 3).map((item, idx) => (
                                                <div key={idx} className="flex-shrink-0 w-14">
                                                    {item.image && (
                                                        <img
                                                            src={item.image}
                                                            alt={item.productName}
                                                            className="w-14 h-14 object-cover rounded-md border border-gray-200"
                                                        />
                                                    )}
                                                </div>
                                            ))}
                                            {delivery.items.length > 3 && (
                                                <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-gray-100 to-gray-200 rounded-md flex items-center justify-center border border-gray-300">
                                                    <span className="text-xs font-bold text-gray-600">+{delivery.items.length - 3}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Footer: Total + Action */}
                                <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
                                    <div className="flex items-baseline gap-1.5">
                                        <span className="text-xl font-black text-[#006233]">
                                            {(delivery.totalAmount || 0).toLocaleString()}
                                        </span>
                                        <span className="text-sm font-bold text-gray-500">DA</span>
                                    </div>
                                    <div className="bg-[#006233] text-white px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-md">
                                        Détails →
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
