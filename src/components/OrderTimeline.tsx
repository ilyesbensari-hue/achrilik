'use client';

import { useTranslation } from '@/hooks/useTranslation';

interface TimelineStep {
    key: string;
    labelFr: string;
    labelAr: string;
    icon: string;
    statuses: string[];
}

const TIMELINE_STEPS: TimelineStep[] = [
    {
        key: 'ordered',
        labelFr: 'Commandé',
        labelAr: 'تم الطلب',
        icon: '🛒',
        statuses: ['PENDING', 'PAYMENT_PENDING', 'CONFIRMED', 'AT_MERCHANT', 'READY_FOR_PICKUP', 'WITH_DELIVERY_AGENT', 'OUT_FOR_DELIVERY', 'SHIPPED', 'DELIVERED'],
    },
    {
        key: 'confirmed',
        labelFr: 'Confirmé',
        labelAr: 'مؤكد',
        icon: '✅',
        statuses: ['CONFIRMED', 'AT_MERCHANT', 'READY_FOR_PICKUP', 'WITH_DELIVERY_AGENT', 'OUT_FOR_DELIVERY', 'SHIPPED', 'DELIVERED'],
    },
    {
        key: 'preparing',
        labelFr: 'En préparation',
        labelAr: 'قيد التحضير',
        icon: '📦',
        statuses: ['AT_MERCHANT', 'READY_FOR_PICKUP', 'WITH_DELIVERY_AGENT', 'OUT_FOR_DELIVERY', 'SHIPPED', 'DELIVERED'],
    },
    {
        key: 'shipping',
        labelFr: 'En livraison',
        labelAr: 'في الطريق إليك',
        icon: '🚚',
        statuses: ['WITH_DELIVERY_AGENT', 'OUT_FOR_DELIVERY', 'SHIPPED', 'DELIVERED'],
    },
    {
        key: 'delivered',
        labelFr: 'Livré',
        labelAr: 'تم التسليم',
        icon: '🎉',
        statuses: ['DELIVERED'],
    },
];

interface OrderTimelineProps {
    status: string;
    createdAt?: string;
    updatedAt?: string;
}

export default function OrderTimeline({ status, createdAt, updatedAt }: OrderTimelineProps) {
    const { lang } = useTranslation();

    if (status === 'CANCELLED') {
        return (
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-xl flex-shrink-0">❌</div>
                <div>
                    <p className="font-bold text-red-700">{lang === 'ar' ? 'الطلب ملغى' : 'Commande annulée'}</p>
                    {createdAt && (
                        <p className="text-xs text-red-500">{new Date(createdAt).toLocaleDateString(lang === 'ar' ? 'ar-DZ' : 'fr-DZ')}</p>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-2 text-sm uppercase tracking-wide">
                📍 {lang === 'ar' ? 'تتبع الطلب' : 'Suivi de commande'}
            </h3>
            <div className="relative">
                <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-gray-100" />
                <div className="space-y-4">
                    {TIMELINE_STEPS.map((step, idx) => {
                        const isDone = step.statuses.includes(status);
                        const isCurrent = idx === TIMELINE_STEPS.findIndex(s => s.statuses.includes(status));
                        return (
                            <div key={step.key} className="flex items-start gap-4 relative">
                                <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0 transition-all duration-300 ${
                                    isDone ? 'bg-[#006233] shadow-md shadow-green-200' : 'bg-gray-100'
                                } ${isCurrent ? 'ring-4 ring-[#006233]/20 animate-pulse' : ''}`}>
                                    {step.icon}
                                </div>
                                <div className="pt-2">
                                    <p className={`font-semibold text-sm ${isDone ? 'text-[#006233]' : 'text-gray-400'}`}>
                                        {lang === 'ar' ? step.labelAr : step.labelFr}
                                    </p>
                                    {isCurrent && updatedAt && (
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            {new Date(updatedAt).toLocaleDateString(lang === 'ar' ? 'ar-DZ' : 'fr-DZ', {
                                                day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                                            })}
                                        </p>
                                    )}
                                    {step.key === 'delivered' && isDone && (
                                        <p className="text-xs text-green-500 font-medium mt-0.5">
                                            {lang === 'ar' ? '🎉 شكراً على طلبك!' : '🎉 Merci pour votre commande !'}
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
