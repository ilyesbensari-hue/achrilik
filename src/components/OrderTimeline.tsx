"use client";

interface OrderTimelineProps {
    status: string;
    createdAt: string;
    confirmedAt?: string;
    shippedAt?: string;
    deliveredAt?: string;
    deliveryType: 'DELIVERY' | 'CLICK_COLLECT';
}

export default function OrderTimeline({
    status,
    createdAt,
    confirmedAt,
    shippedAt,
    deliveredAt,
    deliveryType
}: OrderTimelineProps) {
    const steps = [
        {
            label: 'Commande passée',
            date: createdAt,
            completed: true
        },
        {
            label: 'Confirmée par le vendeur',
            date: confirmedAt,
            completed: ['CONFIRMED', 'READY', 'DELIVERED'].includes(status)
        },
        {
            label: 'En préparation',
            date: confirmedAt,
            completed: ['READY', 'DELIVERED'].includes(status),
            inProgress: status === 'CONFIRMED'
        },
        {
            label: deliveryType === 'CLICK_COLLECT' ? 'Prête à récupérer' : 'Expédiée',
            date: shippedAt,
            completed: status === 'DELIVERED',
            inProgress: status === 'READY'
        },
        {
            label: deliveryType === 'CLICK_COLLECT' ? 'Récupérée' : 'Livrée',
            date: deliveredAt,
            completed: status === 'DELIVERED'
        }
    ];

    return (
        <div className="space-y-4 relative">
            {steps.map((step, index) => (
                <div key={index} className="flex items-start gap-4 relative">
                    {/* Connector line */}
                    {index < steps.length - 1 && (
                        <div
                            className={`absolute left-4 top-8 w-0.5 h-12 ${step.completed ? 'bg-green-500' : 'bg-gray-200'
                                }`}
                            style={{ zIndex: 0 }}
                        />
                    )}

                    {/* Icon */}
                    <div
                        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm relative z-10 ${step.completed ? 'bg-green-500 text-white' :
                                step.inProgress ? 'bg-blue-500 text-white animate-pulse' :
                                    'bg-gray-200 text-gray-400'
                            }`}
                    >
                        {step.completed ? '✓' : step.inProgress ? '⏳' : index + 1}
                    </div>

                    {/* Content */}
                    <div className="flex-1 pb-4">
                        <p className={`font-medium ${step.completed ? 'text-gray-900' :
                                step.inProgress ? 'text-blue-600' :
                                    'text-gray-400'
                            }`}>
                            {step.label}
                        </p>
                        {step.date && (
                            <p className="text-sm text-gray-500 mt-1">
                                {new Date(step.date).toLocaleString('fr-FR', {
                                    day: '2-digit',
                                    month: 'short',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </p>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
