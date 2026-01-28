"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SellerOrdersPage() {
    const router = useRouter();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [store, setStore] = useState<any>(null);

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
    }, [router]);

    const updateStatus = async (orderId: string, newStatus: string) => {
        console.log('[updateStatus] Starting status update', { orderId, newStatus });

        if (!confirm(`Changer le statut en "${newStatus}" ?`)) {
            console.log('[updateStatus] User cancelled confirmation');
            return;
        }

        try {
            console.log('[updateStatus] Sending PATCH request to /api/orders/' + orderId);
            const res = await fetch(`/api/orders/${orderId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            console.log('[updateStatus] Response received', { status: res.status, ok: res.ok });

            if (res.ok) {
                console.log('[updateStatus] Status updated successfully, updating local state');
                setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
                alert(`Commande mise à jour : ${newStatus}`);
            } else {
                const errorText = await res.text();
                console.error('[updateStatus] Update failed', { status: res.status, error: errorText });
                alert('Erreur lors de la mise à jour');
            }
        } catch (e) {
            console.error('[updateStatus] Exception caught', e);
            alert('Erreur technique');
        }
    };

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
                <h1 className="text-3xl font-bold">Commandes de la boutique</h1>
                <Link href="/sell" className="btn btn-outline">
                    ← Retour au Dashboard
                </Link>
            </div>

            {orders.length === 0 ? (
                <div className="card p-10 text-center bg-gray-50">
                    <div className="text-4xl mb-4">📦</div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Aucune commande</h3>
                    <p className="text-gray-500">Vos produits n'ont pas encore été commandés.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map(order => {
                        // Calculate total for THIS store's items only (visual helper)
                        const orderItems = order.OrderItem || order.items || [];
                        const storeItems = orderItems.filter((item: any) => item.Variant?.Product?.storeId === store.id);
                        const storeTotal = storeItems.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);

                        return (
                            <div key={order.id} className="card p-6 border border-gray-100 hover:shadow-md transition-shadow">
                                <div className="flex flex-col md:flex-row justify-between gap-6">
                                    {/* Order Info */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="font-bold text-lg">#{order.id.slice(-6)}</span>
                                            <span className={`px-2 py-0.5 rounded text-xs font-bold 
                                                ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                                                    order.status === 'READY' ? 'bg-blue-100 text-blue-700' :
                                                        order.status === 'CONFIRMED' ? 'bg-indigo-100 text-indigo-700' :
                                                            'bg-yellow-100 text-yellow-700'}`}>
                                                {order.status === 'PENDING' && 'En attente'}
                                                {order.status === 'CONFIRMED' && 'Confirmée'}
                                                {order.status === 'READY' && 'Prête'}
                                                {order.status === 'DELIVERED' && 'Livrée'}
                                                {order.status === 'CANCELLED' && 'Annulée'}
                                            </span>
                                            <span className="text-sm text-gray-500">
                                                {new Date(order.createdAt).toLocaleDateString('fr-FR')} • {new Date(order.createdAt).toLocaleTimeString('fr-FR')}
                                            </span>
                                        </div>

                                        <div className="mb-4">
                                            <p className="font-semibold text-gray-900">Client: {order.User?.name || 'Non spécifié'}</p>
                                            <p className="text-sm text-gray-500">{order.User?.email || ''}</p>
                                            <p className="text-sm font-medium mt-1">Mode: {order.deliveryType === 'CLICK_COLLECT' ? '🏪 Click & Collect' : '🚚 Livraison'}</p>
                                        </div>

                                        {/* Items List */}
                                        <div className="bg-gray-50 rounded-lg p-3">
                                            <p className="text-xs font-bold text-gray-400 uppercase mb-2">Articles commandés</p>
                                            <ul className="space-y-2">
                                                {storeItems.map((item: any) => (
                                                    <li key={item.id} className="flex justify-between text-sm">
                                                        <span>
                                                            <span className="font-bold">{item.quantity}x</span> {item.Variant?.Product?.title || 'Produit'}
                                                            <span className="text-gray-500"> ({item.Variant?.size || 'N/A'}/{item.Variant?.color || 'N/A'})</span>
                                                        </span>
                                                        <span className="font-medium text-gray-700">{item.price} DA</span>
                                                    </li>
                                                ))}
                                            </ul>
                                            <div className="border-t mt-3 pt-2 flex justify-between font-bold">
                                                <span>Total Boutique</span>
                                                <span className="text-green-700">{storeTotal} DA</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-col gap-2 min-w-[200px] border-l pl-0 md:pl-6 border-dashed">
                                        <p className="text-xs font-bold text-center text-gray-400 uppercase mb-1">Actions</p>

                                        {order.status === 'PENDING' && (
                                            <button
                                                onClick={() => updateStatus(order.id, 'CONFIRMED')}
                                                className="btn btn-sm bg-indigo-600 text-white hover:bg-indigo-700 w-full"
                                            >
                                                Accepter la commande
                                            </button>
                                        )}

                                        {order.status === 'CONFIRMED' && order.deliveryType === 'CLICK_COLLECT' && (
                                            <button
                                                onClick={() => updateStatus(order.id, 'READY')}
                                                className="btn btn-sm bg-blue-600 text-white hover:bg-blue-700 w-full"
                                            >
                                                Marquer "Prêt à récupérer"
                                            </button>
                                        )}

                                        {order.status === 'CONFIRMED' && order.deliveryType === 'DELIVERY' && (
                                            <button
                                                onClick={() => updateStatus(order.id, 'DELIVERED')}
                                                className="btn btn-sm bg-green-600 text-white hover:bg-green-700 w-full"
                                            >
                                                Marquer "Livré"
                                            </button>
                                        )}

                                        {order.status === 'READY' && (
                                            <button
                                                onClick={() => updateStatus(order.id, 'DELIVERED')}
                                                className="btn btn-sm bg-green-600 text-white hover:bg-green-700 w-full"
                                            >
                                                Confirmer récupération
                                            </button>
                                        )}

                                        {(order.status !== 'DELIVERED' && order.status !== 'CANCELLED') && (
                                            <button
                                                onClick={() => updateStatus(order.id, 'CANCELLED')}
                                                className="btn btn-sm border border-red-200 text-red-600 hover:bg-red-50 w-full mt-auto"
                                            >
                                                Annuler
                                            </button>
                                        )}

                                        {order.status === 'DELIVERED' && (
                                            <div className="text-center p-2 bg-green-50 text-green-700 rounded font-bold text-sm">
                                                ✅ Commande terminée
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
