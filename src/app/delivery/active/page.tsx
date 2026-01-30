"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface ActiveDelivery {
    id: string;
    trackingNumber: string;
    status: string;
    codAmount: number;
    pickupAddress: string;
    deliveryAddress: string;
    customerName: string;
    customerPhone: string;
    acceptedAt: string;
}

export default function ActiveDeliveriesPage() {
    const [deliveries, setDeliveries] = useState<ActiveDelivery[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchActiveDeliveries();
    }, []);

    const fetchActiveDeliveries = async () => {
        try {
            const res = await fetch('/api/delivery/active');
            if (res.ok) {
                const data = await res.json();
                setDeliveries(data.deliveries || []);
            }
        } catch (error) {
            console.error('Error fetching active deliveries:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (deliveryId: string, newStatus: string) => {
        try {
            const res = await fetch(`/api/delivery/${deliveryId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            if (res.ok) {
                alert(`✅ Statut mis à jour: ${newStatus}`);
                fetchActiveDeliveries();
            } else {
                alert('❌ Erreur lors de la mise à jour');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Erreur technique');
        }
    };

    if (loading) {
        return <div className="text-center py-12">Chargement...</div>;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Livraisons en cours</h1>
                    <p className="text-gray-600 mt-2">{deliveries.length} livraison(s) active(s)</p>
                </div>
                <Link
                    href="/delivery/dashboard"
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                >
                    ← Retour
                </Link>
            </div>

            {deliveries.length > 0 ? (
                <div className="space-y-4">
                    {deliveries.map((delivery) => (
                        <div key={delivery.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                                        #{delivery.trackingNumber}
                                    </h3>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${delivery.status === 'PICKED_UP'
                                            ? 'bg-blue-100 text-blue-700'
                                            : delivery.status === 'IN_TRANSIT'
                                                ? 'bg-orange-100 text-orange-700'
                                                : 'bg-green-100 text-green-700'
                                        }`}>
                                        {delivery.status === 'PICKED_UP' && '📦 Récupéré'}
                                        {delivery.status === 'IN_TRANSIT' && '🚚 En transit'}
                                        {delivery.status === 'OUT_FOR_DELIVERY' && '📍 En cours de livraison'}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-500">COD</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        {delivery.codAmount.toLocaleString()} DA
                                    </p>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4 mb-4">
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Récupération</p>
                                    <p className="text-sm text-gray-900">{delivery.pickupAddress}</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Livraison</p>
                                    <p className="text-sm text-gray-900">{delivery.deliveryAddress}</p>
                                </div>
                            </div>

                            <div className="bg-blue-50 rounded-lg p-4 mb-4">
                                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Client</p>
                                <p className="text-sm font-medium text-gray-900">{delivery.customerName}</p>
                                <p className="text-sm text-gray-600">📞 {delivery.customerPhone}</p>
                            </div>

                            <div className="flex gap-2">
                                {delivery.status === 'ASSIGNED' && (
                                    <button
                                        onClick={() => handleUpdateStatus(delivery.id, 'PICKED_UP')}
                                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                                    >
                                        📦 Marquer comme récupéré
                                    </button>
                                )}
                                {delivery.status === 'PICKED_UP' && (
                                    <button
                                        onClick={() => handleUpdateStatus(delivery.id, 'IN_TRANSIT')}
                                        className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium"
                                    >
                                        🚚 En transit
                                    </button>
                                )}
                                {delivery.status === 'IN_TRANSIT' && (
                                    <button
                                        onClick={() => handleUpdateStatus(delivery.id, 'OUT_FOR_DELIVERY')}
                                        className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
                                    >
                                        📍 En cours de livraison
                                    </button>
                                )}
                                {delivery.status === 'OUT_FOR_DELIVERY' && (
                                    <button
                                        onClick={() => handleUpdateStatus(delivery.id, 'DELIVERED')}
                                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                                    >
                                        ✅ Marquer comme livrée
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                    <div className="text-6xl mb-4">🚚</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Aucune livraison en cours
                    </h3>
                    <p className="text-sm text-gray-500 mb-6">
                        Acceptez des livraisons depuis le dashboard
                    </p>
                    <Link
                        href="/delivery/dashboard"
                        className="inline-block px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium"
                    >
                        Voir les livraisons disponibles
                    </Link>
                </div>
            )}
        </div>
    );
}
