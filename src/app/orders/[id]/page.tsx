'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import DeliveryTracking from '@/components/DeliveryTracking';
import { useTranslation } from '@/hooks/useTranslation';

interface Order {
    id: string;
    total: number;
    status: string;
    createdAt: string;
    deliveryType: string;
    OrderItem: any[];
    paymentMethod: string;
    shippingName?: string;
    shippingPhone?: string;
    shippingAddress?: string;
    shippingCity?: string;
}

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { tr } = useTranslation();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const userStr = localStorage.getItem('user');
                if (!userStr) { router.push('/login'); return; }
                const user = JSON.parse(userStr);

                const res = await fetch(`/api/orders/${id}`);

                if (res.status === 404) {
                    alert(tr('buyer_order_not_found'));
                    router.push('/profile');
                    return;
                }

                if (!res.ok) throw new Error('Failed to fetch order');

                const foundOrder = await res.json();

                if (foundOrder.userId !== user.id && user.role !== 'ADMIN') {
                    router.push('/profile');
                    return;
                }

                setOrder(foundOrder);
            } catch (error) {
                console.error(error);
                alert(tr('error_generic'));
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [id, router]);

    if (loading) return <div className="p-10 text-center">{tr('loading_text')}</div>;
    if (!order) return null;

    const getStatusLabel = () => {
        switch (order.status) {
            case 'PENDING': return tr('buyer_order_status_pending');
            case 'CONFIRMED': return tr('buyer_order_status_confirmed');
            case 'READY': return tr('buyer_order_status_ready');
            case 'DELIVERED': return tr('buyer_order_status_delivered');
            case 'CANCELLED': return tr('buyer_order_status_cancelled');
            default: return order.status;
        }
    };

    return (
        <div className="container py-10 max-w-4xl mx-auto">
            <div className="mb-6 flex items-center gap-4">
                <Link href="/profile" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                </Link>
                <h1 className="text-2xl font-bold">{tr('buyer_order_title')}</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-6">
                    {/* Status Card */}
                    <div className="card p-6 border-l-4 border-indigo-500">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">{tr('buyer_order_num')}</p>
                                <p className="font-mono font-bold text-lg text-gray-900">#{order.id.slice(-8).toUpperCase()}</p>
                                <p className="text-xs text-gray-400 mt-1">
                                    {tr('buyer_order_placed')}{new Date(order.createdAt).toLocaleDateString('fr-DZ')}
                                </p>
                            </div>
                            <span className={`px-4 py-2 rounded-lg text-sm font-bold ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                                    order.status === 'READY' ? 'bg-blue-100 text-blue-700 animate-pulse' :
                                        order.status === 'CONFIRMED' ? 'bg-indigo-100 text-indigo-700' :
                                            order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                                                'bg-yellow-100 text-yellow-700'
                                }`}>
                                {getStatusLabel()}
                            </span>
                        </div>
                    </div>

                    {/* Items List */}
                    <div className="card bg-white overflow-hidden">
                        <div className="p-4 bg-gray-50 border-b">
                            <h3 className="font-bold text-gray-900">{tr('buyer_order_articles')} ({order.OrderItem?.length || 0})</h3>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {order.OrderItem?.map((item: any) => (
                                <div key={item.id} className="p-4 flex gap-4">
                                    <div className="relative w-20 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                        {item.Variant?.Product?.images && item.Variant.Product.images[0] ? (
                                            <Image src={item.Variant.Product.images[0]} alt={item.Variant.Product.title} fill className="object-cover" />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-gray-300">—</div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-medium text-gray-900 line-clamp-2">{item.Variant?.Product?.title || '-'}</h4>
                                        <p className="text-sm text-gray-500 mt-1">{item.Variant?.size} {item.Variant?.color && `/ ${item.Variant.color}`}</p>
                                        <div className="flex justify-between items-center mt-3">
                                            <div className="text-sm">
                                                <span className="font-bold">{item.quantity}</span> x {item.price} DA
                                            </div>
                                            <p className="font-bold text-gray-900">{item.price * item.quantity} DA</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <DeliveryTracking order={order} />
                </div>

                {/* Sidebar */}
                <div className="md:col-span-1 space-y-6">
                    <div className="card p-6">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <span>{order.deliveryType === 'CLICK_COLLECT' ? '🏪' : '🚚'}</span>
                            {tr('buyer_order_delivery_mode')}
                        </h3>
                        <div className="text-sm text-gray-600 space-y-2">
                            <p className="font-medium text-black">
                                {order.deliveryType === 'CLICK_COLLECT' ? tr('buyer_order_click_collect') : tr('buyer_order_home')}
                            </p>
                            {order.deliveryType === 'CLICK_COLLECT' && (
                                <div className="bg-blue-50 p-3 rounded-lg text-blue-800 text-xs">
                                    {tr('buyer_order_click_collect_hint')}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="card p-6">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <span>💳</span> {tr('buyer_order_payment')}
                        </h3>
                        <div className="flex justify-between items-center text-sm mb-2">
                            <span className="text-gray-600">{tr('buyer_order_method')}</span>
                            <span className="font-medium">{order.paymentMethod === 'CASH_ON_DELIVERY' ? tr('buyer_order_cash') : tr('buyer_order_card')}</span>
                        </div>
                        <div className="border-t pt-3 mt-3">
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-gray-900">{tr('orders_total')}</span>
                                <span className="font-bold text-xl text-[#006233]">{order.total} DA</span>
                            </div>
                        </div>
                    </div>

                    {order.deliveryType === 'DELIVERY' && order.shippingAddress && (
                        <div className="card p-6">
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <span>📍</span> {tr('buyer_order_delivery_address')}
                            </h3>
                            <div className="text-sm text-gray-600 space-y-2">
                                {order.shippingName && <p className="font-medium text-black">{order.shippingName}</p>}
                                {order.shippingPhone && <p>{order.shippingPhone}</p>}
                                {order.shippingAddress && <p>{order.shippingAddress}</p>}
                                {order.shippingCity && <p>{order.shippingCity}</p>}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
