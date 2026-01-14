"use client";

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface Order {
    id: string;
    total: number;
    status: string;
    createdAt: string;
    deliveryType: string;
    items: any[];
    paymentMethod: string;
}

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const userStr = localStorage.getItem('user');
                if (!userStr) {
                    router.push('/login');
                    return;
                }
                const user = JSON.parse(userStr);

                // Fetch all orders for this user and filter (simple security check)
                // In a real app, the API should allow fetching a specific order by ID checking ownership
                const res = await fetch(`/api/orders?userId=${user.id}`);
                if (!res.ok) throw new Error('Failed to fetch');

                const orders = await res.json();
                const foundOrder = orders.find((o: any) => o.id === id);

                if (foundOrder) {
                    setOrder(foundOrder);
                } else {
                    alert('Commande introuvable');
                    router.push('/profile');
                }
            } catch (error) {
                console.error(error);
                alert('Erreur technique');
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [id, router]);

    if (loading) return <div className="p-10 text-center">Chargement...</div>;
    if (!order) return null;

    return (
        <div className="container py-10 max-w-4xl mx-auto">
            <div className="mb-6 flex items-center gap-4">
                <Link href="/profile" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                </Link>
                <h1 className="text-2xl font-bold">Détails de la commande</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="md:col-span-2 space-y-6">
                    {/* Status Card */}
                    <div className="card p-6 border-l-4 border-indigo-500">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Commande n°</p>
                                <p className="font-mono font-bold text-lg text-gray-900">#{order.id.slice(0, 8).toUpperCase()}</p>
                                <p className="text-xs text-gray-400 mt-1">Passée le {new Date(order.createdAt).toLocaleDateString('fr-FR')} à {new Date(order.createdAt).toLocaleTimeString('fr-FR')}</p>
                            </div>
                            <span className={`px-4 py-2 rounded-lg text-sm font-bold 
                                ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                                    order.status === 'READY' ? 'bg-blue-100 text-blue-700 animate-pulse' :
                                        order.status === 'CONFIRMED' ? 'bg-indigo-100 text-indigo-700' :
                                            order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                                                'bg-yellow-100 text-yellow-700'
                                }`}>
                                {order.status === 'PENDING' && 'En attente de validation'}
                                {order.status === 'CONFIRMED' && 'Validée / En préparation'}
                                {order.status === 'READY' && 'Prête à récupérer'}
                                {order.status === 'DELIVERED' && 'Livrée / Récupérée'}
                                {order.status === 'CANCELLED' && 'Annulée'}
                            </span>
                        </div>
                    </div>

                    {/* Items List */}
                    <div className="card bg-white overflow-hidden">
                        <div className="p-4 bg-gray-50 border-b">
                            <h3 className="font-bold text-gray-900">Articles ({order.items.length})</h3>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {order.items.map((item: any) => (
                                <div key={item.id} className="p-4 flex gap-4">
                                    <div className="relative w-20 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                        {item.variant.product.images && item.variant.product.images[0] ? (
                                            <Image
                                                src={item.variant.product.images[0]}
                                                alt={item.variant.product.title}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-gray-300">No Img</div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-medium text-gray-900 line-clamp-2">{item.variant.product.title}</h4>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {item.variant.size} / {item.variant.color}
                                        </p>
                                        <div className="flex justify-between items-center mt-3">
                                            <div className="text-sm">
                                                <span className="font-bold">{item.quantity}</span> x {item.price} DA
                                            </div>
                                            <p className="font-bold text-gray-900">
                                                {item.price * item.quantity} DA
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="md:col-span-1 space-y-6">
                    {/* Delivery Info */}
                    <div className="card p-6">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <span>{order.deliveryType === 'CLICK_COLLECT' ? '🏪' : '🚚'}</span>
                            Mode de livraison
                        </h3>
                        <div className="text-sm text-gray-600 space-y-2">
                            <p className="font-medium text-black">
                                {order.deliveryType === 'CLICK_COLLECT' ? 'Click & Collect' : 'Livraison à domicile'}
                            </p>
                            {order.deliveryType === 'CLICK_COLLECT' && (
                                <div className="bg-blue-50 p-3 rounded-lg text-blue-800 text-xs">
                                    Rendez-vous en boutique pour récupérer votre commande une fois prête.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Payment Info */}
                    <div className="card p-6">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <span>💳</span> Paiement
                        </h3>
                        <div className="flex justify-between items-center text-sm mb-2">
                            <span className="text-gray-600">Méthode</span>
                            <span className="font-medium">{order.paymentMethod === 'CASH_ON_DELIVERY' ? 'Paiement à la livraison' : 'Carte Bancaire'}</span>
                        </div>
                        <div className="border-t pt-3 mt-3">
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-gray-900">Total</span>
                                <span className="font-bold text-xl text-[#006233]">{order.total} DA</span>
                            </div>
                        </div>
                    </div>

                    {/* Stores Contact (Optional enhancement) */}
                    {/* Logic to show store contact could actully be useful here if we had store data attached to order items deep check */}
                </div>
            </div>
        </div>
    );
}
