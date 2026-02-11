"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getDeliveryStatusLabel, getDeliveryStatusColor } from '@/lib/delivery-helpers';
import { logger } from '@/lib/logger';

export default function DeliveryAgentDetailsPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [agent, setAgent] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchAgentDetails();
    }, [params.id]);

    const fetchAgentDetails = async () => {
        try {
            const res = await fetch(`/api/admin/delivery-agents/${params.id}`);
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Erreur lors du chargement');
            }

            setAgent(data.agent);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async () => {
        try {
            const res = await fetch(`/api/admin/delivery-agents/${params.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isAvailable: !agent.isAvailable })
            });

            if (res.ok) {
                fetchAgentDetails();
            }
        } catch (err) {
            logger.error('Error toggling status:', { err });
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Chargement...</p>
                </div>
            </div>
        );
    }

    if (error || !agent) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 mb-4">{error || 'Prestataire introuvable'}</p>
                    <button
                        onClick={() => router.push('/admin/delivery-agents')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Retour à la liste
                    </button>
                </div>
            </div>
        );
    }

    const getStatusBadgeClass = (status: string) => {
        const color = getDeliveryStatusColor(status);
        const classes: Record<string, string> = {
            gray: 'bg-gray-100 text-gray-700',
            blue: 'bg-blue-50 text-blue-700',
            cyan: 'bg-cyan-50 text-cyan-700',
            yellow: 'bg-yellow-50 text-yellow-700',
            green: 'bg-green-50 text-green-700',
            red: 'bg-red-50 text-red-700'
        };
        return classes[color] || classes.gray;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => router.push('/admin/delivery-agents')}
                        className="text-blue-600 hover:text-blue-700 mb-4 flex items-center gap-2"
                    >
                        ← Retour à la liste
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{agent.name}</h1>
                    <p className="text-gray-600">{agent.email}</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Agent Info */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Basic Info Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Informations</h2>

                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Statut</p>
                                    <span className={`px-3 py-1 rounded text-sm font-medium ${agent.isAvailable
                                            ? 'bg-green-50 text-green-700'
                                            : 'bg-gray-100 text-gray-600'
                                        }`}>
                                        {agent.isAvailable ? '✓ Actif' : '✗ Inactif'}
                                    </span>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Téléphone</p>
                                    <p className="text-gray-900 font-medium">{agent.phone}</p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Wilaya</p>
                                    <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded text-sm font-medium">
                                        {agent.wilaya}
                                    </span>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Véhicule</p>
                                    <p className="text-gray-900 font-medium">
                                        {agent.vehicleType === 'MOTO' && '🏍️ Moto'}
                                        {agent.vehicleType === 'VOITURE' && '🚗 Voiture'}
                                        {agent.vehicleType === 'VELO' && '🚲 Vélo'}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Permis</p>
                                    <p className="text-gray-900 font-mono text-sm">{agent.licenseNumber}</p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-600 mb-1">Membre depuis</p>
                                    <p className="text-gray-900">
                                        {new Date(agent.createdAt).toLocaleDateString('fr-FR')}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <button
                                    onClick={handleToggleStatus}
                                    className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${agent.isAvailable
                                            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            : 'bg-green-600 text-white hover:bg-green-700'
                                        }`}
                                >
                                    {agent.isAvailable ? 'Désactiver' : 'Activer'}
                                </button>
                            </div>
                        </div>

                        {/* Stats Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Statistiques</h2>

                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Total livraisons</span>
                                    <span className="font-bold text-gray-900">{agent.stats.total}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Livrées</span>
                                    <span className="font-bold text-green-600">{agent.stats.delivered}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">En cours</span>
                                    <span className="font-bold text-yellow-600">{agent.stats.inProgress}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Échecs</span>
                                    <span className="font-bold text-red-600">{agent.stats.failed}</span>
                                </div>
                                <div className="pt-3 border-t border-gray-200">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Taux de réussite</span>
                                        <span className="font-bold text-blue-600">{agent.stats.successRate}%</span>
                                    </div>
                                </div>
                                <div className="pt-3 border-t border-gray-200">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">COD collecté</span>
                                        <span className="font-bold text-purple-600">{agent.stats.totalCOD.toLocaleString()} DA</span>
                                    </div>
                                    {agent.stats.pendingCOD > 0 && (
                                        <div className="flex justify-between items-center mt-2">
                                            <span className="text-gray-600 text-sm">COD en attente</span>
                                            <span className="font-medium text-orange-600">{agent.stats.pendingCOD.toLocaleString()} DA</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Deliveries History */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-lg font-bold text-gray-900">Historique des Livraisons</h2>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tracking</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commande</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Adresse</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">COD</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {agent.deliveries.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                                    Aucune livraison
                                                </td>
                                            </tr>
                                        ) : (
                                            agent.deliveries.map((delivery: any) => (
                                                <tr key={delivery.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4">
                                                        <span className="font-mono text-sm font-medium text-blue-600">
                                                            {delivery.trackingNumber}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm">
                                                            <p className="text-gray-900">#{delivery.order.id.slice(0, 8)}</p>
                                                            <p className="text-gray-500">{delivery.order.total.toLocaleString()} DA</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <p className="text-sm text-gray-900 max-w-xs truncate">
                                                            {delivery.deliveryAddress}
                                                        </p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 py-1 rounded text-sm font-medium ${getStatusBadgeClass(delivery.status)}`}>
                                                            {getDeliveryStatusLabel(delivery.status)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {delivery.codAmount > 0 ? (
                                                            <div className="text-sm">
                                                                <p className="text-gray-900 font-medium">{delivery.codAmount.toLocaleString()} DA</p>
                                                                {delivery.codCollected && (
                                                                    <p className="text-green-600 text-xs">✓ Collecté</p>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <span className="text-gray-400 text-sm">-</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-sm text-gray-500">
                                                            {new Date(delivery.createdAt).toLocaleDateString('fr-FR')}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
