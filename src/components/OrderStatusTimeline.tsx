import React from 'react';
import { OrderStatus } from '@prisma/client';
import {
    Clock,
    CreditCard,
    CheckCircle,
    Package,
    Truck,
    PackageCheck,
    Navigation,
    Home,
    RotateCcw,
    XCircle,
} from 'lucide-react';

interface TimelineStep {
    status: OrderStatus;
    label: string;
    Icon: React.ElementType;
    color: string;
}

const TIMELINE_STEPS: TimelineStep[] = [
    {
        status: 'PENDING',
        label: 'En attente',
        Icon: Clock,
        color: 'bg-gray-400',
    },
    {
        status: 'PAYMENT_PENDING',
        label: 'Paiement en attente',
        Icon: CreditCard,
        color: 'bg-yellow-500',
    },
    {
        status: 'CONFIRMED',
        label: 'Confirmée',
        Icon: CheckCircle,
        color: 'bg-blue-500',
    },
    {
        status: 'AT_MERCHANT',
        label: 'En préparation',
        Icon: Package,
        color: 'bg-purple-500',
    },
    {
        status: 'READY_FOR_PICKUP',
        label: 'Prête pour enlèvement',
        Icon: PackageCheck,
        color: 'bg-indigo-500',
    },
    {
        status: 'WITH_DELIVERY_AGENT',
        label: 'Chez le livreur',
        Icon: Truck,
        color: 'bg-cyan-500',
    },
    {
        status: 'OUT_FOR_DELIVERY',
        label: 'En cours de livraison',
        Icon: Navigation,
        color: 'bg-teal-500',
    },
    {
        status: 'DELIVERED',
        label: 'Livrée',
        Icon: Home,
        color: 'bg-green-500',
    },
];

const FINAL_STATUSES: Record<string, { label: string; Icon: React.ElementType; color: string }> = {
    RETURNED: {
        label: 'Retournée',
        Icon: RotateCcw,
        color: 'bg-orange-500',
    },
    CANCELLED: {
        label: 'Annulée',
        Icon: XCircle,
        color: 'bg-red-500',
    },
};

interface OrderStatusTimelineProps {
    currentStatus: OrderStatus;
    statusHistory?: any[];
    compact?: boolean;
}

export default function OrderStatusTimeline({
    currentStatus,
    statusHistory = [],
    compact = false,
}: OrderStatusTimelineProps) {
    // Vérifier si c'est un statut final (DELIVERED, RETURNED, CANCELLED)
    const isFinalStatus = ['DELIVERED', 'RETURNED', 'CANCELLED'].includes(currentStatus);
    const finalStatusInfo = FINAL_STATUSES[currentStatus];

    // Trouver l'index du statut actuel dans la timeline normale
    const currentIndex = TIMELINE_STEPS.findIndex(step => step.status === currentStatus);

    return (
        <div className="w-full">
            {/* Timeline normale */}
            {!isFinalStatus && (
                <div className={`flex ${compact ? 'gap-2' : 'gap-4'} items-center overflow-x-auto pb-4`}>
                    {TIMELINE_STEPS.map((step, index) => {
                        const isCompleted = index < currentIndex;
                        const isCurrent = step.status === currentStatus;
                        const isPending = index > currentIndex;

                        return (
                            <div key={step.status} className="flex items-center flex-shrink-0">
                                {/* Étape */}
                                <div className="flex flex-col items-center gap-2">
                                    {/* Icône */}
                                    <div
                                        className={`
                      ${compact ? 'w-10 h-10' : 'w-14 h-14'} 
                      rounded-full flex items-center justify-center
                      ${isCurrent ? step.color + ' ring-4 ring-offset-2 ring-offset-white ring-current scale-110' : ''}
                      ${isCompleted ? 'bg-green-500' : ''}
                      ${isPending ? 'bg-gray-200' : ''}
                      transition-all duration-300
                    `}
                                    >
                                        <step.Icon
                                            className={`
                        ${compact ? 'w-5 h-5' : 'w-7 h-7'} 
                        ${isCurrent || isCompleted ? 'text-white' : 'text-gray-400'}
                      `}
                                        />
                                    </div>

                                    {/* Label */}
                                    {!compact && (
                                        <span
                                            className={`
                        text-xs text-center max-w-[80px]
                        ${isCurrent ? 'font-bold text-gray-900' : ''}
                        ${isCompleted ? 'text-gray-600' : ''}
                        ${isPending ? 'text-gray-400' : ''}
                      `}
                                        >
                                            {step.label}
                                        </span>
                                    )}
                                </div>

                                {/* Ligne de connexion */}
                                {index < TIMELINE_STEPS.length - 1 && (
                                    <div
                                        className={`
                      ${compact ? 'w-8 h-1' : 'w-16 h-1'}
                      ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}
                      transition-colors duration-300
                    `}
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Statuts finaux */}
            {isFinalStatus && finalStatusInfo && (
                <div className="flex items-center justify-center gap-4 py-8">
                    <div
                        className={`
              ${finalStatusInfo.color}
              w-20 h-20 rounded-full flex items-center justify-center
              ring-4 ring-offset-4 ring-offset-white ring-current
            `}
                    >
                        <finalStatusInfo.Icon className="w-10 h-10 text-white" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900">{finalStatusInfo.label}</h3>
                        {statusHistory.length > 0 && (
                            <p className="text-sm text-gray-500 mt-1">
                                {new Date(statusHistory[statusHistory.length - 1].at).toLocaleDateString('fr-FR', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Historique détaillé (optionnel) */}
            {!compact && statusHistory.length > 0 && (
                <div className="mt-6 border-t pt-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Historique</h4>
                    <div className="space-y-2">
                        {statusHistory.map((entry: any, index: number) => (
                            <div key={index} className="flex items-start gap-3 text-sm">
                                <div className="w-2 h-2 rounded-full bg-gray-400 mt-1.5" />
                                <div className="flex-1">
                                    <span className="text-gray-600">
                                        {entry.from ? `${entry.from} → ` : ''}
                                        <strong>{entry.to}</strong>
                                    </span>
                                    {entry.note && (
                                        <p className="text-gray-500 text-xs mt-1">Note: {entry.note}</p>
                                    )}
                                    <p className="text-gray-400 text-xs">
                                        {new Date(entry.at).toLocaleString('fr-FR')}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
