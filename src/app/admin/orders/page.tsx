"use client";

import { useEffect, useState } from 'react';

interface Order {
    id: string;
    userId: string;
    status: string;
    total: number;
    paymentMethod: string;
    deliveryType: string;
    createdAt: string;
    user: {
        name: string | null;
        email: string;
    };
    items: Array<{
        quantity: number;
        price: number;
        variant: {
            size: string;
            color: string;
            product: {
                title: string;
                images: string;
            };
        };
    }>;
}

const STATUS_LABELS: Record<string, string> = {
    PENDING: 'En attente',
    CONFIRMED: 'Confirmée',
    READY: 'Prête',
    DELIVERED: 'Livrée',
    CANCELLED: 'Annulée'
};

const STATUS_COLORS: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    CONFIRMED: 'bg-blue-100 text-blue-800',
    READY: 'bg-purple-100 text-purple-800',
    DELIVERED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800'
};

export default function AdminOrders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [stats, setStats] = useState<Record<string, number>>({});

    useEffect(() => {
        fetchOrders();
    }, [statusFilter]);

    const fetchOrders = async () => {
        try {
            const params = new URLSearchParams();
            if (statusFilter) params.append('status', statusFilter);

            const res = await fetch(`/api/admin/orders?${params}`);
            const data = await res.json();
            setOrders(data.orders);
            setStats(data.stats || {});
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const totalOrders = Object.values(stats).reduce((sum, count) => sum + count, 0);
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Gestion des Commandes</h1>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="text-sm font-medium text-gray-600 mb-2">Total Commandes</div>
                    <div className="text-3xl font-bold text-gray-900">{totalOrders}</div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="text-sm font-medium text-gray-600 mb-2">Revenus Total</div>
                    <div className="text-3xl font-bold text-gray-900">{totalRevenue.toLocaleString()} DA</div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="text-sm font-medium text-gray-600 mb-2">En Attente</div>
                    <div className="text-3xl font-bold text-yellow-600">{stats.PENDING || 0}</div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="text-sm font-medium text-gray-600 mb-2">Livrées</div>
                    <div className="text-3xl font-bold text-green-600">{stats.DELIVERED || 0}</div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-6">
                <div className="flex gap-4">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value="">Tous les statuts</option>
                        <option value="PENDING">En attente</option>
                        <option value="CONFIRMED">Confirmées</option>
                        <option value="READY">Prêtes</option>
                        <option value="DELIVERED">Livrées</option>
                        <option value="CANCELLED">Annulées</option>
                    </select>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produits</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paiement</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Livraison</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
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
                        ) : orders.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                                    Aucune commande trouvée
                                </td>
                            </tr>
                        ) : (
                            orders.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        #{order.id.slice(-8)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="font-medium text-gray-900">{order.user.name || 'Sans nom'}</p>
                                        <p className="text-sm text-gray-500">{order.user.email}</p>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        {order.items.length} article{order.items.length > 1 ? 's' : ''}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                                        {order.total.toLocaleString()} DA
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {order.paymentMethod === 'CASH' ? '💵 Espèces' : order.paymentMethod}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {order.deliveryType === 'DELIVERY' ? '🚚 Livraison' : '📦 Click & Collect'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${STATUS_COLORS[order.status]}`}>
                                            {STATUS_LABELS[order.status] || order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
