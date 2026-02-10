import dynamic from 'next/dynamic';

const LeafletAddressPicker = dynamic(
    () => import('@/components/LeafletAddressPicker'),
    {
        ssr: false,
        loading: () => <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center animate-pulse">Chargement de la carte...</div>
    }
);

const StoreMap = dynamic(() => import('@/components/StoreMap'), { ssr: false });

interface DeliveryStepProps {
    data: {
        deliveryMethod: 'DELIVERY' | 'PICKUP';
        address: string;
        city: string;
        wilaya: string;
        latitude: number | null;
        longitude: number | null;
    };
    errors: Record<string, string>;
    deliveryFee: number;
    deliveryFeeDetails: any;
    stores: any[];
    cart: any[];
    onChange: (field: string, value: any) => void;
    onBack: () => void;
    onNext: () => void;
}

export default function DeliveryStep({
    data,
    errors,
    deliveryFee,
    deliveryFeeDetails,
    stores,
    cart,
    onChange,
    onBack,
    onNext,
}: DeliveryStepProps) {
    // Check pickup availability
    const cartStoreIds = new Set(cart.map((item: any) => item.storeId).filter(Boolean));
    const relevantStores = stores.filter(store => cartStoreIds.has(store.id));
    const pickupAvailable = cartStoreIds.size > 0 && relevantStores.every(s => s.clickCollect !== false);

    const handleLocationSelect = (lat: number, lng: number, address: string) => {
        onChange('latitude', lat);
        onChange('longitude', lng);
        onChange('address', address);
    };

    const isComplete =
        data.deliveryMethod === 'PICKUP' ||
        (data.deliveryMethod === 'DELIVERY' && data.address && data.city);

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Delivery Method Selection */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <span>🚚</span> Mode de réception
                </h2>
                <p className="text-gray-600 text-sm mb-6">
                    Choisissez comment vous souhaitez recevoir votre commande
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                        onClick={() => onChange('deliveryMethod', 'DELIVERY')}
                        className={`p-6 rounded-xl border-2 font-bold transition-all text-left ${data.deliveryMethod === 'DELIVERY'
                                ? 'border-[#006233] bg-green-50 text-[#006233] shadow-md scale-105'
                                : 'border-gray-200 hover:border-gray-300 text-gray-700'
                            }`}
                    >
                        <div className="text-3xl mb-2">📦</div>
                        <div className="text-lg">Livraison à domicile</div>
                        <div className="text-sm font-normal text-gray-600 mt-1">
                            À Oran uniquement • {deliveryFee} DA
                        </div>
                    </button>

                    <button
                        onClick={() => pickupAvailable && onChange('deliveryMethod', 'PICKUP')}
                        disabled={!pickupAvailable}
                        className={`p-6 rounded-xl border-2 font-bold transition-all text-left relative ${data.deliveryMethod === 'PICKUP'
                                ? 'border-[#006233] bg-green-50 text-[#006233] shadow-md scale-105'
                                : 'border-gray-200 hover:border-gray-300 text-gray-700'
                            } ${!pickupAvailable ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''}`}
                    >
                        <div className="text-3xl mb-2">🏪</div>
                        <div className="text-lg">Retrait en boutique</div>
                        <div className="text-sm font-normal text-gray-600 mt-1">
                            {pickupAvailable ? 'Gratuit • Click & Collect' : 'Non disponible pour votre panier'}
                        </div>
                        {!pickupAvailable && (
                            <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                                Indisponible
                            </div>
                        )}
                    </button>
                </div>

                {/* Multi-Vendor Warning */}
                {!pickupAvailable && cartStoreIds.size > 1 && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-500 p-5 mt-6 rounded-r-xl">
                        <div className="flex items-start gap-3">
                            <span className="text-2xl flex-shrink-0">💡</span>
                            <div className="flex-1">
                                <h4 className="font-bold text-yellow-900 mb-2">
                                    Conseil: Économisez sur la livraison !
                                </h4>
                                <p className="text-sm text-yellow-800 mb-2">
                                    ⚠️ Votre panier contient des articles de <strong>{cartStoreIds.size} magasins différents</strong>.
                                    Le retrait en boutique n'est pas disponible pour tous vos articles.
                                </p>
                                <div className="bg-white/70 p-3 rounded-lg border border-yellow-200">
                                    <p className="text-sm font-semibold text-yellow-900 mb-1">💰 Astuce :</p>
                                    <p className="text-xs text-yellow-800">
                                        Passez deux commandes séparées (une par magasin) pour bénéficier du Click & Collect GRATUIT où disponible.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* DELIVERY Form */}
            {data.deliveryMethod === 'DELIVERY' && (
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-900 mb-4 text-lg flex items-center gap-2">
                        <span>📍</span> Adresse de livraison à Oran
                    </h3>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
                        <p className="text-sm text-blue-800">
                            ℹ️ <strong>Livraison uniquement à Oran</strong> pour le moment
                        </p>
                    </div>

                    <div className="space-y-5">
                        {/* Address */}
                        <div>
                            <label className="text-sm font-bold text-gray-700 mb-2 block">
                                Adresse complète <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="address"
                                value={data.address}
                                onChange={(e) => onChange('address', e.target.value)}
                                placeholder="Ex: Cité 123 logts, Bâtiment A, Appartement 5..."
                                className={`w-full px-4 py-3 rounded-lg border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-[#006233]/20 ${errors.address
                                        ? 'border-red-500 bg-red-50'
                                        : 'border-gray-200 focus:border-[#006233]'
                                    }`}
                                data-has-error={!!errors.address}
                            />
                            {errors.address && (
                                <p className="text-red-600 text-sm mt-2 flex items-center gap-1.5">
                                    <span>⚠️</span> {errors.address}
                                </p>
                            )}
                        </div>

                        {/* City */}
                        <div>
                            <label className="text-sm font-bold text-gray-700 mb-2 block">
                                Commune (Oran) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="city"
                                value={data.city}
                                onChange={(e) => onChange('city', e.target.value)}
                                placeholder="Ex: Es Senia, Bir El Djir, Oran Centre..."
                                className={`w-full px-4 py-3 rounded-lg border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-[#006233]/20 ${errors.city
                                        ? 'border-red-500 bg-red-50'
                                        : 'border-gray-200 focus:border-[#006233]'
                                    }`}
                                data-has-error={!!errors.city}
                            />
                            {errors.city && (
                                <p className="text-red-600 text-sm mt-2 flex items-center gap-1.5">
                                    <span>⚠️</span> {errors.city}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* GPS Map Picker */}
                    <div className="mt-6">
                        <label className="text-sm font-bold text-gray-700 mb-3 block">
                            📍 Pointez votre adresse exacte (Optionnel)
                        </label>
                        <p className="text-xs text-gray-600 mb-3">
                            Cliquez sur la carte pour indiquer votre position exacte. Cela aide le livreur à vous trouver plus facilement.
                        </p>
                        <LeafletAddressPicker
                            onLocationSelect={(loc) => handleLocationSelect(
                                loc.coordinates.lat,
                                loc.coordinates.lng,
                                loc.address
                            )}
                            initialLat={data.latitude || undefined}
                            initialLng={data.longitude || undefined}
                        />
                        {data.latitude && data.longitude && (
                            <div className="mt-3 text-xs text-green-700 bg-green-50 p-3 rounded-lg border border-green-200 flex items-start gap-2">
                                <span className="text-lg">✅</span>
                                <div>
                                    <strong>Position confirmée</strong><br />
                                    Coordonnées: {data.latitude.toFixed(6)}, {data.longitude.toFixed(6)}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Delivery Fee Info */}
                    <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between">
                            <span className="font-semibold text-gray-700">Frais de livraison estimés :</span>
                            <span className="text-xl font-bold text-[#006233]">{deliveryFee} DA</span>
                        </div>
                        {deliveryFeeDetails?.hasOutsideOranProducts && (
                            <p className="text-xs text-amber-700 mt-2">
                                ⚠️ Certains produits sont stockés hors Oran. Les frais ont été ajustés.
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* PICKUP Map & Info */}
            {data.deliveryMethod === 'PICKUP' && (
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-900 mb-4 text-lg flex items-center gap-2">
                        <span>📍</span> Points de retrait
                    </h3>

                    <div className="bg-yellow-50 p-4 rounded-xl text-yellow-800 text-sm mb-6 border border-yellow-100">
                        <p className="font-semibold mb-1">ℹ️ Récupération en boutique</p>
                        <p className="text-xs">
                            Vous devrez récupérer votre commande directement chez le(s) vendeur(s) ci-dessous.
                            Pensez à apporter une pièce d'identité.
                        </p>
                    </div>

                    {/* Map */}
                    <div className="h-80 rounded-xl overflow-hidden border-2 border-gray-200 mb-6">
                        {relevantStores.length > 0 ? (
                            <StoreMap
                                stores={relevantStores.filter(s => s.clickCollect !== false)}
                                showExact={true}
                            />
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-400 bg-gray-50">
                                Chargement de la carte...
                            </div>
                        )}
                    </div>

                    {/* Store List */}
                    <div className="space-y-3">
                        <h4 className="font-bold text-gray-700 text-sm">Boutiques concernées :</h4>
                        {relevantStores.map(store => (
                            <div key={store.id} className="flex justify-between items-center bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <div>
                                    <p className="font-bold text-gray-900">{store.name}</p>
                                    <p className="text-sm text-gray-600 mt-1">📍 {store.wilaya}</p>
                                </div>
                                <a
                                    href={`https://www.google.com/maps?q=${store.latitude},${store.longitude}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[#006233] hover:underline font-semibold text-sm flex items-center gap-1"
                                >
                                    Itinéraire →
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-4">
                <button
                    onClick={onBack}
                    className="px-6 py-3 rounded-xl font-bold text-gray-700 bg-white border-2 border-gray-200 hover:border-gray-300 transition-all flex items-center gap-2"
                >
                    <span className="text-xl">←</span>
                    Retour
                </button>

                <button
                    onClick={onNext}
                    disabled={!isComplete}
                    className={`px-8 py-4 rounded-xl font-bold text-lg transition-all flex items-center gap-2 ${isComplete
                            ? 'bg-[#006233] text-white hover:bg-[#00753D] shadow-lg hover:shadow-xl'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                >
                    Continuer
                    <span className="text-xl">→</span>
                </button>
            </div>
        </div>
    );
}
