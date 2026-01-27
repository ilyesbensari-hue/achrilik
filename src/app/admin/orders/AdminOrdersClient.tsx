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
    shippingAddress?: string | null;
    shippingCity?: string | null;
    shippingPhone?: string | null;
    shippingName?: string | null;
    storeAddress?: string | null;
    storeCity?: string | null;
    storeName?: string | null;
    trackingNumber?: string | null;
    notes?: string | null;
    user: {
        name: string | null;
        email: string;
        phone?: string | null;
    };
    store?: {
        id: string;
        name: string;
        address?: string | null;
        city?: string | null;
    } | null;
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

export default function AdminOrdersClient() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [stats, setStats] = useState<Record<string, number>>({});
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

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
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produits</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Adresses</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                                        Chargement...
                                    </td>
                                </tr>
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                                        Aucune commande trouvée
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order) => (
                                    <>
                                        <tr key={order.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-4 text-sm text-gray-900">
                                                #{order.id.slice(-8)}
                                            </td>
                                            <td className="px-4 py-4">
                                                <p className="font-medium text-gray-900">{order.user.name || 'Sans nom'}</p>
                                                <p className="text-xs text-gray-500">{order.user.email}</p>
                                                {order.user.phone && <p className="text-xs text-gray-500">📞 {order.user.phone}</p>}
                                            </td>
                                            <td className="px-4 py-4 text-sm text-gray-900">
                                                {order.items.length} article{order.items.length > 1 ? 's' : ''}
                                            </td>
                                            <td className="px-4 py-4 text-xs">
                                                {order.deliveryType === 'DELIVERY' ? (
                                                    <div className="space-y-1">
                                                        {order.storeAddress ? (
                                                            <div className="text-gray-600">
                                                                <span className="font-medium">📍 Départ:</span>
                                                                <br />{order.storeName || 'Magasin'}
                                                                <br />{order.storeAddress}, {order.storeCity}
                                                            </div>
                                                        ) : (
                                                            <div className="text-gray-400">Adresse départ N/A</div>
                                                        )}
                                                        <div className="h-px bg-gray-200 my-1"></div>
                                                        {order.shippingAddress ? (
                                                            <div className="text-gray-600">
                                                                <span className="font-medium">🏠 Arrivée:</span>
                                                                <br />{order.shippingName || order.user.name}
                                                                <br />{order.shippingAddress}, {order.shippingCity}
                                                                {order.shippingPhone && <><br />📞 {order.shippingPhone}</>}
                                                            </div>
                                                        ) : (
                                                            <div className="text-gray-400">Adresse arrivée N/A</div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="text-gray-600">
                                                        <span className="font-medium">📦 Click & Collect</span>
                                                        {order.storeAddress && (
                                                            <>
                                                                <br />{order.storeName}
                                                                <br />{order.storeAddress}, {order.storeCity}
                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-4 text-sm font-semibold text-gray-900">
                                                {order.total.toLocaleString()} DA
                                            </td>
                                            <td className="px-4 py-4 text-xs text-gray-600">
                                                <div>{order.paymentMethod === 'CASH' ? '💵 Espèces' : order.paymentMethod}</div>
                                                <div className="text-gray-500 mt-1">
                                                    {order.deliveryType === 'DELIVERY' ? '🚚 Livraison' : '📦 C&C'}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${STATUS_COLORS[order.status]}`}>
                                                    {STATUS_LABELS[order.status] || order.status}
                                                </span>
                                                {order.trackingNumber && (
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        🔍 {order.trackingNumber}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-4 text-sm text-gray-500">
                                                {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                                            </td>
                                            <td className="px-4 py-4">
                                                <button
                                                    onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                                                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                                                >
                                                    {expandedOrderId === order.id ? '▲ Masquer' : '▼ Détails'}
                                                </button>
                                                <button
                                                    onClick={async (e) => {
                                                        e.stopPropagation();
                                                        if (!confirm('Supprimer cette commande définitivement ?')) return;
                                                        try {
                                                            const res = await fetch(`/api/admin/orders/${order.id}`, { method: 'DELETE' });
                                                            if (res.ok) {
                                                                fetchOrders();
                                                                alert('Commande supprimée');
                                                            } else {
                                                                alert('Erreur lors de la suppression');
                                                            }
                                                        } catch (err) { console.error(err); }
                                                    }}
                                                    className="ml-4 text-red-600 hover:text-red-800 text-sm font-medium"
                                                >
                                                    🗑️
                                                </button>
                                            </td>
                                        </tr>
                                        {expandedOrderId === order.id && (
                                            <tr>
                                                <td colSpan={9} className="px-4 py-4 bg-gray-50">
                                                    <div className="space-y-4">
                                                        <h4 className="font-semibold text-gray-900">Détails de la commande</h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div>
                                                                <h5 className="font-medium text-gray-700 mb-2">Produits ({order.items.length})</h5>
                                                                <div className="space-y-2">
                                                                    {order.items.map((item, idx) => {
                                                                        const images = item.variant.product.images.split(',');
                                                                        return (
                                                                            <div key={idx} className="flex items-center gap-3 p-2 bg-white rounded-lg">
                                                                                <img
                                                                                    src={images[0]}
                                                                                    alt={item.variant.product.title}
                                                                                    className="w-16 h-16 object-cover rounded"
                                                                                />
                                                                                <div className="flex-1">
                                                                                    <p className="font-medium text-sm">{item.variant.product.title}</p>
                                                                                    <p className="text-xs text-gray-500">
                                                                                        Taille: {item.variant.size} | Couleur: {item.variant.color}
                                                                                    </p>
                                                                                    <p className="text-xs text-gray-600">
                                                                                        Quantité: {item.quantity} × {item.price.toLocaleString()} DA
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                            {order.notes && (
                                                                <div>
                                                                    <h5 className="font-medium text-gray-700 mb-2">Notes</h5>
                                                                    <p className="text-sm text-gray-600 p-3 bg-white rounded-lg">{order.notes}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
