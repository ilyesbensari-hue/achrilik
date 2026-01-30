"use client";

import { useEffect, useState } from 'react';

interface DeliveryStats {
    available: number;
    active: number;
    completed: number;
    totalEarnings: number;
    pendingCOD: number;
}

interface Delivery {
    id: string;
    trackingNumber: string;
    status: string;
    codAmount: number;
    pickupAddress: string;
    deliveryAddress: string;
    createdAt: string;
}

export default function DeliveryDashboardPage() {
    const [stats, setStats] = useState<DeliveryStats>({
        available: 0,
        active: 0,
        completed: 0,
        totalEarnings: 0,
        pendingCOD: 0
    });
    const [availableDeliveries, setAvailableDeliveries] = useState<Delivery[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Fetch delivery agent stats and available deliveries
            const res = await fetch('/api/delivery/dashboard');
            if (res.ok) {
                const data = await res.json();
                setStats(data.stats || stats);
                setAvailableDeliveries(data.availableDeliveries || []);
            }
        } catch (error) {
            console.error('Error fetching delivery data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptDelivery = async (deliveryId: string) => {
        if (!confirm('Accepter cette livraison ?')) return;

        try {
            const res = await fetch(`/api/delivery/${deliveryId}/accept`, {
                method: 'POST'
            });

            if (res.ok) {
                alert('✅ Livraison acceptée !');
                fetchData();
            } else {
                alert('❌ Erreur lors de l\'acceptation');
            }
        } catch (error) {
            console.error('Error accepting delivery:', error);
            alert('Erreur technique');
        }
    };

    if (loading) {
        return <div className="text-center py-12">Chargement...</div>;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard Livreur</h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-600">Disponibles</h3>
                        <span className="text-2xl">📦</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{stats.available}</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-600">En cours</h3>
                        <span className="text-2xl">🚚</span>
                    </div>
                    <p className="text-3xl font-bold text-orange-600">{stats.active}</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-600">Livrées</h3>
                        <span className="text-2xl">✅</span>
                    </div>
                    <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-600">Gains totaux</h3>
                        <span className="text-2xl">💰</span>
                    </div>
                    <p className="text-3xl font-bold text-green-600">
                        {stats.totalEarnings.toLocaleString()} DA
                    </p>
                    {stats.pendingCOD > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                            {stats.pendingCOD.toLocaleString()} DA en attente
                        </p>
                    )}
                </div>
            </div>

            {/* Available Deliveries */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Livraisons disponibles
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Acceptez des livraisons dans votre zone
                    </p>
                </div>

                {availableDeliveries.length > 0 ? (
                    <div className="divide-y divide-gray-200">
                        {availableDeliveries.map((delivery) => (
                            <div key={delivery.id} className="p-6 hover:bg-gray-50 transition-colors">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="font-semibold text-gray-900">
                                                #{delivery.trackingNumber}
                                            </h3>
                                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                                                COD: {delivery.codAmount.toLocaleString()} DA
                                            </span>
                                        </div>
                                        <div className="space-y-1 text-sm text-gray-600">
                                            <p>📍 Récupération: {delivery.pickupAddress}</p>
                                            <p>🏠 Livraison: {delivery.deliveryAddress}</p>
                                            <p className="text-xs text-gray-400">
                                                Créée le {new Date(delivery.createdAt).toLocaleDateString('fr-FR')}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleAcceptDelivery(delivery.id)}
                                        className="ml-4 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium transition-colors"
                                    >
                                        Accepter
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-12 text-center text-gray-500">
                        <div className="text-6xl mb-4">📦</div>
                        <p className="text-lg font-medium text-gray-900 mb-2">
                            Aucune livraison disponible
                        </p>
                        <p className="text-sm">
                            De nouvelles livraisons apparaîtront ici dès qu'elles seront assignées
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
