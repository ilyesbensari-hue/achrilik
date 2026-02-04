"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import Image from 'next/image';

const StoreMap = dynamic(() => import('@/components/StoreMap'), { ssr: false });
const MapAddressPicker = dynamic(() => import('@/components/MapAddressPicker'), { ssr: false });

interface CheckoutClientProps {
    initialUser: any;
}

export default function CheckoutClient({ initialUser }: CheckoutClientProps) {
    const [cart, setCart] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [deliveryMethod, setDeliveryMethod] = useState<'DELIVERY' | 'PICKUP'>('DELIVERY');
    const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CIB' | 'DAHABIA'>('CASH');
    const [stores, setStores] = useState<any[]>([]);

    // User Details - Extended avec email, prenom, nom, GPS
    const [formData, setFormData] = useState({
        email: '',
        prenom: '',
        nom: '',
        telephone: '',
        wilaya: '',
        city: '',
        address: '',
        latitude: null as number | null,
        longitude: null as number | null
    });



    useEffect(() => {
        // Load Cart
        const storedCart = JSON.parse(localStorage.getItem('cart') || '[]');
        setCart(storedCart);
        const t = storedCart.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
        setTotal(t);

        // Pre-fill from initialUser
        if (initialUser) {
            const [prenom, ...nomParts] = (initialUser.name || '').split(' ');
            setFormData({
                email: initialUser.email || '',
                prenom: prenom || '',
                nom: nomParts.join(' ') || '',
                telephone: initialUser.phone || '',
                wilaya: initialUser.wilaya || '',
                city: initialUser.city || '',
                address: initialUser.address || '',
                latitude: null,
                longitude: null
            });
        }

        // Fetch Stores
        fetch('/api/stores/locations')
            .then(res => res.json())
            .then(data => setStores(data))
            .catch(e => console.error(e));
    }, [initialUser]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    /**
     * Handler pour onBlur - validation au départ du champ (retiré temporarily)
     */
    const handleFieldBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        // Validation disabled for now
    };

    /**
     * Handler pour sélection GPS depuis MapAddressPicker
     */
    const handleLocationSelect = (lat: number, lng: number, address: string) => {
        setFormData(prev => ({
            ...prev,
            latitude: lat,
            longitude: lng,
            address: address // Auto-fill depuis reverse geocoding
        }));
    };

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Basic validation
            if (!formData.email || !formData.prenom || !formData.nom || !formData.telephone) {
                alert('⚠️ Veuillez remplir tous les champs obligatoires');
                setIsSubmitting(false);
                return;
            }

            if (deliveryMethod === 'DELIVERY' && (!formData.address || !formData.wilaya || !formData.city)) {
                alert('⚠️ Veuillez remplir l\'adresse de livraison complète');
                setIsSubmitting(false);
                return;
            }

            // GPS warning if not provided
            if (deliveryMethod === 'DELIVERY' && (!formData.latitude || !formData.longitude)) {
                const confirmWithoutGPS = confirm(
                    '⚠️ Position GPS non trouvée.\n\n' +
                    'Votre commande sera traitée avec l\'adresse textuelle uniquement.\n' +
                    'Cela peut rallonger le délai de livraison.\n\n' +
                    'Continuer sans GPS ?'
                );
                if (!confirmWithoutGPS) {
                    setIsSubmitting(false);
                    return;
                }
            }

            // Create order
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: initialUser.id,
                    cart,
                    deliveryMethod,
                    paymentMethod,
                    name: `${formData.prenom} ${formData.nom}`.trim(),
                    phone: formData.telephone,
                    email: formData.email,
                    address: formData.address,
                    wilaya: formData.wilaya,
                    city: formData.city,
                    deliveryLatitude: formData.latitude,
                    deliveryLongitude: formData.longitude
                })
            });

            const data = await res.json();

            if (!res.ok) {
                console.error('Order failed:', data);
                throw new Error(data.error || 'Erreur lors de la commande');
            }

            // Success!
            alert("✅ Commande confirmée avec succès ! Vous allez être redirigé vers vos commandes.");

            // Clear Cart
            localStorage.removeItem('cart');

            // 6. Redirect
            window.location.href = '/profile';

        } catch (error: any) {
            console.error('Submit error:', error);
            alert(error.message || "Une erreur est survenue. Veuillez réessayer.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (cart.length === 0) {
        return (
            <div className="container py-20 text-center">
                <h2 className="text-2xl font-bold mb-4">Votre panier est vide</h2>
                <Link href="/" className="btn btn-primary">Continuer vos achats</Link>
            </div>
        );
    }

    // Filter stores that are actually in the cart?
    // If we assume the cart items belong to stores, we ideally want to check if ANY store allows pickup.
    // Since we don't have storeId on items confirmed in this snippet (it says item.storeId in line 68), let's proceed.
    const cartStoreIds = new Set(cart.map(item => item.storeId));

    // Filter stores:
    // 1. Must be in the list of fetched stores (valid locations)
    // 2. Must be one of the stores in the cart
    const relevantStores = stores.filter(s => cartStoreIds.has(s.id));

    // Check availability of Pickup
    // Pickup is available if AT LEAST ONE relevant store supports it (or if logic demands ALL, let's say ALL for simplicity of one shipment)
    // ACTUALLY: If I buy from Store A (online only) and Store B (physical), can I pick up B? Yes.
    // So Pickup is disabled only if NO relevant stores support it? 
    // OR: If I want "Pickup", I must be able to pick up ALL?
    // Let's assume for this MVP: You can only select "Pickup" if ALL items in cart are from stores that support it.
    // This avoids "Partial Delivery / Partial Pickup" complexity.
    const pickupAvailable = relevantStores.length > 0 && relevantStores.every(s => s.clickCollect !== false);

    return (
        <div className="container py-10 max-w-4xl mx-auto">
            <h1 className="text-3xl font-black text-gray-900 mb-8">Finaliser la commande</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* LEFT COLUMN: Options */}
                <div className="space-y-8">

                    {/* User Info Confirmation */}
                    {initialUser && (
                        <section className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl shadow-sm border-2 border-green-200">
                            <h2 className="text-lg font-bold mb-3 flex items-center gap-2 text-gray-900">
                                <span>✅</span> Vos informations
                            </h2>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2 bg-white/60 p-3 rounded-lg">
                                    <span className="text-gray-600">📧 Email:</span>
                                    <span className="font-semibold text-gray-900">{formData.email || initialUser.email}</span>
                                </div>
                                <div className="flex items-center gap-2 bg-white/60 p-3 rounded-lg">
                                    <span className="text-gray-600">📱 Téléphone:</span>
                                    <span className="font-semibold text-gray-900">{formData.telephone || initialUser.phone || 'Non renseigné'}</span>
                                </div>
                                {formData.address && (
                                    <div className="flex items-start gap-2 bg-white/60 p-3 rounded-lg">
                                        <span className="text-gray-600">📍 Adresse:</span>
                                        <span className="font-semibold text-gray-900 flex-1">
                                            {formData.address}, {formData.city}, {formData.wilaya}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <p className="text-xs text-gray-600 mt-3 italic">
                                Ces informations seront utilisées pour votre commande
                            </p>
                        </section>
                    )}

                    {/* 1. Mode de Livraison */}
                    <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <span>🚚</span> Mode de réception
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setDeliveryMethod('DELIVERY')}
                                className={`p-4 rounded-xl border-2 font-bold transition-all ${deliveryMethod === 'DELIVERY'
                                    ? 'border-[#006233] bg-green-50 text-[#006233]'
                                    : 'border-gray-100 hover:border-gray-200 text-gray-600'}`}
                            >
                                Livraison à domicile
                            </button>
                            <button
                                onClick={() => pickupAvailable && setDeliveryMethod('PICKUP')}
                                disabled={!pickupAvailable}
                                className={`p-4 rounded-xl border-2 font-bold transition-all relative ${deliveryMethod === 'PICKUP'
                                    ? 'border-[#006233] bg-green-50 text-[#006233]'
                                    : 'border-gray-100 hover:border-gray-200 text-gray-600'}
                                    ${!pickupAvailable ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''}`}
                            >
                                Retrait en boutique
                                {!pickupAvailable && (
                                    <span className="block text-xs text-red-500 font-normal mt-1">Non disponible</span>
                                )}
                            </button>
                        </div>

                        {/* Multi-Vendor Warning */}
                        {!pickupAvailable && cartStoreIds.size > 1 && (
                            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mt-4 rounded-r-lg animate-fade-in">
                                <div className="flex items-start gap-3">
                                    <span className="text-2xl flex-shrink-0">💡</span>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-yellow-900 mb-1">
                                            Conseil: Économisez sur la livraison !
                                        </h4>
                                        <p className="text-sm text-yellow-800 leading-relaxed">
                                            ⚠️ Votre panier contient des articles de <strong>{cartStoreIds.size} magasins différents</strong>.
                                            Le retrait en boutique n'est pas disponible pour tous vos articles.
                                        </p>
                                        <div className="mt-3 bg-white/50 p-3 rounded-lg border border-yellow-200">
                                            <p className="text-sm font-semibold text-yellow-900 mb-1">💰 Astuce pour économiser 500 DA :</p>
                                            <p className="text-xs text-yellow-800">
                                                Passez <strong>deux commandes séparées</strong> - une pour chaque magasin.
                                                Vous pourrez ainsi choisir le <strong>Click & Collect GRATUIT</strong> pour les articles éligibles
                                                et payer la livraison uniquement pour les autres.
                                            </p>
                                        </div>
                                        <p className="text-xs text-yellow-700 mt-2 italic">
                                            💳 Vous pouvez vider votre panier, commander les articles d'un magasin,
                                            puis revenir faire une nouvelle commande avec les articles de l'autre magasin.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Delivery Form */}
                        {deliveryMethod === 'DELIVERY' && (
                            <div className="mt-6 space-y-4 animate-fade-in">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-bold text-gray-700 mb-1 block">Prénom</label>
                                        <input
                                            type="text"
                                            name="prenom"
                                            value={formData.prenom}
                                            onChange={handleChange}
                                            onBlur={handleFieldBlur}
                                            className="w-full rounded-lg border-gray-300"
                                            placeholder="Ahmed"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-bold text-gray-700 mb-1 block">Nom</label>
                                        <input
                                            type="text"
                                            name="nom"
                                            value={formData.nom}
                                            onChange={handleChange}
                                            onBlur={handleFieldBlur}
                                            className="w-full rounded-lg border-gray-300"
                                            placeholder="Benali"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-bold text-gray-700 mb-1 block">Email</label>
                                        <input type="email" name="email" value={formData.email} onChange={handleChange} onBlur={handleFieldBlur} className="w-full rounded-lg border-gray-300" placeholder="exemple@email.com" required />
                                    </div>
                                    <div>
                                        <label className="text-sm font-bold text-gray-700 mb-1 block flex items-center gap-1.5">
                                            Téléphone
                                            {formData.telephone && (
                                                <span className="text-xs font-normal text-green-600">✓ Confirmé depuis inscription</span>
                                            )}
                                        </label>
                                        <input
                                            type="tel"
                                            name="telephone"
                                            value={formData.telephone}
                                            readOnly
                                            className="w-full rounded-lg border-gray-300 bg-gray-50 cursor-not-allowed font-medium text-gray-700"
                                            placeholder="Ex: 0661234567"
                                            title="Numéro pré-rempli depuis votre inscription"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-gray-700 mb-1 block">Adresse</label>
                                    <input type="text" name="address" value={formData.address} onChange={handleChange} onBlur={handleFieldBlur} className="w-full rounded-lg border-gray-300" placeholder="Cité 123 logts..." required />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-bold text-gray-700 mb-1 block">Wilaya</label>
                                        <input type="text" name="wilaya" value={formData.wilaya} onChange={handleChange} onBlur={handleFieldBlur} className="w-full rounded-lg border-gray-300" placeholder="Oran" required />
                                    </div>
                                    <div>
                                        <label className="text-sm font-bold text-gray-700 mb-1 block">Commune</label>
                                        <input type="text" name="city" value={formData.city} onChange={handleChange} onBlur={handleFieldBlur} className="w-full rounded-lg border-gray-300" placeholder="Es Senia" required />
                                    </div>
                                </div>

                                {/* GPS Map Picker - NOUVEAU */}
                                <div className="mt-6">
                                    <label className="text-sm font-bold text-gray-700 mb-2 block">
                                        📍 Pointez votre adresse exacte sur la carte *
                                    </label>
                                    <MapAddressPicker
                                        onLocationSelect={handleLocationSelect}
                                        initialLat={formData.latitude || undefined}
                                        initialLng={formData.longitude || undefined}
                                    />
                                    {formData.latitude && formData.longitude && (
                                        <div className="mt-3 text-xs text-green-700 bg-green-50 p-3 rounded-lg border border-green-200 flex items-start gap-2">
                                            <span className="text-lg">✅</span>
                                            <div>
                                                <strong>Position confirmée</strong><br />
                                                Coordonnées: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Pickup Map */}
                        {deliveryMethod === 'PICKUP' && (
                            <div className="mt-6 animate-fade-in">
                                <div className="bg-yellow-50 p-4 rounded-xl text-yellow-800 text-sm mb-4 border border-yellow-100">
                                    📍 Vous devrez récupérer votre commande directement chez le(s) vendeur(s).
                                </div>
                                <div className="h-64 rounded-xl overflow-hidden border border-gray-200">
                                    {relevantStores.length > 0 ? (
                                        <StoreMap
                                            stores={relevantStores.filter(s => s.clickCollect !== false)}
                                            showExact={true}
                                        />
                                    ) : (
                                        <div className="h-full flex items-center justify-center text-gray-400">Chargement de la carte...</div>
                                    )}
                                </div>
                                <div className="mt-4 space-y-2">
                                    {relevantStores.map(store => (
                                        <div key={store.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg text-sm">
                                            <span className="font-bold text-gray-900">{store.name}</span>
                                            <a href={`https://www.google.com/maps?q=${store.latitude},${store.longitude}`} target="_blank" className="text-[#006233] hover:underline font-semibold">
                                                Voir itinéraire
                                            </a>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-4 grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-bold text-gray-700 mb-1 block">Prénom</label>
                                        <input type="text" name="prenom" value={formData.prenom} onChange={handleChange} onBlur={handleFieldBlur} className="w-full rounded-lg border-gray-300" placeholder="Ahmed" required />
                                    </div>
                                    <div>
                                        <label className="text-sm font-bold text-gray-700 mb-1 block">Nom</label>
                                        <input type="text" name="nom" value={formData.nom} onChange={handleChange} onBlur={handleFieldBlur} className="w-full rounded-lg border-gray-300" placeholder="Benali" required />
                                    </div>
                                </div>
                                <div className="mt-2 grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-bold text-gray-700 mb-1 block">Email</label>
                                        <input type="email" name="email" value={formData.email} onChange={handleChange} onBlur={handleFieldBlur} className="w-full rounded-lg border-gray-300" placeholder="exemple@email.com" required />
                                    </div>
                                    <div>
                                        <label className="text-sm font-bold text-gray-700 mb-1 block flex items-center gap-1.5">
                                            Téléphone
                                            {formData.telephone && (
                                                <span className="text-xs font-normal text-green-600">✓ Confirmé depuis inscription</span>
                                            )}
                                        </label>
                                        <input
                                            type="tel"
                                            name="telephone"
                                            value={formData.telephone}
                                            readOnly
                                            className="w-full rounded-lg border-gray-300 bg-gray-50 cursor-not-allowed font-medium text-gray-700"
                                            placeholder="Votre numéro de téléphone"
                                            title="Numéro pré-rempli depuis votre inscription"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </section>

                    {/* 2. Paiement */}
                    <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <span>💳</span> Mode de paiement
                        </h2>
                        <div className="space-y-3">
                            <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'CASH' ? 'border-[#006233] bg-green-50' : 'border-gray-100 hover:border-gray-200'}`}>
                                <input type="radio" name="payment" value="CASH" checked={paymentMethod === 'CASH'} onChange={() => setPaymentMethod('CASH')} className="w-5 h-5 text-[#006233]" />
                                <div>
                                    <span className="font-bold text-gray-900 block">Paiement à la livraison / retrait</span>
                                    <span className="text-xs text-gray-500">Espèces uniquement</span>
                                </div>
                            </label>

                            <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'CIB' ? 'border-[#006233] bg-green-50' : 'border-gray-100 hover:border-gray-200'}`}>
                                <input type="radio" name="payment" value="CIB" checked={paymentMethod === 'CIB'} onChange={() => setPaymentMethod('CIB')} className="w-5 h-5 text-[#006233]" />
                                <div className="flex items-center justify-between w-full">
                                    <div>
                                        <span className="font-bold text-gray-900 block">Carte CIB</span>
                                        <span className="text-xs text-gray-500">Paiement sécurisé en ligne</span>
                                    </div>
                                    <div className="bg-gray-200 h-8 w-12 rounded flex items-center justify-center text-[10px] font-bold text-gray-500">LOGO CIB</div>
                                </div>
                            </label>

                            <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'DAHABIA' ? 'border-[#006233] bg-green-50' : 'border-gray-100 hover:border-gray-200'}`}>
                                <input type="radio" name="payment" value="DAHABIA" checked={paymentMethod === 'DAHABIA'} onChange={() => setPaymentMethod('DAHABIA')} className="w-5 h-5 text-[#006233]" />
                                <div className="flex items-center justify-between w-full">
                                    <div>
                                        <span className="font-bold text-gray-900 block">Carte Edahabia</span>
                                        <span className="text-xs text-gray-500">Algérie Poste</span>
                                    </div>
                                    <div className="bg-yellow-200 h-8 w-12 rounded flex items-center justify-center text-[10px] font-bold text-yellow-700">GOLD</div>
                                </div>
                            </label>
                        </div>
                    </section>
                </div>

                {/* RIGHT COLUMN: Summary */}
                <div className="space-y-6">
                    <div className="bg-gray-50 p-6 rounded-2xl sticky top-24">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Résumé de la commande</h3>
                        <div className="space-y-3 mb-6 max-h-60 overflow-y-auto pr-2">
                            {cart.map((item, idx) => (
                                <div key={idx} className="flex gap-3">
                                    <div className="w-16 h-16 bg-white rounded-lg border border-gray-200 flex-shrink-0 overflow-hidden">
                                        <Image src={item.image} alt="" width={64} height={64} className="object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-sm text-gray-900 truncate">{item.title}</p>
                                        <p className="text-xs text-gray-500">{item.quantity}x {item.size} / {item.color}</p>
                                        <p className="text-sm font-semibold text-[#006233]">{item.price.toLocaleString()} DA</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-gray-200 pt-4 space-y-2">
                            <div className="flex justify-between text-gray-600">
                                <span>Sous-total</span>
                                <span>{total.toLocaleString()} DA</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Livraison</span>
                                <span>{deliveryMethod === 'DELIVERY' ? '500 DA' : 'Gratuit'}</span>
                            </div>
                            <div className="flex justify-between text-xl font-black text-gray-900 pt-2 border-t border-gray-200 mt-2">
                                <span>Total</span>
                                <span>{(total + (deliveryMethod === 'DELIVERY' ? 500 : 0)).toLocaleString()} DA</span>
                            </div>
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={
                                !formData.email ||
                                !formData.prenom ||
                                !formData.nom ||
                                !formData.telephone ||
                                (deliveryMethod === 'DELIVERY' && (!formData.address || !formData.wilaya || !formData.city)) ||
                                isSubmitting
                            }
                            className={`w-full btn btn-primary mt-6 py-4 text-lg font-bold shadow-xl shadow-green-100 ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
                        >
                            {isSubmitting ? 'TRAITEMENT...' : 'CONFIRMER LA COMMANDE'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
