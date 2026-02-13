"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import OrderStatusTimeline from '@/components/OrderStatusTimeline';
import { Package, CheckCircle, PackageCheck } from 'lucide-react';

type OrderStatus =
    | 'PENDING'
    | 'PAYMENT_PENDING'
    | 'CONFIRMED'
    | 'AT_MERCHANT'
    | 'READY_FOR_PICKUP'
    | 'WITH_DELIVERY_AGENT'
    | 'OUT_FOR_DELIVERY'
    | 'DELIVERED'
    | 'RETURNED'
    | 'CANCELLED';

export default function SellerOrdersPage() {
    const router = useRouter();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [store, setStore] = useState<any>(null);
    const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
    const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

    useEffect(() => {
        const fetchStoreAndOrders = async () => {
            try {
                const userStr = localStorage.getItem('user');
                if (!userStr) {
                    router.push('/login');
                    return;
                }
                const user = JSON.parse(userStr);
                if (user.role !== 'SELLER') {
                    router.push('/');
                    return;
                }

                // 1. Get Store ID
                const res = await fetch('/api/stores');
                const stores = await res.json();
                const myStore = stores.find((s: any) => s.ownerId === user.id);

                if (myStore) {
                    setStore(myStore);
                    // 2. Fetch Orders for this store
                    const orderRes = await fetch(`/api/orders?storeId=${myStore.id}`);
                    const orderData = await orderRes.json();
                    setOrders(orderData);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchStoreAndOrders();

        // Auto-refresh every 15 seconds
        const interval = setInterval(() => {
            fetchStoreAndOrders();
        }, 15000);

        return () => clearInterval(interval);
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

    const markAsPaid = async (orderId: string) => {
        try {
            const res = await fetch(`/api/orders/${orderId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isPaid: true }),
            });

            if (res.ok) {
                const updatedOrder = await res.json();
                setOrders(orders.map(o => o.id === orderId ? updatedOrder : o));
                alert('Paiement confirmé !');
            } else {
                alert('Erreur lors de la mise à jour du paiement');
            }
        } catch (e) {
            alert('Erreur technique');
        }
    };

    const toggleOrderExpanded = (orderId: string) => {
        const newExpanded = new Set(expandedOrders);
        if (newExpanded.has(orderId)) {
            newExpanded.delete(orderId);
        } else {
            newExpanded.add(orderId);
        }
        setExpandedOrders(newExpanded);
    };

    // Calcul des compteurs par statut
    const statusCounts = orders.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    // Filtrer les commandes
    const filteredOrders = selectedStatus === 'ALL'
        ? orders
        : orders.filter(o => o.status === selectedStatus);

    if (loading) return <div className="p-10 text-center">Chargement...</div>;

    if (!store) {
        return (
            <div className="container py-10 text-center">
                <p>Vous n'avez pas de boutique active.</p>
                <Link href="/sell" className="text-indigo-600 underline">Créer ma boutique</Link>
            </div>
        );
    }

    return (
        <div className="container py-10">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold">Commandes</h1>
                <Link href="/sell" className="btn btn-outline">
                    ← Retour au Dashboard
                </Link>
            </div>

            {/* Filtres par statut */}
            <div className="mb-6 flex gap-2 flex-wrap">
                <button
                    onClick={() => setSelectedStatus('ALL')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${selectedStatus === 'ALL'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    Toutes ({orders.length})
                </button>
                <button
                    onClick={() => setSelectedStatus('PENDING')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${selectedStatus === 'PENDING'
                        ? 'bg-yellow-600 text-white'
                        : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                        }`}
                >
                    En attente ({statusCounts['PENDING'] || 0})
                </button>
                <button
                    onClick={() => setSelectedStatus('CONFIRMED')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${selectedStatus === 'CONFIRMED'
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                        }`}
                >
                    Confirmées ({statusCounts['CONFIRMED'] || 0})
                </button>
                <button
                    onClick={() => setSelectedStatus('AT_MERCHANT')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${selectedStatus === 'AT_MERCHANT'
                        ? 'bg-purple-600 text-white'
                        : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                        }`}
                >
                    En préparation ({statusCounts['AT_MERCHANT'] || 0})
                </button>
                <button
                    onClick={() => setSelectedStatus('READY_FOR_PICKUP')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${selectedStatus === 'READY_FOR_PICKUP'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                        }`}
                >
                    Prêtes pour enlèvement ({statusCounts['READY_FOR_PICKUP'] || 0})
                </button>
                <button
                    onClick={() => setSelectedStatus('DELIVERED')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${selectedStatus === 'DELIVERED'
                        ? 'bg-green-600 text-white'
                        : 'bg-green-50 text-green-700 hover:bg-green-100'
                        }`}
                >
                    Livrées ({statusCounts['DELIVERED'] || 0})
                </button>
            </div>

            {filteredOrders.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-lg">
                    <p className="text-gray-500 text-lg">Aucune commande dans cette catégorie</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {filteredOrders.map((order) => {
                        const storeItems = order.OrderItem?.filter((item: any) => item.Variant?.Product?.storeId === store.id) || [];
                        if (storeItems.length === 0) return null;

                        const storeTotal = storeItems.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);
                        const isExpanded = expandedOrders.has(order.id);

                        return (
                            <div key={order.id} className="card p-6 border border-gray-100 hover:shadow-lg transition-shadow">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold text-xl">#{order.id.slice(-8).toUpperCase()}</span>
                                        <span className="text-sm text-gray-500">
                                            {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                                        </span>
                                        {order.isPaid ? (
                                            <span className="px-2 py-1 rounded text-xs font-bold bg-green-100 text-green-700">
                                                ✅ Payé
                                            </span>
                                        ) : (
                                            <span className="px-2 py-1 rounded text-xs font-bold bg-yellow-100 text-yellow-700">
                                                ⏳ Non payé
                                            </span>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => toggleOrderExpanded(order.id)}
                                        className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                                    >
                                        {isExpanded ? 'Réduire' : 'Détails'}
                                    </button>
                                </div>

                                {/* Timeline */}
                                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                                    <OrderStatusTimeline
                                        currentStatus={order.status}
                                        statusHistory={order.statusHistory}
                                        compact={!isExpanded}
                                    />
                                </div>

                                {/* Détails étendus */}
                                {isExpanded && (
                                    <div className="mb-4 space-y-4">
                                        <div>
                                            <p className="font-semibold text-gray-900">Client: {order.User?.name || 'Non spécifié'}</p>
                                            <p className="text-sm text-gray-500">{order.User?.email || ''}</p>
                                            <p className="text-sm font-medium mt-1">
                                                Mode: {order.deliveryType === 'CLICK_COLLECT' ? '🏪 Click & Collect' : '🚚 Livraison'}
                                            </p>
                                        </div>

                                        {/* Articles */}
                                        <div className="bg-white border rounded-lg p-3">
                                            <p className="text-xs font-bold text-gray-400 uppercase mb-2">Articles</p>
                                            <ul className="space-y-2">
                                                {storeItems.map((item: any) => (
                                                    <li key={item.id} className="flex justify-between text-sm">
                                                        <span>
                                                            <span className="font-bold">{item.quantity}x</span> {item.Variant?.Product?.title || 'Produit'}
                                                            <span className="text-gray-500"> ({item.Variant?.size}/{item.Variant?.color})</span>
                                                        </span>
                                                        <span className="font-medium">{item.price} DA</span>
                                                    </li>
                                                ))}
                                            </ul>
                                            <div className="border-t mt-3 pt-2 flex justify-between font-bold">
                                                <span>Total</span>
                                                <span className="text-green-700">{storeTotal} DA</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex gap-2 flex-wrap">
                                    {!order.isPaid && order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && (
                                        <button
                                            onClick={() => markAsPaid(order.id)}
                                            className="btn btn-sm bg-green-600 text-white hover:bg-green-700"
                                        >
                                            💰 Marquer payé
                                        </button>
                                    )}

                                    {order.status === 'PENDING' && (
                                        <button
                                            onClick={() => transitionStatus(order.id, 'CONFIRMED')}
                                            className="btn btn-sm bg-blue-600 text-white hover:bg-blue-700"
                                        >
                                            <CheckCircle className="w-4 h-4 mr-1" />
                                            Accepter
                                        </button>
                                    )}

                                    {order.status === 'CONFIRMED' && (
                                        <button
                                            onClick={() => transitionStatus(order.id, 'AT_MERCHANT')}
                                            className="btn btn-sm bg-purple-600 text-white hover:bg-purple-700"
                                        >
                                            <Package className="w-4 h-4 mr-1" />
                                            En préparation
                                        </button>
                                    )}

                                    {order.status === 'AT_MERCHANT' && (
                                        <button
                                            onClick={() => transitionStatus(order.id, 'READY_FOR_PICKUP')}
                                            className="btn btn-sm bg-indigo-600 text-white hover:bg-indigo-700"
                                        >
                                            <PackageCheck className="w-4 h-4 mr-1" />
                                            Prêt pour enlèvement
                                        </button>
                                    )}

                                    {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && order.status !== 'RETURNED' && (
                                        <button
                                            onClick={() => {
                                                const reason = prompt('Raison d\'annulation (obligatoire):');
                                                if (reason) transitionStatus(order.id, 'CANCELLED', reason);
                                            }}
                                            className="btn btn-sm border border-red-200 text-red-600 hover:bg-red-50"
                                        >
                                            Annuler
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
