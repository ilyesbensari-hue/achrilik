import Image from 'next/image';

interface ConfirmationStepProps {
    data: {
        email: string;
        prenom: string;
        nom: string;
        telephone: string;
        deliveryMethod: 'DELIVERY' | 'PICKUP';
        address: string;
        city: string;
        wilaya: string;
        paymentMethod: 'CASH' | 'CIB' | 'DAHABIA';
    };
    cart: any[];
    total: number;
    deliveryFee: number;
    deliveryFeeDetails: any;
    isSubmitting: boolean;
    onBack: () => void;
    onSubmit: () => void;
    onEditContact: () => void;
    onEditDelivery: () => void;
    onPaymentChange: (method: 'CASH' | 'CIB' | 'DAHABIA') => void;
}

export default function ConfirmationStep({
    data,
    cart,
    total,
    deliveryFee,
    deliveryFeeDetails,
    isSubmitting,
    onBack,
    onSubmit,
    onEditContact,
    onEditDelivery,
    onPaymentChange,
}: ConfirmationStepProps) {
    const finalTotal = data.deliveryMethod === 'DELIVERY' ? total + deliveryFee : total;

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Contact Summary */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative">
                <button
                    onClick={onEditContact}
                    className="absolute top-4 right-4 text-[#006233] text-sm font-bold hover:underline flex items-center gap-1 bg-green-50 px-3 py-1.5 rounded-full shadow-sm transition-all hover:shadow-md"
                >
                    ✏️ Modifier
                </button>

                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900">
                    <span>👤</span> Informations de contact
                </h3>

                <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg">
                        <span className="text-gray-600 w-24">Nom :</span>
                        <span className="font-semibold text-gray-900">{data.prenom} {data.nom}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg">
                        <span className="text-gray-600 w-24">Email :</span>
                        <span className="font-semibold text-gray-900">{data.email}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg">
                        <span className="text-gray-600 w-24">Téléphone :</span>
                        <span className="font-semibold text-gray-900">{data.telephone}</span>
                    </div>
                </div>
            </div>

            {/* Delivery Summary */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative">
                <button
                    onClick={onEditDelivery}
                    className="absolute top-4 right-4 text-[#006233] text-sm font-bold hover:underline flex items-center gap-1 bg-green-50 px-3 py-1.5 rounded-full shadow-sm transition-all hover:shadow-md"
                >
                    ✏️ Modifier
                </button>

                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900">
                    <span>{data.deliveryMethod === 'DELIVERY' ? '🚚' : '🏪'}</span> Mode de réception
                </h3>

                <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg">
                        <span className="text-gray-600 w-24">Mode :</span>
                        <span className="font-semibold text-gray-900">
                            {data.deliveryMethod === 'DELIVERY' ? 'Livraison à domicile' : 'Retrait en boutique (Click & Collect)'}
                        </span>
                    </div>

                    {data.deliveryMethod === 'DELIVERY' && (
                        <>
                            <div className="flex items-start gap-2 bg-gray-50 p-3 rounded-lg">
                                <span className="text-gray-600 w-24">Adresse :</span>
                                <span className="font-semibold text-gray-900 flex-1">
                                    {data.address}, {data.city}, {data.wilaya}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg">
                                <span className="text-gray-600 w-24">Frais :</span>
                                <span className="font-semibold text-[#006233]">{deliveryFee} DA</span>
                            </div>
                            {deliveryFeeDetails?.hasOutsideOranProducts && (
                                <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded border border-amber-200">
                                    ⚠️ Certains produits sont stockés hors Oran
                                </p>
                            )}
                        </>
                    )}

                    {data.deliveryMethod === 'PICKUP' && (
                        <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                            <p className="text-sm text-green-800">
                                ✅ <strong>Gratuit</strong> - Récupération directement en boutique
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900">
                    <span>🛒</span> Résumé de la commande
                </h3>

                <div className="space-y-3 mb-6 max-h-72 overflow-y-auto pr-2">
                    {cart.map((item, idx) => (
                        <div key={idx} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-16 h-16 bg-white rounded-lg border border-gray-200 flex-shrink-0 overflow-hidden">
                                <Image
                                    src={item.image}
                                    alt={item.title}
                                    width={64}
                                    height={64}
                                    className="object-cover"
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-sm text-gray-900 truncate">{item.title}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {item.quantity}x • {item.size} / {item.color}
                                </p>
                                <p className="text-sm font-semibold text-[#006233] mt-1">
                                    {(item.price * item.quantity).toLocaleString()} DA
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="border-t-2 border-gray-200 pt-4 space-y-3">
                    <div className="flex justify-between py-2 text-sm">
                        <span className="text-gray-600">Sous-total</span>
                        <span className="font-semibold text-gray-900">{total.toLocaleString()} DA</span>
                    </div>

                    {data.deliveryMethod === 'DELIVERY' && (
                        <div className="flex justify-between py-2 text-sm">
                            <span className="text-gray-600">Frais de livraison</span>
                            <span className="font-semibold text-gray-900">{deliveryFee.toLocaleString()} DA</span>
                        </div>
                    )}

                    <div className="flex justify-between py-3 border-t-2 border-gray-200">
                        <span className="text-lg font-bold text-gray-900">Total</span>
                        <span className="text-2xl font-black text-[#006233]">
                            {finalTotal.toLocaleString()} DA
                        </span>
                    </div>
                </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900">
                    <span>💳</span> Mode de paiement
                </h3>

                <div className="space-y-3">
                    <label
                        className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${data.paymentMethod === 'CASH'
                                ? 'border-[#006233] bg-green-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                    >
                        <input
                            type="radio"
                            name="payment"
                            value="CASH"
                            checked={data.paymentMethod === 'CASH'}
                            onChange={() => onPaymentChange('CASH')}
                            className="w-5 h-5 text-[#006233]"
                        />
                        <div className="flex-1">
                            <span className="font-bold text-gray-900 block">
                                Paiement à la {data.deliveryMethod === 'DELIVERY' ? 'livraison' : 'retrait'}
                            </span>
                            <span className="text-xs text-gray-500">Espèces uniquement</span>
                        </div>
                    </label>

                    <label className="flex items-center gap-4 p-4 rounded-xl border-2 transition-all opacity-50 cursor-not-allowed bg-gray-50">
                        <input type="radio" disabled className="w-5 h-5" />
                        <div className="flex-1">
                            <span className="font-bold text-gray-400 block">Carte CIB</span>
                            <span className="text-xs text-orange-600 font-semibold">🚧 Bientôt disponible</span>
                        </div>
                        <div className="bg-gray-200 h-8 w-12 rounded flex items-center justify-center text-[10px] font-bold text-gray-400">
                            CIB
                        </div>
                    </label>

                    <label className="flex items-center gap-4 p-4 rounded-xl border-2 transition-all opacity-50 cursor-not-allowed bg-gray-50">
                        <input type="radio" disabled className="w-5 h-5" />
                        <div className="flex-1">
                            <span className="font-bold text-gray-400 block">Carte Edahabia</span>
                            <span className="text-xs text-orange-600 font-semibold">🚧 Bientôt disponible</span>
                        </div>
                        <div className="bg-gray-200 h-8 w-12 rounded flex items-center justify-center text-[10px] font-bold text-gray-400">
                            GOLD
                        </div>
                    </label>
                </div>
            </div>

            {/* Final Confirmation Banner */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
                <div className="flex items-start gap-4">
                    <span className="text-3xl flex-shrink-0">✅</span>
                    <div className="flex-1">
                        <h4 className="font-bold text-blue-900 mb-2 text-lg">
                            Prêt à confirmer votre commande ?
                        </h4>
                        <p className="text-sm text-blue-800 mb-3">
                            Vérifiez bien toutes les informations ci-dessus. Une fois la commande confirmée,
                            vous recevrez un email de confirmation à <strong>{data.email}</strong>.
                        </p>
                        <div className="bg-white/70 p-3 rounded-lg border border-blue-200">
                            <p className="text-xs text-blue-900">
                                <strong>📞 Contact:</strong> {data.telephone}<br />
                                {data.deliveryMethod === 'DELIVERY' && (
                                    <><strong>📍 Livraison:</strong> {data.address}, {data.city}</>
                                )}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-4">
                <button
                    onClick={onBack}
                    disabled={isSubmitting}
                    className="px-6 py-3 rounded-xl font-bold text-gray-700 bg-white border-2 border-gray-200 hover:border-gray-300 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <span className="text-xl">←</span>
                    Retour
                </button>

                <button
                    onClick={onSubmit}
                    disabled={isSubmitting}
                    className={`px-10 py-5 rounded-xl font-black text-xl transition-all flex items-center gap-3 ${isSubmitting
                            ? 'bg-gray-400 text-white cursor-not-allowed'
                            : 'bg-[#006233] text-white hover:bg-[#00753D] shadow-2xl hover:shadow-3xl hover:scale-105'
                        }`}
                >
                    {isSubmitting ? (
                        <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                            TRAITEMENT...
                        </>
                    ) : (
                        <>
                            ✓ CONFIRMER LA COMMANDE
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
