import Image from 'next/image';

interface CartSummaryProps {
    cart: any[];
    total: number;
    deliveryFee: number;
    deliveryMethod: 'DELIVERY' | 'PICKUP';
    currentStep: 1 | 2 | 3;
}

export default function CartSummary({
    cart,
    total,
    deliveryFee,
    deliveryMethod,
    currentStep,
}: CartSummaryProps) {
    const finalTotal = deliveryMethod === 'DELIVERY' ? total + deliveryFee : total;
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 sticky top-24">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>🛒</span> Votre panier ({itemCount} article{itemCount > 1 ? 's' : ''})
            </h3>

            <div className="space-y-3 mb-6 max-h-60 overflow-y-auto pr-2">
                {cart.map((item, idx) => (
                    <div key={idx} className="flex gap-3">
                        <div className="w-14 h-14 bg-white rounded-lg border border-gray-300 flex-shrink-0 overflow-hidden">
                            <Image
                                src={item.image}
                                alt={item.title}
                                width={56}
                                height={56}
                                className="object-cover"
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-gray-900 truncate leading-tight">
                                {item.title}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                {item.quantity}x • {item.size}
                            </p>
                            <p className="text-sm font-bold text-[#006233] mt-1">
                                {(item.price * item.quantity).toLocaleString()} DA
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="border-t border-gray-300 pt-4 space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                    <span>Sous-total</span>
                    <span className="font-semibold">{total.toLocaleString()} DA</span>
                </div>

                {currentStep >= 2 && deliveryMethod === 'DELIVERY' && (
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>Livraison</span>
                        <span className="font-semibold">{deliveryFee.toLocaleString()} DA</span>
                    </div>
                )}

                {currentStep >= 2 && deliveryMethod === 'PICKUP' && (
                    <div className="flex justify-between text-sm text-green-600">
                        <span>Click & Collect</span>
                        <span className="font-bold">GRATUIT ✓</span>
                    </div>
                )}

                <div className="flex justify-between text-lg font-bold border-t-2 border-gray-300 pt-3 mt-3">
                    <span className="text-gray-900">Total</span>
                    <span className="text-[#006233]">{finalTotal.toLocaleString()} DA</span>
                </div>
            </div>

            {/* Step Indicator */}
            <div className="mt-6 bg-white p-4 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-600 mb-2">Progression:</p>
                <div className="flex items-center gap-2">
                    {[1, 2, 3].map((step) => (
                        <div
                            key={step}
                            className={`h-2 flex-1 rounded-full transition-all ${step <= currentStep ? 'bg-[#006233]' : 'bg-gray-200'
                                }`}
                        />
                    ))}
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center font-semibold">
                    Étape {currentStep}/3
                </p>
            </div>

            {/* Security Badge */}
            <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-xs text-green-800 flex items-center gap-2">
                    <span className="text-base">🔒</span>
                    <span><strong>Paiement sécurisé</strong> • Vos données sont protégées</span>
                </p>
            </div>
        </div>
    );
}
