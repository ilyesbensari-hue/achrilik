"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import OrderStatusTimeline from '@/components/OrderStatusTimeline';
import { Package } from 'lucide-react';

interface Order {
    id: string;
    status: string;
    total: number;
    createdAt: string;
    statusHistory?: any[];
    deliveryType: string;
    OrderItem?: any[];
}

export default function CustomerOrdersPage() {
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const userStr = localStorage.getItem('user');
                if (!userStr) {
                    router.push('/login');
                    return;
                }
                const userData = JSON.parse(userStr);
                setUser(userData);

                // Fetch user's orders
                const res = await fetch(`/api/orders?userId=${userData.id}`);
                const userOrders = await res.json();

                // Sort by most recent first
                userOrders.sort((a: Order, b: Order) =>
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );

                setOrders(userOrders);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [router]);

    if (loading) {
        return (
            <div className="container py-10">
                <div className="text-center py-20">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#006233]"></div>
                    <p className="text-gray-600 mt-4">Chargement de vos commandes...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container py-10 max-w-5xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">📦 Mes Commandes</h1>
                <p className="text-gray-600 mt-1">Suivez l'état de vos commandes en temps réel</p>
            </div>

            {orders.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-2xl">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-xl font-bold text-gray-700 mb-2">Aucune commande</p>
                    <p className="text-gray-500 mb-6">Vous n'avez pas encore passé de commande</p>
                    <Link
                        href="/"
                        className="btn bg-[#006233] text-white hover:bg-[#004d28]"
                    >
                        Découvrir nos produits
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map((order) => {
                        const itemCount = order.OrderItem?.reduce((sum, item: any) => sum + item.quantity, 0) || 0;

                        return (
                            <div
                                key={order.id}
                                className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow"
                            >
                                {/* Header */}
                                <div className="bg-gradient-to-r from-[#006233] to-[#004d28] text-white p-6">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-xl font-bold">
                                                    Commande #{order.id.slice(-8).toUpperCase()}
                                                </h3>
                                            </div>
                                            <p className="text-white/80 text-sm">
                                                {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                            <p className="text-white/80 text-sm mt-1">
                                                {itemCount} {itemCount > 1 ? 'articles' : 'article'} • {order.deliveryType === 'CLICK_COLLECT' ? '🏪 Click & Collect' : '🚚 Livraison'}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-black">
                                                {order.total.toLocaleString()} DA
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Timeline */}
                                <div className="p-6 bg-gray-50">
                                    <h4 className="text-sm font-bold text-gray-700 mb-4">Suivi de votre commande</h4>
                                    <OrderStatusTimeline
                                        currentStatus={order.status as any}
                                        statusHistory={order.statusHistory}
                                        compact={false}
                                    />
                                </div>

                                {/* Articles */}
                                {order.OrderItem && order.OrderItem.length > 0 && (
                                    <div className="p-6 border-t">
                                        <h4 className="text-sm font-bold text-gray-700 mb-3">Articles commandés</h4>
                                        <div className="space-y-2">
                                            {order.OrderItem.slice(0, 3).map((item: any) => (
                                                <div key={item.id} className="flex justify-between text-sm">
                                                    <span className="text-gray-700">
                                                        <span className="font-bold">{item.quantity}x</span> {item.Variant?.Product?.title || 'Produit'}
                                                        <span className="text-gray-500 ml-2">
                                                            ({item.Variant?.size}/{item.Variant?.color})
                                                        </span>
                                                    </span>
                                                    <span className="font-medium text-gray-700">
                                                        {(item.price * item.quantity).toLocaleString()} DA
                                                    </span>
                                                </div>
                                            ))}
                                            {order.OrderItem.length > 3 && (
                                                <p className="text-xs text-gray-500 italic">
                                                    +{order.OrderItem.length - 3} autre(s) article(s)
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="p-6 bg-gray-50 border-t flex justify-between items-center">
                                    <div>
                                        {order.status === 'PENDING' && (
                                            <p className="text-sm text-gray-600">
                                                ⏳ Votre commande est en attente de confirmation
                                            </p>
                                        )}
                                        {order.status === 'CONFIRMED' && (
                                            <p className="text-sm text-gray-600">
                                                ✅ Commande confirmée, en cours de préparation
                                            </p>
                                        )}
                                        {order.status === 'AT_MERCHANT' && (
                                            <p className="text-sm text-gray-600">
                                                📦 Votre commande est en cours de préparation
                                            </p>
                                        )}
                                        {order.status === 'READY_FOR_PICKUP' && (
                                            <p className="text-sm text-gray-600">
                                                {order.deliveryType === 'CLICK_COLLECT'
                                                    ? '🏪 Prête à récupérer en magasin'
                                                    : '📦 Prête pour l\'enlèvement par le livreur'
                                                }
                                            </p>
                                        )}
                                        {order.status === 'WITH_DELIVERY_AGENT' && (
                                            <p className="text-sm text-gray-600">
                                                🚚 Chez le livreur, en route vers vous
                                            </p>
                                        )}
                                        {order.status === 'OUT_FOR_DELIVERY' && (
                                            <p className="text-sm text-green-600 font-semibold">
                                                🚗 En cours de livraison !
                                            </p>
                                        )}
                                        {order.status === 'DELIVERED' && (
                                            <p className="text-sm text-green-700 font-semibold">
                                                ✅ Livrée avec succès
                                            </p>
                                        )}
                                        {order.status === 'RETURNED' && (
                                            <p className="text-sm text-orange-600">
                                                🔄 Retournée (échec de livraison)
                                            </p>
                                        )}
                                        {order.status === 'CANCELLED' && (
                                            <p className="text-sm text-red-600">
                                                ❌ Commande annulée
                                            </p>
                                        )}
                                    </div>
                                    <Link
                                        href={`/orders/${order.id}`}
                                        className="btn btn-sm btn-outline"
                                    >
                                        Voir détails →
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Help Section */}
            {orders.length > 0 && (
                <div className="mt-8 p-6 bg-blue-50 rounded-xl border border-blue-200">
                    <h3 className="font-bold text-blue-900 mb-2">💡 Besoin d'aide ?</h3>
                    <p className="text-sm text-blue-700">
                        Pour toute question sur vos commandes, consultez notre{' '}
                        <Link href="/contact" className="underline font-semibold">page de contact</Link>
                        {' '}ou contactez notre service client.
                    </p>
                </div>
            )}
        </div>
    );
}
