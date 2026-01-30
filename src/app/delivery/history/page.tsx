"use client";

import { useEffect, useState } from 'react';

interface DeliveryHistory {
    id: string;
    trackingNumber: string;
    status: string;
    codAmount: number;
    deliveryFee: number;
    deliveredAt: string;
    customerName: string;
}

export default function DeliveryHistoryPage() {
    const [deliveries, setDeliveries] = useState<DeliveryHistory[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'delivered' | 'failed'>('all');

    useEffect(() => {
        fetchHistory();
    }, [filter]);

    const fetchHistory = async () => {
        try {
            const res = await fetch(`/api/delivery/history?filter=${filter}`);
            if (res.ok) {
                const data = await res.json();
                setDeliveries(data.deliveries || []);
            }
        } catch (error) {
            console.error('Error fetching history:', error);
        } finally {
            setLoading(false);
        }
    };

    const totalEarnings = deliveries.reduce((sum, d) => sum + (d.deliveryFee || 0), 0);

    if (loading) {
        return <div className="text-center py-12">Chargement...</div>;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Historique des livraisons</h1>

            {/* Filters */}
            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'all'
                            ? 'bg-orange-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    Toutes
                </button>
                <button
                    onClick={() => setFilter('delivered')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'delivered'
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    Livrées
                </button>
                <button
                    onClick={() => setFilter('failed')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'failed'
                            ? 'bg-red-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    Échecs
                </button>
            </div>

            {/* Summary */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 mb-6 border border-green-100">
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-sm text-gray-600 mb-1">Total des gains (période affichée)</p>
                        <p className="text-3xl font-bold text-green-600">
                            {totalEarnings.toLocaleString()} DA
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-600 mb-1">Livraisons</p>
                        <p className="text-3xl font-bold text-gray-900">{deliveries.length}</p>
                    </div>
                </div>
            </div>

            {/* History Table */}
            {deliveries.length > 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Tracking
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Client
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    COD
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Frais
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Statut
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {deliveries.map((delivery) => (
                                <tr key={delivery.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <p className="font-medium text-gray-900">
                                            #{delivery.trackingNumber}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-gray-900">{delivery.customerName}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-medium text-gray-900">
                                            {delivery.codAmount.toLocaleString()} DA
                                        </p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-medium text-green-600">
                                            +{delivery.deliveryFee.toLocaleString()} DA
                                        </p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-gray-600">
                                            {new Date(delivery.deliveredAt).toLocaleDateString('fr-FR')}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${delivery.status === 'DELIVERED'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-red-100 text-red-700'
                                            }`}>
                                            {delivery.status === 'DELIVERED' ? '✅ Livrée' : '❌ Échec'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                    <div className="text-6xl mb-4">📋</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Aucun historique
                    </h3>
                    <p className="text-sm text-gray-500">
                        Vos livraisons terminées apparaîtront ici
                    </p>
                </div>
            )}
        </div>
    );
}
