"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import OrderStatusTimeline from '@/components/OrderStatusTimeline';
import { Truck, PackageCheck, Home, RotateCcw } from 'lucide-react';

type OrderStatus =
    | 'READY_FOR_PICKUP'
    | 'WITH_DELIVERY_AGENT'
    | 'OUT_FOR_DELIVERY'
    | 'DELIVERED'
    | 'RETURNED';

interface Order {
    id: string;
    status: OrderStatus;
    total: number;
    shippingAddress?: string;
    shippingName?: string;
    shippingPhone?: string;
    deliveryLatitude?: number;
    deliveryLongitude?: number;
    createdAt: string;
    statusHistory?: any[];
    Store?: {
        name: string;
        address?: string;
    };
    OrderItem?: any[];
}

export default function DeliveryAgentOrdersPage() {
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedStatus, setSelectedStatus] = useState<string>('AVAILABLE');

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const userStr = localStorage.getItem('user');
                if (!userStr) {
                    router.push('/login');
                    return;
                }
                const user = JSON.parse(userStr);
                if (user.role !== 'DELIVERY_AGENT') {
                    router.push('/');
                    return;
                }

                // Fetch all orders with delivery type
                const res = await fetch('/api/orders');
                const allOrders = await res.json();

                // Filter delivery orders only
                const deliveryOrders = allOrders.filter((o: any) =>
                    o.deliveryType === 'DELIVERY' &&
                    ['READY_FOR_PICKUP', 'WITH_DELIVERY_AGENT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'RETURNED'].includes(o.status)
                );

                setOrders(deliveryOrders);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [router]);

    const transitionStatus = async (orderId: string, newStatus: OrderStatus, notes?: string) => {
        try {
            const res = await fetch(`/api/orders/${orderId}/transition`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newStatus, notes }),
            });

            if (res.ok) {
                const { order: updatedOrder } = await res.json();
                setOrders(orders.map(o => o.id === orderId ? updatedOrder : o));
                alert(`Statut mis à jour : ${newStatus}`);
            } else {
                const error = await res.json();
                alert(error.error || 'Erreur lors de la transition');
            }
        } catch (e) {
            console.error(e);
            alert('Erreur technique');
        }
    };

    // Compteurs
    const statusCounts = {
        AVAILABLE: orders.filter(o => o.status === 'READY_FOR_PICKUP').length,
        IN_MY_POSSESSION: orders.filter(o => o.status === 'WITH_DELIVERY_AGENT').length,
        IN_DELIVERY: orders.filter(o => o.status === 'OUT_FOR_DELIVERY').length,
        DELIVERED: orders.filter(o => o.status === 'DELIVERED').length,
        RETURNED: orders.filter(o => o.status === 'RETURNED').length,
    };

    // Filtrer
    const filteredOrders =
        selectedStatus === 'AVAILABLE' ? orders.filter(o => o.status === 'READY_FOR_PICKUP') :
            selectedStatus === 'IN_MY_POSSESSION' ? orders.filter(o => o.status === 'WITH_DELIVERY_AGENT') :
                selectedStatus === 'IN_DELIVERY' ? orders.filter(o => o.status === 'OUT_FOR_DELIVERY') :
                    selectedStatus === 'DELIVERED' ? orders.filter(o => o.status === 'DELIVERED') :
                        selectedStatus === 'RETURNED' ? orders.filter(o => o.status === 'RETURNED') :
                            orders;

    if (loading) return <div className="p-10 text-center">Chargement...</div>;

    return (
        <div className="container py-10">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold">🚚 Mes Livraisons</h1>
                    <p className="text-gray-600 mt-1">Gérer les commandes à livrer</p>
                </div>
                <Link href="/livreur" className="btn btn-outline">
                    ← Dashboard Principal
                </Link>
            </div>

            {/* Statistiques */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                    <div className="text-2xl font-bold text-indigo-700">{statusCounts.AVAILABLE}</div>
                    <div className="text-sm text-indigo-600">Disponibles</div>
                </div>
                <div className="bg-cyan-50 p-4 rounded-lg border border-cyan-200">
                    <div className="text-2xl font-bold text-cyan-700">{statusCounts.IN_MY_POSSESSION}</div>
                    <div className="text-sm text-cyan-600">En ma possession</div>
                </div>
                <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
                    <div className="text-2xl font-bold text-teal-700">{statusCounts.IN_DELIVERY}</div>
                    <div className="text-sm text-teal-600">En livraison</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="text-2xl font-bold text-green-700">{statusCounts.DELIVERED}</div>
                    <div className="text-sm text-green-600">Livrées</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <div className="text-2xl font-bold text-orange-700">{statusCounts.RETURNED}</div>
                    <div className="text-sm text-orange-600">Retournées</div>
                </div>
            </div>

            {/* Filtres */}
            <div className="flex gap-2 flex-wrap mb-6">
                <button
                    onClick={() => setSelectedStatus('AVAILABLE')}
                    className={`px-4 py-2 rounded-lg font-medium ${selectedStatus === 'AVAILABLE'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                        }`}
                >
                    📦 Disponibles ({statusCounts.AVAILABLE})
                </button>
                <button
                    onClick={() => setSelectedStatus('IN_MY_POSSESSION')}
                    className={`px-4 py-2 rounded-lg font-medium ${selectedStatus === 'IN_MY_POSSESSION'
                            ? 'bg-cyan-600 text-white'
                            : 'bg-cyan-50 text-cyan-700 hover:bg-cyan-100'
                        }`}
                >
                    🎒 En ma possession ({statusCounts.IN_MY_POSSESSION})
                </button>
                <button
                    onClick={() => setSelectedStatus('IN_DELIVERY')}
                    className={`px-4 py-2 rounded-lg font-medium ${selectedStatus === 'IN_DELIVERY'
                            ? 'bg-teal-600 text-white'
                            : 'bg-teal-50 text-teal-700 hover:bg-teal-100'
                        }`}
                >
                    🚗 En livraison ({statusCounts.IN_DELIVERY})
                </button>
                <button
                    onClick={() => setSelectedStatus('DELIVERED')}
                    className={`px-4 py-2 rounded-lg font-medium ${selectedStatus === 'DELIVERED'
                            ? 'bg-green-600 text-white'
                            : 'bg-green-50 text-green-700 hover:bg-green-100'
                        }`}
                >
                    ✅ Livrées ({statusCounts.DELIVERED})
                </button>
                <button
                    onClick={() => setSelectedStatus('RETURNED')}
                    className={`px-4 py-2 rounded-lg font-medium ${selectedStatus === 'RETURNED'
                            ? 'bg-orange-600 text-white'
                            : 'bg-orange-50 text-orange-700 hover:bg-orange-100'
                        }`}
                >
                    🔄 Retournées ({statusCounts.RETURNED})
                </button>
            </div>

            {/* Liste commandes */}
            {filteredOrders.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-lg">
                    <p className="text-gray-500 text-lg">Aucune commande dans cette catégorie</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredOrders.map((order) => (
                        <div key={order.id} className="card p-6 border border-gray-100 hover:shadow-lg transition-shadow">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <span className="font-bold text-xl">#{order.id.slice(-6)}</span>
                                    <span className="text-sm text-gray-500 ml-3">
                                        {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                                    </span>
                                </div>
                                <span className="text-lg font-bold text-green-700">
                                    {order.total.toLocaleString()} DA
                                </span>
                            </div>

                            {/* Timeline */}
                            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                                <OrderStatusTimeline
                                    currentStatus={order.status}
                                    statusHistory={order.statusHistory}
                                    compact={true}
                                />
                            </div>

                            {/* Infos */}
                            <div className="grid md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Enlèvement</p>
                                    <p className="font-semibold">{order.Store?.name || 'Magasin'}</p>
                                    <p className="text-sm text-gray-600">{order.Store?.address || 'Adresse non disponible'}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Livraison</p>
                                    <p className="font-semibold">{order.shippingName || 'Client'}</p>
                                    <p className="text-sm text-gray-600">{order.shippingPhone || ''}</p>
                                    <p className="text-sm text-gray-600">{order.shippingAddress || 'Adresse non disponible'}</p>

                                    {/* GPS */}
                                    {order.deliveryLatitude && order.deliveryLongitude && (
                                        <a
                                            href={`https://www.google.com/maps/dir/?api=1&destination=${order.deliveryLatitude},${order.deliveryLongitude}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 mt-2 px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700"
                                        >
                                            🗺️ Ouvrir GPS
                                        </a>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 flex-wrap border-t pt-4">
                                {order.status === 'READY_FOR_PICKUP' && (
                                    <button
                                        onClick={() => transitionStatus(order.id, 'WITH_DELIVERY_AGENT')}
                                        className="btn btn-sm bg-cyan-600 text-white hover:bg-cyan-700"
                                    >
                                        <Truck className="w-4 h-4 mr-1" />
                                        Récupérer le colis
                                    </button>
                                )}

                                {order.status === 'WITH_DELIVERY_AGENT' && (
                                    <button
                                        onClick={() => transitionStatus(order.id, 'OUT_FOR_DELIVERY')}
                                        className="btn btn-sm bg-teal-600 text-white hover:bg-teal-700"
                                    >
                                        <PackageCheck className="w-4 h-4 mr-1" />
                                        Partir en livraison
                                    </button>
                                )}

                                {order.status === 'OUT_FOR_DELIVERY' && (
                                    <>
                                        <button
                                            onClick={() => transitionStatus(order.id, 'DELIVERED')}
                                            className="btn btn-sm bg-green-600 text-white hover:bg-green-700"
                                        >
                                            <Home className="w-4 h-4 mr-1" />
                                            Marquer livrée
                                        </button>
                                        <button
                                            onClick={() => {
                                                const reason = prompt('Raison du retour:');
                                                if (reason) transitionStatus(order.id, 'RETURNED', reason);
                                            }}
                                            className="btn btn-sm bg-orange-600 text-white hover:bg-orange-700"
                                        >
                                            <RotateCcw className="w-4 h-4 mr-1" />
                                            Retour impossible
                                        </button>
                                    </>
                                )}

                                {(order.status === 'DELIVERED' || order.status === 'RETURNED') && (
                                    <div className="text-sm text-gray-500 italic">
                                        {order.status === 'DELIVERED' ? '✅ Livraison terminée' : '🔄 Colis retourné'}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
