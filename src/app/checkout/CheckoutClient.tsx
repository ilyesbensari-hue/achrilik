"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Trash2, MapPin, Store as StoreIcon, ShoppingBag, CreditCard, Wallet, Package } from 'lucide-react';
import { calculateDeliveryFee } from '@/lib/deliveryFeeCalculator';

const LeafletAddressPicker = dynamic(
    () => import('@/components/LeafletAddressPicker'),
    {
        ssr: false,
        loading: () => <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">Chargement de la carte...</div>
    }
);

const StoreMap = dynamic(() => import('@/components/StoreMap'), { ssr: false });

interface CheckoutClientProps {
    initialUser: any;
}

export default function CheckoutClient({ initialUser }: CheckoutClientProps) {
    const [cart, setCart] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [deliveryMethod, setDeliveryMethod] = useState<'DELIVERY' | 'PICKUP'>('DELIVERY');
    const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CIB' | 'DAHABIA'>('CASH');
    const [stores, setStores] = useState<any[]>([]);
    const [deliveryFee, setDeliveryFee] = useState(500);
    const [deliveryFeeDetails, setDeliveryFeeDetails] = useState<any>(null);

    // --- Derived State for Stores & Pickup ---
    const cartStoreIds = new Set(cart.map((item: any) => item.storeId).filter(Boolean));
    const relevantStores = stores.filter(store => cartStoreIds.has(store.id));
    const pickupAvailable = cartStoreIds.size > 0 && relevantStores.every(s => s.clickCollect !== false);

    // User Details - Extended avec email, prenom, nom, GPS
    const [formData, setFormData] = useState({
        email: '',
        prenom: '',
        nom: '',
        telephone: '',
        wilaya: 'Oran', // Fixed to Oran - only delivery location supported
        city: '',
        address: '',
        latitude: null as number | null,
        longitude: null as number | null
    });



    const [isEditing, setIsEditing] = useState(false);

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
                wilaya: 'Oran', // Always set to Oran regardless of user profile
                city: initialUser.city || '',
                address: initialUser.address || '',
                latitude: initialUser.latitude || null, // Use saved GPS if available
                longitude: initialUser.longitude || null
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

        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    // Recalculate delivery fee when cart changes (wilaya is always Oran)
    useEffect(() => {
        if (cart.length > 0 && deliveryMethod === 'DELIVERY') {
            calculateDeliveryFee(cart, 'Oran') // Always calculate for Oran delivery
                .then(result => {
                    setDeliveryFee(result.totalFee);
                    setDeliveryFeeDetails(result);
                })
                .catch(error => {
                    console.error('Error calculating delivery fee:', error);
                    setDeliveryFee(500); // Fallback
                });
        }
    }, [cart, deliveryMethod]);



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
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    // Detect missing profile info
    const missingFields = [];
    if (!formData.email) missingFields.push('Email');
    if (!formData.prenom) missingFields.push('Prénom');
    if (!formData.nom) missingFields.push('Nom');
    if (!formData.telephone) missingFields.push('Téléphone');
    if (deliveryMethod === 'DELIVERY' && !formData.address) missingFields.push('Adresse');
    const hasIncompleteProfile = missingFields.length > 0;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({}); // Clear previous errors

        try {
            // Validation with detailed error messages
            const newErrors: { [key: string]: string } = {};

            if (!formData.email) newErrors.email = "L'email est obligatoire";
            else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "L'email n'est pas valide";

            if (!formData.prenom) newErrors.prenom = "Le prénom est obligatoire";
            if (!formData.nom) newErrors.nom = "Le nom est obligatoire";
            if (!formData.telephone) newErrors.telephone = "Le numéro de téléphone est obligatoire";
            else if (!/^(0)(5|6|7)[0-9]{8}$/.test(formData.telephone)) newErrors.telephone = "Numéro invalide (format: 0XXXXXXXXX)";

            if (deliveryMethod === 'DELIVERY') {
                if (!formData.address) newErrors.address = "L'adresse de livraison est obligatoire";
                if (!formData.city) newErrors.city = "La commune est obligatoire";
                // wilaya is automatically set to Oran, no need to validate
            }

            // If there are errors, display them and stop submission
            if (Object.keys(newErrors).length > 0) {
                setErrors(newErrors);
                setIsSubmitting(false);
                // Scroll to first error
                const firstErrorField = document.querySelector('[data-has-error="true"]');
                firstErrorField?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                return;
            }

            // GPS warning if not provided (Non-blocking now)
            if (deliveryMethod === 'DELIVERY' && (!formData.latitude || !formData.longitude)) {
                console.warn("Commande sans GPS - Adresse textuelle uniquement");
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
        // ... (Empty cart view remains the same)
        return (
            <div className="container py-20 text-center">
                <h2 className="text-2xl font-bold mb-4">Votre panier est vide</h2>
                <Link href="/" className="btn btn-primary">Continuer vos achats</Link>
            </div>
        );
    }

    // ... (Store filtering logic remains the same)




    return (
        <div className="container py-6 px-4 mx-auto max-w-7xl">
            {/* STEPPER */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-[#006233] text-white flex items-center justify-center font-bold text-sm">1</div>
                    <span className="text-xs mt-1 font-semibold text-[#006233]">Panier</span>
                </div>
                <div className="h-1 flex-1 bg-[#006233] mx-2"></div>
                <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-[#006233] text-white flex items-center justify-center font-bold text-sm">2</div>
                    <span className="text-xs mt-1 font-semibold text-[#006233]">Livraison</span>
                </div>
                <div className="h-1 flex-1 bg-gray-200 mx-2"></div>
                <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center font-bold text-sm">3</div>
                    <span className="text-xs mt-1 text-gray-400">Confirmation</span>
                </div>
            </div>

            <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-6">Finaliser la commande</h1>

            {/* Missing Info Warning */}
            {hasIncompleteProfile && (
                <div className="bg-orange-50 border-l-4 border-orange-500 p-5 rounded-r-xl mb-6 animate-fade-in">
                    <div className="flex items-start gap-3">
                        <span className="text-2xl flex-shrink-0">⚠️</span>
                        <div className="flex-1">
                            <h3 className="font-bold text-orange-900 mb-2 text-lg">
                                Informations manquantes pour finaliser votre commande
                            </h3>
                            <p className="text-sm text-orange-800 mb-3">
                                Veuillez compléter les champs suivants pour continuer :
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {missingFields.map(field => (
                                    <span key={field} className="bg-orange-200 text-orange-900 px-3 py-1 rounded-full text-xs font-semibold">
                                        {field}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* LEFT COLUMN: Options */}
                <div className="space-y-8">

                    {/* User Info Confirmation / Edit */}
                    {initialUser && !isEditing && formData.telephone && formData.address && (
                        <section className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl shadow-sm border-2 border-green-200 relative animate-fade-in">
                            <button
                                onClick={() => setIsEditing(true)}
                                className="absolute top-4 right-4 text-[#006233] text-sm font-bold hover:underline flex items-center gap-1 bg-white px-3 py-1 rounded-full shadow-sm"
                            >
                                ✏️ Modifier
                            </button>
                            <h2 className="text-lg font-bold mb-3 flex items-center gap-2 text-gray-900">
                                <span>✅</span> Vos informations
                            </h2>
                            <div className="space-y-3 text-sm">
                                <div className="flex items-center gap-2 bg-white/60 p-3 rounded-lg">
                                    <span className="text-gray-600 w-20">👤 Nom:</span>
                                    <span className="font-semibold text-gray-900">{formData.prenom} {formData.nom}</span>
                                </div>
                                <div className="flex items-center gap-2 bg-white/60 p-3 rounded-lg">
                                    <span className="text-gray-600 w-20">📧 Email:</span>
                                    <span className="font-semibold text-gray-900">{formData.email}</span>
                                </div>
                                <div className="flex items-center gap-2 bg-white/60 p-3 rounded-lg">
                                    <span className="text-gray-600 w-20">📱 Tél:</span>
                                    <span className="font-semibold text-gray-900">{formData.telephone || 'Non renseigné'}</span>
                                </div>
                                {formData.address && (
                                    <div className="flex items-start gap-2 bg-white/60 p-3 rounded-lg">
                                        <span className="text-gray-600 w-20">📍 Adresse:</span>
                                        <span className="font-semibold text-gray-900 flex-1">
                                            {formData.address}, {formData.city}, {formData.wilaya}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <p className="text-xs text-green-700 mt-3 font-medium flex items-center gap-1">
                                ✨ Ces informations sont pré-remplies pour vous faire gagner du temps.
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

                        {/* Delivery Form - Editable */}
                        {deliveryMethod === 'DELIVERY' && (isEditing || !initialUser || !formData.telephone || !formData.address) && (
                            <div className="mt-6 space-y-4 animate-fade-in bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative">
                                {initialUser && (
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                                    >
                                        ✕ Annuler
                                    </button>
                                )}
                                <h3 className="font-bold text-gray-900 mb-4">Informations de livraison à Oran</h3>
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                                    <p className="text-xs text-blue-800">
                                        📍 <strong>Livraison uniquement à Oran</strong> pour le moment
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-bold text-gray-700 mb-1 block">Prénom</label>
                                        <input
                                            type="text"
                                            name="prenom"
                                            value={formData.prenom}
                                            onChange={handleChange}
                                            data-has-error={!!errors.prenom}
                                            className={`w-full rounded-lg border-gray-300 focus:ring-[#006233] focus:border-[#006233] ${errors.prenom ? 'border-red-500 bg-red-50' : ''}`}
                                            placeholder="Ahmed"
                                            required
                                        />
                                        {errors.prenom && (
                                            <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                                                <span>⚠️</span> {errors.prenom}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="text-sm font-bold text-gray-700 mb-1 block">Nom</label>
                                        <input
                                            type="text"
                                            name="nom"
                                            value={formData.nom}
                                            onChange={handleChange}
                                            data-has-error={!!errors.nom}
                                            className={`w-full rounded-lg border-gray-300 focus:ring-[#006233] focus:border-[#006233] ${errors.nom ? 'border-red-500 bg-red-50' : ''}`}
                                            placeholder="Benali"
                                            required
                                        />
                                        {errors.nom && (
                                            <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                                                <span>⚠️</span> {errors.nom}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-bold text-gray-700 mb-1 block">Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            data-has-error={!!errors.email}
                                            className={`w-full rounded-lg border-gray-300 focus:ring-[#006233] focus:border-[#006233] ${errors.email ? 'border-red-500 bg-red-50' : ''}`}
                                            placeholder="exemple@email.com"
                                            required
                                        />
                                        {errors.email && (
                                            <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                                                <span>⚠️</span> {errors.email}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="text-sm font-bold text-gray-700 mb-1 block">
                                            Téléphone (Visible)
                                        </label>
                                        <input
                                            type="tel"
                                            name="telephone"
                                            value={formData.telephone}
                                            onChange={handleChange}
                                            data-has-error={!!errors.telephone}
                                            className={`w-full rounded-lg border-gray-300 focus:ring-[#006233] focus:border-[#006233] ${errors.telephone ? 'border-red-500 bg-red-50' : ''}`}
                                            placeholder="0661234567"
                                            required
                                        />
                                        {errors.telephone && (
                                            <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                                                <span>⚠️</span> {errors.telephone}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-gray-700 mb-1 block">Adresse complète</label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        data-has-error={!!errors.address}
                                        className={`w-full rounded-lg border-gray-300 focus:ring-[#006233] focus:border-[#006233] ${errors.address ? 'border-red-500 bg-red-50' : ''}`}
                                        placeholder="Cité 123 logts..."
                                        required
                                    />
                                    {errors.address && (
                                        <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                                            <span>⚠️</span> {errors.address}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-gray-700 mb-1 block">Commune (Oran)</label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                        data-has-error={!!errors.city}
                                        className={`w-full rounded-lg border-gray-300 focus:ring-[#006233] focus:border-[#006233] ${errors.city ? 'border-red-500 bg-red-50' : ''}`}
                                        placeholder="Ex: Es Senia, Bir El Djir, Oran Centre..."
                                        required
                                    />
                                    {errors.city && (
                                        <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                                            <span>⚠️</span> {errors.city}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* GPS Map Picker - Always visible in DELIVERY mode */}
                        {deliveryMethod === 'DELIVERY' && (
                            <div className="mt-6 animate-fade-in bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <label className="text-sm font-bold text-gray-700 mb-2 block">
                                    📍 Pointez votre adresse exacte à Oran (Optionnel)
                                </label>
                                <LeafletAddressPicker
                                    onLocationSelect={(loc) => handleLocationSelect(loc.coordinates.lat, loc.coordinates.lng, loc.address)}
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
                                        <input type="text" name="prenom" value={formData.prenom} onChange={handleChange} className="w-full rounded-lg border-gray-300" placeholder="Ahmed" required />
                                    </div>
                                    <div>
                                        <label className="text-sm font-bold text-gray-700 mb-1 block">Nom</label>
                                        <input type="text" name="nom" value={formData.nom} onChange={handleChange} className="w-full rounded-lg border-gray-300" placeholder="Benali" required />
                                    </div>
                                </div>
                                <div className="mt-2 grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-bold text-gray-700 mb-1 block">Email</label>
                                        <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full rounded-lg border-gray-300" placeholder="exemple@email.com" required />
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
                            <div className="flex justify-between py-3">
                                <span>Sous-total</span>
                                <span>{total.toLocaleString()} DA</span>
                            </div>
                            {deliveryMethod === 'DELIVERY' && (
                                <>
                                    <div className="flex justify-between py-3">
                                        <span>Frais de livraison</span>
                                        <span>{deliveryFee.toLocaleString()} DA</span>
                                    </div>
                                    {deliveryFeeDetails?.hasOutsideOranProducts && (
                                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-2">
                                            <div className="flex items-start gap-2">
                                                <span className="text-amber-600 flex-shrink-0">📦</span>
                                                <div>
                                                    <p className="text-xs font-medium text-amber-900">Produits stockés hors Oran</p>
                                                    <p className="text-xs text-amber-700 mt-0.5">
                                                        Les frais ont été ajustés selon la ville de stockage.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                            <div className="flex justify-between text-lg font-bold border-t-2 pt-3 mt-3">
                                <span>Total</span>
                                <span>
                                    {deliveryMethod === 'DELIVERY'
                                        ? (total + deliveryFee).toLocaleString()
                                        : total.toLocaleString()
                                    } DA
                                </span>
                            </div>
                        </div>

                        {/* Phone & Address Confirmation */}
                        <div className="mt-6 bg-blue-50 p-4 rounded-xl border border-blue-200">
                            <p className="text-sm text-blue-800 mb-1">📞 Confirmation du contact :</p>
                            <p className="text-xl font-black text-blue-900 tracking-wider">
                                {formData.telephone || '...'}
                            </p>
                            {deliveryMethod === 'DELIVERY' && (
                                <>
                                    <div className="my-2 border-t border-blue-200"></div>
                                    <p className="text-sm text-blue-800 mb-1">📍 Confirmation de l'adresse :</p>
                                    <p className="text-sm font-bold text-blue-900 leading-tight">
                                        {formData.address ? `${formData.address}, ${formData.city}, ${formData.wilaya}` : '...'}
                                    </p>
                                </>
                            )}
                            <p className="text-xs text-blue-600 mt-2">
                                Vérifiez ces informations avant de confirmer.
                            </p>
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={
                                !formData.email ||
                                !formData.prenom ||
                                !formData.nom ||
                                !formData.telephone ||
                                (deliveryMethod === 'DELIVERY' && (!formData.address || !formData.city)) ||
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
