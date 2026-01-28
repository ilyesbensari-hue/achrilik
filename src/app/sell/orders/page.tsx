"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SellerOrdersPage() {
    const router = useRouter();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [store, setStore] = useState<any>(null);
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    const [cancellationReason, setCancellationReason] = useState('');

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
                const updatedOrder = await res.json();
                setOrders(orders.map(o => o.id === orderId ? updatedOrder : o));
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

    const markAsPaid = async (orderId: string) => {
        try {
            const res = await fetch(`/api/orders/${orderId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isPaid: true })
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

    const openCancelModal = (orderId: string) => {
        setSelectedOrderId(orderId);
        setCancellationReason('');
        setCancelModalOpen(true);
    };

    const handleCancelOrder = async () => {
        if (!cancellationReason.trim()) {
            alert('Veuillez indiquer une raison d\'annulation');
            return;
        }

        if (!selectedOrderId) return;

        try {
            const res = await fetch(`/api/orders/${selectedOrderId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: 'CANCELLED',
                    cancellationReason: cancellationReason.trim()
                })
            });

            if (res.ok) {
                const updatedOrder = await res.json();
                setOrders(orders.map(o => o.id === selectedOrderId ? updatedOrder : o));
                setCancelModalOpen(false);
                alert('Commande annulée');
            } else {
                const error = await res.json();
                alert(error.error || 'Erreur lors de l\'annulation');
            }
        } catch (e) {
            alert('Erreur technique');
        }
    };

    const getStatusBadge = (status: string) => {
        const badges: any = {
            PENDING: { label: 'En attente', color: 'bg-yellow-100 text-yellow-700' },
            CONFIRMED: { label: 'Confirmée', color: 'bg-indigo-100 text-indigo-700' },
            READY: { label: 'Prête', color: 'bg-blue-100 text-blue-700' },
            SHIPPED: { label: 'Transmise au livreur', color: 'bg-purple-100 text-purple-700' },
            DELIVERED: { label: 'Livrée', color: 'bg-green-100 text-green-700' },
            CANCELLED: { label: 'Annulée', color: 'bg-red-100 text-red-700' }
        };
        const badge = badges[status] || { label: status, color: 'bg-gray-100 text-gray-700' };
        return <span className={`px-2 py-0.5 rounded text-xs font-bold ${badge.color}`}>{badge.label}</span>;
    };

    if (loading) return <div className="p-10 text-center">Chargement...</div>;

    if (!store) {
        return (
            <div className="container py-10 text-center">
                < p > Vous n'avez pas de boutique active.</p>
                    < Link href ="/sell" className="text-indigo-600 underline">Créer ma boutique</Link>
            </div >
        );
    }

    return (
        <div className="container py-10">
            < div className ="flex items-center justify-between mb-8">
                < h1 className ="text-3xl font-bold">Commandes de la boutique</h1>
                    < Link href ="/sell" className="btn btn-outline">
                    ← Retour au Dashboard
                </Link >
            </div >

    {
        orders.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-lg">
            <p className ="text-gray-500 text-lg">Aucune commande pour le moment</p>
                </div>
            ) : (
        <div className="space-y-6">
    {
        orders.map((order) => {
            const storeItems = order.OrderItem?.filter((item: any) => item.Variant?.Product?.storeId === store.id) || [];
            if (storeItems.length === 0) return null;

            const storeTotal = storeItems.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);

            return (
                <div key={order.id} className="card p-6 border border-gray-100 hover:shadow-md transition-shadow">
                    < div className ="flex flex-col md:flex-row justify-between gap-6">
            {/* Order Info */ }
            <div className="flex-1">
                < div className ="flex items-center gap-3 mb-2 flex-wrap">
                    < span className ="font-bold text-lg">#{order.id.slice(-6)}</span>
            { getStatusBadge(order.status) }
            {
                order.isPaid ? (
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-green-100 text-green-700">
                                                    ✅ Payé
                                                </span >
                                            ) : (
            <span className="px-2 py-0.5 rounded text-xs font-bold bg-yellow-100 text-yellow-700">
                                                    ⏳ Non payé
                                                </span >
                                            )
    }
    <span className="text-sm text-gray-500">
    { new Date(order.createdAt).toLocaleDateString('fr-FR') } • { new Date(order.createdAt).toLocaleTimeString('fr-FR') }
                                            </span >
                                        </div >

        <div className="mb-4">
            < p className ="font-semibold text-gray-900">Client: {order.User?.name || 'Non spécifié'}</p>
                < p className ="text-sm text-gray-500">{order.User?.email || ''}</p>
                    < p className ="text-sm font-medium mt-1">Mode: {order.deliveryType === 'CLICK_COLLECT' ? '🏪 Click & Collect' : '🚚 Livraison'}</p>
                                        </div >

        {/* Cancellation Reason */ }
    {
        order.status === 'CANCELLED' && order.cancellationReason && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
                < p className ="text-xs font-bold text-red-600 uppercase mb-1">Raison d'annulation</p>
                    < p className ="text-sm text-red-700">{order.cancellationReason}</p>
                                            </div >
                                        )
    }

    {/* Items List */ }
    <div className="bg-gray-50 rounded-lg p-3">
        < p className ="text-xs font-bold text-gray-400 uppercase mb-2">Articles commandés</p>
            < ul className ="space-y-2">
    {
        storeItems.map((item: any) => (
            <li key={item.id} className="flex justify-between text-sm">
            < span >
        <span className="font-bold">{item.quantity}x</span> {item.Variant?.Product?.title || 'Produit'}
        < span className ="text-gray-500"> ({item.Variant?.size || 'N/A'}/{item.Variant?.color || 'N/A'})</span>
                                                        </span >
            <span className="font-medium text-gray-700">{item.price} DA</span>
                                                    </li >
                                                ))
    }
                                            </ul >
        <div className="border-t mt-3 pt-2 flex justify-between font-bold">
            < span > Total Boutique</span >
                <span className="text-green-700">{storeTotal} DA</span>
                                            </div >
                                        </div >
                                    </div >

        {/* Actions */ }
        < div className ="flex flex-col gap-2 min-w-[200px] border-l pl-0 md:pl-6 border-dashed">
            < p className ="text-xs font-bold text-center text-gray-400 uppercase mb-1">Actions</p>

    {/* Payment Button */ }
    {
        !order.isPaid && order.status !== 'CANCELLED' && (
            <button
                onClick={() => markAsPaid(order.id)}
                className="btn btn-sm bg-green-600 text-white hover:bg-green-700 w-full"
                    >
                                                💰 Marquer comme payé
                                            </button >
                                        )
    }

    {/* Status Buttons */ }
    {
        order.status === 'PENDING' && (
            <button
                onClick={() => updateStatus(order.id, 'CONFIRMED')}
                className="btn btn-sm bg-indigo-600 text-white hover:bg-indigo-700 w-full"
                    >
                    Accepter la commande
                                            </button >
                                        )
    }

    {
        order.status === 'CONFIRMED' && order.deliveryType === 'CLICK_COLLECT' && (
            <button
                onClick={() => updateStatus(order.id, 'READY')}
                className="btn btn-sm bg-blue-600 text-white hover:bg-blue-700 w-full"
                    >
                    Marquer "Prête à récupérer"
                                            </button >
                                        )
    }

    {
        order.status === 'CONFIRMED' && order.deliveryType === 'DELIVERY' && (
            <button
                onClick={() => updateStatus(order.id, 'SHIPPED')}
                className="btn btn-sm bg-purple-600 text-white hover:bg-purple-700 w-full"
                    >
                    Transmettre au livreur
                                            </button >
                                        )
    }

    {
        order.status === 'READY' && (
            <button
                onClick={() => updateStatus(order.id, 'DELIVERED')}
                className="btn btn-sm bg-green-600 text-white hover:bg-green-700 w-full"
                    >
                    Confirmer récupération
                                            </button >
                                        )
    }

    {
        order.status === 'SHIPPED' && (
            <button
                onClick={() => updateStatus(order.id, 'DELIVERED')}
                className="btn btn-sm bg-green-600 text-white hover:bg-green-700 w-full"
                    >
                    Marquer "Livrée"
                                            </button >
                                        )
    }

    {
        (order.status !== 'DELIVERED' && order.status !== 'CANCELLED') && (
            <button
                onClick={() => openCancelModal(order.id)}
                className="btn btn-sm border border-red-200 text-red-600 hover:bg-red-50 w-full mt-auto"
                    >
                    Annuler
                                            </button >
                                        )
    }

    {
        order.status === 'DELIVERED' && (
            <div className="text-center p-2 bg-green-50 text-green-700 rounded font-bold text-sm">
                                                ✅ Commande terminée
                                            </div >
                                        )
    }
                                    </div >
                                </div >
                            </div >
                        );
})}
                </div >
            )}

{/* Cancellation Modal */ }
{
    cancelModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            < div className ="bg-white rounded-lg p-6 max-w-md w-full">
                < h3 className ="text-xl font-bold mb-4">Annuler la commande</h3>
                    < p className ="text-sm text-gray-600 mb-4">
                            Veuillez indiquer la raison de l'annulation (obligatoire)
                        </p >
        <textarea
            className="w-full border border-gray-300 rounded p-3 mb-4 min-h-[100px]"
    placeholder ="Ex: Produit en rupture de stock, client a annulé, erreur de commande..."
    value = { cancellationReason }
    onChange = {(e) => setCancellationReason(e.target.value)
}
                        />
    < div className ="flex gap-3">
        < button
onClick = { handleCancelOrder }
className ="btn bg-red-600 text-white hover:bg-red-700 flex-1"
    >
    Confirmer l'annulation
                            </button >
    <button
        onClick={() => setCancelModalOpen(false)}
        className="btn btn-outline flex-1"
            >
            Retour
                            </button >
                        </div >
                    </div >
                </div >
            )}
        </div >
    );
}
