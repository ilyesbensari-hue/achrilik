'use client';

import { useTranslation } from '@/hooks/useTranslation';

interface DeliveryTrackingProps {
    order: any;
}

export default function DeliveryTracking({ order }: DeliveryTrackingProps) {
    const { tr } = useTranslation();

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

    const statusColors: { [key: string]: string } = {
        PENDING: 'bg-gray-100 text-gray-800',
        ACCEPTED: 'bg-blue-100 text-blue-800',
        READY_TO_SHIP: 'bg-indigo-100 text-indigo-800',
        PICKED_UP: 'bg-purple-100 text-purple-800',
        IN_TRANSIT: 'bg-yellow-100 text-yellow-800',
        DELIVERED: 'bg-green-100 text-green-800',
        FAILED: 'bg-red-100 text-red-800',
        RETURNED: 'bg-orange-100 text-orange-800',
    };

    const statusIcons: { [key: string]: string } = {
        PENDING: '⏳', ACCEPTED: '✅', READY_TO_SHIP: '📦',
        PICKED_UP: '🚚', IN_TRANSIT: '🛣️', DELIVERED: '🎉',
        FAILED: '❌', RETURNED: '↩️',
    };

    if (!order.deliveryStatus || order.deliveryStatus === 'PENDING') {
        return (
            <div className="bg-gray-50 rounded-lg p-6 text-center">
                <p className="text-gray-600">{tr('order_detail_tracking_hint')}</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">{tr('order_detail_tracking')}</h3>

            {/* Current status */}
            <div className="mb-6">
                <p className="text-sm text-gray-600 mb-2">{tr('order_detail_status_label')}</p>
                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${statusColors[order.deliveryStatus] || 'bg-gray-100 text-gray-800'}`}>
                    <span className="text-lg">{statusIcons[order.deliveryStatus]}</span>
                    {statusLabels[order.deliveryStatus] || order.deliveryStatus}
                </span>
            </div>

            {/* Tracking number */}
            {order.trackingNumber && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm font-medium text-blue-900 mb-1">{tr('order_detail_tracking_num')}</p>
                    <p className="text-xl font-mono font-bold text-blue-900">{order.trackingNumber}</p>
                    {order.trackingUrl && (
                        <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer"
                            className="inline-block mt-3 text-sm text-blue-600 hover:text-blue-800 underline">
                            🔗 {tr('order_detail_tracking_url_hint')} →
                        </a>
                    )}
                </div>
            )}

            {/* Progress bar */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">{tr('buyer_order_delivery_mode')}</span>
                    <span className="text-sm font-medium text-[#006233]">
                        {order.deliveryStatus === 'DELIVERED' ? '100%' :
                            order.deliveryStatus === 'IN_TRANSIT' ? '75%' :
                                order.deliveryStatus === 'PICKED_UP' ? '50%' :
                                    order.deliveryStatus === 'READY_TO_SHIP' ? '25%' : '10%'}
                    </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className={`h-2 rounded-full transition-all duration-500 ${order.deliveryStatus === 'DELIVERED' ? 'bg-green-600' :
                        order.deliveryStatus === 'FAILED' || order.deliveryStatus === 'RETURNED' ? 'bg-red-600' : 'bg-[#006233]'}`}
                        style={{ width: order.deliveryStatus === 'DELIVERED' ? '100%' : order.deliveryStatus === 'IN_TRANSIT' ? '75%' : order.deliveryStatus === 'PICKED_UP' ? '50%' : order.deliveryStatus === 'READY_TO_SHIP' ? '25%' : '10%' }}
                    />
                </div>
            </div>

            {/* Steps timeline */}
            <div className="space-y-4">
                <h4 className="font-medium text-gray-900">{tr('buyer_order_articles')}</h4>
                <div className="relative pl-8 space-y-6">
                    <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-gray-200" />

                    {[
                        { key: 'ACCEPTED', active: ['ACCEPTED', 'READY_TO_SHIP', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED'], label: tr('status_ACCEPTED'), sub: tr('orders_accept') },
                        { key: 'READY_TO_SHIP', active: ['READY_TO_SHIP', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED'], label: tr('status_READY_TO_SHIP'), sub: tr('orders_ready_pickup') },
                        { key: 'PICKED_UP', active: ['PICKED_UP', 'IN_TRANSIT', 'DELIVERED'], label: tr('status_PICKED_UP'), sub: tr('order_detail_tracking_hint') },
                        { key: 'IN_TRANSIT', active: ['IN_TRANSIT', 'DELIVERED'], label: tr('status_IN_TRANSIT'), sub: '' },
                        { key: 'DELIVERED', active: ['DELIVERED'], label: tr('status_DELIVERED'), sub: '', green: true },
                    ].map((step) => (
                        <div key={step.key} className="relative">
                            <div className={`absolute left-[-1.75rem] w-4 h-4 rounded-full border-2 ${step.active.includes(order.deliveryStatus)
                                ? (step.green ? 'bg-green-600 border-green-600' : 'bg-[#006233] border-[#006233]')
                                : 'bg-white border-gray-300'}`} />
                            <div>
                                <p className="font-medium text-gray-900">{step.label}</p>
                                {step.sub && <p className="text-sm text-gray-500">{step.sub}</p>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Success message */}
            {order.deliveryStatus === 'DELIVERED' && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-900 font-medium">🎉 {tr('orders_delivered')}</p>
                </div>
            )}

            {/* Failure message */}
            {(order.deliveryStatus === 'FAILED' || order.deliveryStatus === 'RETURNED') && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-900 font-medium">❌ {tr('status_FAILED')}</p>
                    <p className="text-sm text-red-700 mt-1">{tr('order_detail_tracking_url_hint')}</p>
                </div>
            )}

            {/* Last updated */}
            {order.lastUpdatedAt && (
                <div className="mt-6 pt-4 border-t">
                    <p className="text-xs text-gray-500">{tr('order_detail_last_updated')}{new Date(order.lastUpdatedAt).toLocaleString('fr-DZ')}</p>
                </div>
            )}
        </div>
    );
}
