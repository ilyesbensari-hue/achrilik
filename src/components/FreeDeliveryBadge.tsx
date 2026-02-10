import { Truck, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

interface FreeDeliveryBadgeProps {
    threshold?: number | null;
    size?: 'sm' | 'md';
    variant?: 'card' | 'product-page';
    currentAmount?: number;
    storeName?: string;
    storeId?: string;
}

export default function FreeDeliveryBadge({
    threshold,
    size = 'md',
    variant = 'card',
    currentAmount,
    storeName,
    storeId
}: FreeDeliveryBadgeProps) {
    // Card variant (homepage, categories, search)
    if (variant === 'card') {
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

    // Product page variant (incentive messaging)
    if (variant === 'product-page' && currentAmount !== undefined) {
        const thresholdAmount = threshold || 0;
        const isQualified = currentAmount >= thresholdAmount;
        const missing = thresholdAmount - currentAmount;
        const progress = thresholdAmount > 0 ? Math.min((currentAmount / thresholdAmount) * 100, 100) : 100;

        // Case A: Product qualifies for free delivery
        if (isQualified || thresholdAmount === 0) {
            return (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-500 rounded-lg p-5 mb-4 shadow-sm">
                    <div className="flex items-start gap-3">
                        <div className="bg-green-500 rounded-full p-2.5 flex-shrink-0">
                            <Truck className="h-6 w-6 text-white" strokeWidth={2.5} />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-green-700 mb-1 flex items-center gap-2">
                                ✅ LIVRAISON GRATUITE
                            </h3>
                            <p className="text-base font-semibold text-green-600 mb-2">
                                🎉 Félicitations ! Vous avez la livraison offerte avec ce produit !
                            </p>
                            {thresholdAmount > 0 && (
                                <p className="text-sm text-gray-700 bg-white/60 inline-block px-3 py-1.5 rounded-full">
                                    ✓ Livraison gratuite à partir de <span className="font-bold">{thresholdAmount.toLocaleString('fr-DZ')} DA</span>
                                </p>
                            )}
                            {storeName && (
                                <p className="text-xs text-gray-600 mt-2">
                                    Boutique : <span className="font-semibold">{storeName}</span>
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            );
        }

        // Case B: Product doesn't qualify yet - show incentive
        return (
            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-400 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                    <div className="bg-orange-500 rounded-full p-2 flex-shrink-0">
                        <Truck className="h-6 w-6 text-white" strokeWidth={2.5} />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-orange-700 mb-1">
                            🚚 Livraison GRATUITE possible
                        </h3>
                        <p className="text-sm text-orange-600 mb-3">
                            <strong>📦 Ajoutez seulement {missing.toLocaleString('fr-DZ')} DA</strong>
                            {storeName && ` d'autres produits de ${storeName}`}
                        </p>

                        {/* Progress bar */}
                        <div className="mb-3">
                            <div className="flex justify-between text-xs text-gray-600 mb-1">
                                <span>{currentAmount.toLocaleString('fr-DZ')} DA</span>
                                <span className="font-bold">{progress.toFixed(0)}%</span>
                                <span>{thresholdAmount.toLocaleString('fr-DZ')} DA</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                <div
                                    className="bg-gradient-to-r from-orange-500 to-yellow-500 h-full rounded-full transition-all duration-500 ease-out"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>

                        {/* CTA to store */}
                        {storeId && storeName && (
                            <Link
                                href={`/stores/${storeId}`}
                                className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-md hover:shadow-lg"
                            >
                                <ShoppingBag className="h-4 w-4" />
                                Voir boutique {storeName}
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return null;
}
