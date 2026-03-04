'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';

export default function SellerOrderDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { tr } = useTranslation();
    const [order, setOrder] = useState<any>(null);
    const [store, setStore] = useState<any>(null);
    const [filteredItems, setFilteredItems] = useState<any[]>([]);
    const [filteredTotal, setFilteredTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [deliveryStatus, setDeliveryStatus] = useState('PENDING');
    const [trackingNumber, setTrackingNumber] = useState('');
    const [trackingUrl, setTrackingUrl] = useState('');
    const [codReceived, setCodReceived] = useState(false);
    const [codReceivedAmount, setCodReceivedAmount] = useState('');
    const [sellerNotes, setSellerNotes] = useState('');

    useEffect(() => { fetchOrder(); }, [params.id]);

    const fetchOrder = async () => {
        try {
            const userStr = localStorage.getItem('user');
            if (!userStr) { router.push('/login'); return; }
            const user = JSON.parse(userStr);

            const storesRes = await fetch('/api/stores');
            const stores = await storesRes.json();
            const myStore = stores.find((s: any) => s.ownerId === user.id);

            if (!myStore) { alert(tr('order_detail_no_store')); router.push('/sell'); return; }
            setStore(myStore);

            const res = await fetch(`/api/orders/${params.id}`);
            if (!res.ok) { setLoading(false); return; }

            const data = await res.json();
            if (!data || !data.OrderItem) { setLoading(false); return; }

            const storeItems = data.OrderItem.filter((item: any) => item.Variant?.Product?.storeId === myStore.id) || [];
            const storeTotal = storeItems.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);

            setFilteredItems(storeItems);
            setFilteredTotal(storeTotal);
            setOrder(data);
            setDeliveryStatus(data.deliveryStatus || 'PENDING');
            setTrackingNumber(data.trackingNumber || '');
            setTrackingUrl(data.trackingUrl || '');
            setCodReceived(data.codReceived || false);
            setCodReceivedAmount(data.codReceivedAmount?.toString() || '');
            setSellerNotes(data.sellerNotes || '');
        } catch (error) {
            console.error('Failed to fetch order:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch(`/api/orders/${params.id}/delivery`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ deliveryStatus, trackingNumber, trackingUrl, codReceived, codReceivedAmount: codReceivedAmount ? parseFloat(codReceivedAmount) : null, sellerNotes }),
            });
            if (!res.ok) throw new Error('Failed to update');
            alert(tr('order_detail_save_ok'));
            fetchOrder();
        } catch (error) {
            alert(tr('order_detail_save_err'));
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="h-64 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    if (!order) {
        return <div className="container mx-auto px-4 py-8"><p className="text-red-600">{tr('order_detail_not_found')}</p></div>;
    }

    const statusLabels: { [key: string]: string } = {
        PENDING: tr('status_PENDING'),
        ACCEPTED: tr('status_ACCEPTED'),
        READY_TO_SHIP: tr('status_READY_TO_SHIP'),
        PICKED_UP: tr('status_PICKED_UP'),
        IN_TRANSIT: tr('status_IN_TRANSIT'),
        DELIVERED: tr('status_DELIVERED'),
        FAILED: tr('status_FAILED'),
        RETURNED: tr('status_RETURNED'),
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <button onClick={() => router.push('/sell/orders')} className="mb-6 text-[#006233] hover:underline flex items-center gap-2">
                {tr('order_detail_back')}
            </button>

            <h1 className="text-3xl font-bold text-gray-900 mb-8">
                {tr('order_detail_order')}{order.id.slice(-8).toUpperCase()}
            </h1>

            {/* Client Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">{tr('order_detail_client_info')}</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-gray-600">{tr('order_detail_name')}</p>
                        <p className="font-medium text-gray-900">{order.shippingName}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">{tr('order_detail_phone')}</p>
                        <p className="font-medium text-gray-900">{order.shippingPhone}</p>
                    </div>
                    <div className="col-span-2">
                        <p className="text-sm text-gray-600">{tr('order_detail_address')}</p>
                        <p className="font-medium text-gray-900">{order.shippingAddress}</p>
                        <p className="text-sm text-gray-500">{order.shippingCity}{order.shippingWilaya ? `, ${order.shippingWilaya}` : ''}</p>
                    </div>
                </div>
            </div>

            {/* Products */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">{tr('order_detail_products')} ({filteredItems.length})</h2>
                {store && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm font-medium text-blue-900">{tr('order_detail_store')}: {store.name}</p>
                        {store.address && <p className="text-sm text-blue-700">{store.address}</p>}
                    </div>
                )}
                <div className="space-y-4">
                    {filteredItems.map((item: any) => (
                        <div key={item.id} className="flex gap-4 pb-4 border-b last:border-0">
                            <div className="flex-1">
                                <p className="font-medium text-gray-900">{item.Variant.Product.title}</p>
                                <p className="text-sm text-gray-600">{tr('order_detail_size')}: {item.Variant.size} • {tr('order_detail_color')}: {item.Variant.color}</p>
                                <p className="text-sm text-gray-600">{tr('order_detail_qty')}: x{item.quantity}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-[#006233]">{(item.price * item.quantity).toLocaleString('fr-DZ')} DA</p>
                                <p className="text-sm text-gray-500">{item.price.toLocaleString('fr-DZ')} {tr('order_detail_unit')}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-6 pt-4 border-t">
                    <div className="flex justify-between items-center mb-2">
                        <p className="text-lg font-bold text-gray-900">{tr('orders_total')}</p>
                        <p className="text-2xl font-bold text-[#006233]">{filteredTotal.toLocaleString('fr-DZ')} DA</p>
                    </div>
                    <p className="text-sm text-gray-600">{tr('order_detail_payment')}: {order.paymentMethod === 'COD' ? '💵 COD' : order.paymentMethod}</p>
                </div>
            </div>

            {/* Delivery Tracking */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">{tr('order_detail_tracking')}</h2>
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{tr('order_detail_status_label')}</label>
                        <select value={deliveryStatus} onChange={(e) => setDeliveryStatus(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006233] focus:border-transparent text-base">
                            {Object.entries(statusLabels).map(([value, label]) => (
                                <option key={value} value={value}>{label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{tr('order_detail_tracking_num')}</label>
                        <input type="text" value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)}
                            placeholder="Ex: YAL123456789" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006233] focus:border-transparent" />
                        <p className="mt-1 text-sm text-gray-500">{tr('order_detail_tracking_hint')}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{tr('order_detail_tracking_url')}</label>
                        <input type="url" value={trackingUrl} onChange={(e) => setTrackingUrl(e.target.value)}
                            placeholder="https://..." className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006233] focus:border-transparent" />
                        <p className="mt-1 text-sm text-gray-500">{tr('order_detail_tracking_url_hint')}</p>
                    </div>
                    {order.paymentMethod === 'COD' && (
                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <div className="flex items-start gap-3 mb-4">
                                <input type="checkbox" id="codReceived" checked={codReceived} onChange={(e) => setCodReceived(e.target.checked)}
                                    className="mt-1 w-5 h-5 text-[#006233] border-gray-300 rounded" />
                                <div className="flex-1">
                                    <label htmlFor="codReceived" className="font-medium text-gray-900 cursor-pointer">{tr('order_detail_cod_received')}</label>
                                    <p className="text-sm text-gray-600 mt-1">{tr('order_detail_cod_hint')}</p>
                                </div>
                            </div>
                            {codReceived && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">{tr('order_detail_cod_amount')}</label>
                                    <input type="number" value={codReceivedAmount} onChange={(e) => setCodReceivedAmount(e.target.value)}
                                        placeholder={order.total.toString()} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006233] focus:border-transparent" />
                                    <p className="mt-1 text-sm text-gray-500">{tr('order_detail_cod_expected')}{order.total.toLocaleString('fr-DZ')} DA</p>
                                </div>
                            )}
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{tr('order_detail_notes')}</label>
                        <textarea value={sellerNotes} onChange={(e) => setSellerNotes(e.target.value)} rows={4}
                            placeholder={tr('order_detail_notes_hint')}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006233] focus:border-transparent resize-none" />
                    </div>
                    {order.lastUpdatedAt && (
                        <div className="text-sm text-gray-500">{tr('order_detail_last_updated')}{new Date(order.lastUpdatedAt).toLocaleString('fr-DZ')}</div>
                    )}
                    <button onClick={handleSave} disabled={saving}
                        className="w-full bg-[#006233] text-white px-6 py-4 rounded-lg font-medium hover:bg-[#005028] transition-colors disabled:opacity-50 text-lg">
                        {saving ? tr('order_detail_saving') : tr('order_detail_save')}
                    </button>
                </div>
            </div>
        </div>
    );
}
