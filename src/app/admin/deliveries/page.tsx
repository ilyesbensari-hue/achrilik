"use client";

import { useState, useEffect } from 'react';
import AssignDeliveryModal from '@/components/admin/AssignDeliveryModal';
import { getDeliveryStatusLabel, getDeliveryStatusColor } from '@/lib/delivery-helpers';

export default function DeliveriesPage() {
    const [deliveries, setDeliveries] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [filterStatus, setFilterStatus] = useState('');
    const [filterAgent, setFilterAgent] = useState('');

    useEffect(() => {
        fetchDeliveries();
    }, [filterStatus, filterAgent]);

    const fetchDeliveries = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filterStatus) params.append('status', filterStatus);
            if (filterAgent) params.append('agentId', filterAgent);

            const res = await fetch(`/api/admin/deliveries?${params}`);
            const data = await res.json();
            setDeliveries(data.deliveries || []);
            setStats(data.stats || {});
        } catch (err) {
            console.error('Error fetching deliveries:', err);
        } finally {
            setLoading(false);
        }
    };

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
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion des Livraisons</h1>
                    <p className="text-gray-600">Assignez et suivez toutes les livraisons</p>
                </div>

                {/* Global Stats */}
                {stats && (
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                            <p className="text-sm text-gray-600 mb-1">Total</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                        </div>
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                            <p className="text-sm text-gray-600 mb-1">En attente</p>
                            <p className="text-2xl font-bold text-gray-600">{stats.pending}</p>
                        </div>
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                            <p className="text-sm text-gray-600 mb-1">Assignées</p>
                            <p className="text-2xl font-bold text-blue-600">{stats.assigned}</p>
                        </div>
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                            <p className="text-sm text-gray-600 mb-1">En transit</p>
                            <p className="text-2xl font-bold text-yellow-600">{stats.inTransit}</p>
                        </div>
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                            <p className="text-sm text-gray-600 mb-1">Livrées</p>
                            <p className="text-2xl font-bold text-green-600">{stats.delivered}</p>
                        </div>
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                            <p className="text-sm text-gray-600 mb-1">COD Collecté</p>
                            <p className="text-xl font-bold text-purple-600">{stats.totalCOD?.toLocaleString()} DA</p>
                        </div>
                    </div>
                )}

                {/* Actions & Filters */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                        <div className="flex gap-3">
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Tous les statuts</option>
                                <option value="PENDING">En attente</option>
                                <option value="ASSIGNED">Assignées</option>
                                <option value="ACCEPTED">Acceptées</option>
                                <option value="IN_TRANSIT">En transit</option>
                                <option value="DELIVERED">Livrées</option>
                                <option value="FAILED">Échec</option>
                            </select>
                        </div>

                        <button
                            onClick={() => setShowAssignModal(true)}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
                        >
                            <span>🎯</span>
                            Assigner une Livraison
                        </button>
                    </div>
                </div>

                {/* Deliveries Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tracking</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commande</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prestataire</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Wilaya</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">COD</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                                            Chargement...
                                        </td>
                                    </tr>
                                ) : deliveries.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                                            Aucune livraison trouvée
                                        </td>
                                    </tr>
                                ) : (
                                    deliveries.map(delivery => (
                                        <tr key={delivery.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <span className="font-mono text-sm font-medium text-blue-600">
                                                    {delivery.trackingNumber}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm">
                                                    <p className="text-gray-900">#{delivery.orderId.slice(0, 8)}</p>
                                                    <p className="text-gray-500">{delivery.orderTotal.toLocaleString()} DA</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm">
                                                    <p className="text-gray-900">{delivery.buyerName}</p>
                                                    <p className="text-gray-500">{delivery.buyerPhone}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm">
                                                    <p className="text-gray-900">{delivery.agentName}</p>
                                                    {delivery.agentPhone && (
                                                        <p className="text-gray-500">{delivery.agentPhone}</p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-sm font-medium">
                                                    {delivery.wilaya}
                                                </span>
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

            {/* Assign Modal */}
            <AssignDeliveryModal
                isOpen={showAssignModal}
                onClose={() => setShowAssignModal(false)}
                onSuccess={() => {
                    setShowAssignModal(false);
                    fetchDeliveries();
                }}
            />
        </div>
    );
}
