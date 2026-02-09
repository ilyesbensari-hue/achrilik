import { Truck } from 'lucide-react';

interface FreeDeliveryBadgeProps {
    threshold?: number | null;
    size?: 'sm' | 'md';
}

export default function FreeDeliveryBadge({ threshold, size = 'md' }: FreeDeliveryBadgeProps) {
    const sizeClasses = {
        sm: 'px-2 py-0.5 text-[10px]',
        md: 'px-3 py-1 text-xs'
    };

    const iconSize = size === 'sm' ? 10 : 12;

    return (
        <div className={`inline-flex items-center gap-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full font-bold shadow-sm ${sizeClasses[size]}`}>
            <Truck className={`h-${iconSize} w-${iconSize}`} strokeWidth={2.5} />
            <span>
                {threshold && threshold > 0
                    ? `Gratuit dès ${threshold.toLocaleString('fr-DZ')} DA`
                    : 'Livraison Gratuite'
                }
            </span>
        </div>
    );
}
