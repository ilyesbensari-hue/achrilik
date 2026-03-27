"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Leaflet map — no API key needed, no SSR
const LeafletAddressPicker = dynamic(
    () => import('@/components/LeafletAddressPicker'),
    { ssr: false, loading: () => <div className="w-full h-[300px] bg-gray-100 rounded-xl animate-pulse flex items-center justify-center text-gray-400 text-sm">Chargement de la carte...</div> }
);

export default function BecomeSellerPage() {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<any>(null);
    const router = useRouter();

    // Form data
    const [storeName, setStoreName] = useState('');
    const [storeDescription, setStoreDescription] = useState('');
    const [city, setCity] = useState('');
    const [phone, setPhone] = useState(''); // Changed from phoneNumber
    const [address, setAddress] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [hasPhysicalStore, setHasPhysicalStore] = useState(true);
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');

    // Wilayas disponibles (pour le moment uniquement Oran)
    const wilayas = ['Oran'];

    useEffect(() => {
        // Fetch user from server-side auth instead of localStorage
        fetch('/api/auth/me')
            .then(res => res.json())
            .then(data => {
                if (!data.user) {
                    router.push('/login');
                    return;
                }

                setUser(data.user);

                // Redirect if already a seller
                if (data.user.role === 'SELLER') {
                    router.push('/sell');
                }
            })
            .catch(() => {
                // If API fails, redirect to login
                router.push('/login');
            });
    }, [router]);

    const handleNext = () => {
        if (step === 1 && (!storeName || !storeDescription || !city)) {
            alert('Veuillez remplir tous les champs obligatoires');
            return;
        }
        if (step === 2 && (!phone || !address)) {
            alert('Veuillez remplir tous les champs obligatoires');
            return;
        }
        setStep(step + 1);
    };

    const handleBack = () => {
        setStep(step - 1);
    };

    const handleSubmit = async () => {
        if (!termsAccepted) {
            alert('Vous devez accepter les conditions générales');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/seller/upgrade', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    storeName,
                    storeDescription,
                    city,
                    phone, // Changed from phoneNumber
                    address,
                    postalCode,
                    latitude,
                    longitude,
                    hasPhysicalStore
                })
            });

            const data = await res.json();

            if (data.success) {
                // Update user in localStorage
                const updatedUser = { ...user, role: 'SELLER' };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                window.dispatchEvent(new Event('storage'));

                // Success modal or redirect
                alert('🎉 Félicitations ! Votre boutique a été créée avec succès !');
                router.push('/sell');
            } else {
                alert(data.error || 'Erreur lors de la création de la boutique');
            }
        } catch (error) {
            console.error(error);
            alert('Erreur de connexion');
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="loading w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Chargement...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-gray-50 py-12 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                        🏪 Créer ma boutique
                    </h1>
                    <p className="text-gray-600">
                        Rejoignez des centaines de vendeurs sur Achrilik
                    </p>
                </div>

                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                        {[1, 2, 3].map((s) => (
                            <div key={s} className="flex items-center flex-1">
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${step >= s
                                        ? 'bg-[#006233] text-white shadow-lg'
                                        : 'bg-gray-200 text-gray-500'
                                        }`}
                                >
                                    {s}
                                </div>
                                {s < 3 && (
                                    <div
                                        className={`flex-1 h-1 mx-2 transition-all ${step > s ? 'bg-[#006233]' : 'bg-gray-200'
                                            }`}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                        <span>Boutique</span>
                        <span>Coordonnées</span>
                        <span>Validation</span>
                    </div>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    {/* Step 1: Store Information */}
                    {step === 1 && (
                        <div className="space-y-5">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">
                                📝 Informations de votre boutique
                            </h2>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nom de la boutique <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#006233] focus:ring-2 focus:ring-green-100 outline-none transition-all"
                                    placeholder="Ma Boutique Mode"
                                    value={storeName}
                                    onChange={(e) => setStoreName(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    required
                                    rows={4}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#006233] focus:ring-2 focus:ring-green-100 outline-none transition-all resize-none"
                                    placeholder="Décrivez votre boutique, vos produits, votre expertise..."
                                    value={storeDescription}
                                    onChange={(e) => setStoreDescription(e.target.value)}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    {storeDescription.length} / 500 caractères
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Wilaya <span className="text-red-500">*</span>
                                </label>
                                <select
                                    required
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#006233] focus:ring-2 focus:ring-green-100 outline-none transition-all"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                >
                                    <option value="">-- Sélectionnez votre wilaya --</option>
                                    {wilayas.map((w) => (
                                        <option key={w} value={w}>{w}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Contact Details */}
                    {step === 2 && (
                        <div className="space-y-5">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">
                                📞 Vos coordonnées
                            </h2>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Numéro de téléphone <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="tel"
                                    required
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#006233] focus:ring-2 focus:ring-green-100 outline-none transition-all"
                                    placeholder="0555 12 34 56"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Vos clients pourront vous contacter via ce numéro
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Adresse complète <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    required
                                    rows={3}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#006233] focus:ring-2 focus:ring-green-100 outline-none transition-all resize-none"
                                    placeholder="Rue, quartier, commune..."
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Code postal (optionnel)
                                </label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#006233] focus:ring-2 focus:ring-green-100 outline-none transition-all"
                                    placeholder="31000"
                                    value={postalCode}
                                    onChange={(e) => setPostalCode(e.target.value)}
                                />
                            </div>

                            {/* Type de boutique */}
                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={hasPhysicalStore}
                                        onChange={(e) => setHasPhysicalStore(e.target.checked)}
                                        className="w-5 h-5 rounded border-2 border-gray-300 text-blue-600"
                                    />
                                    <div>
                                        <span className="font-medium text-gray-900">📍 J'ai une boutique physique</span>
                                        <p className="text-xs text-gray-500">Cochez si vous avez un magasin où les clients peuvent venir</p>
                                    </div>
                                </label>
                            </div>

                            {/* Leaflet Map Location Picker */}
                            {hasPhysicalStore && (
                                <div className="space-y-3">
                                    <label className="block text-sm font-medium text-gray-700">
                                        📍 Localisation sur la carte (optionnel)
                                    </label>
                                    <div className="rounded-xl overflow-hidden border-2 border-gray-200">
                                        <LeafletAddressPicker
                                            initialLat={latitude ? parseFloat(latitude) : undefined}
                                            initialLng={longitude ? parseFloat(longitude) : undefined}
                                            onLocationSelect={(loc) => {
                                                setLatitude(loc.coordinates.lat.toString());
                                                setLongitude(loc.coordinates.lng.toString());
                                            }}
                                        />
                                    </div>
                                    {latitude && longitude && (
                                        <p className="text-xs text-green-600 font-medium">
                                            ✅ Position sélectionnée : {parseFloat(latitude).toFixed(4)}, {parseFloat(longitude).toFixed(4)}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 3: Terms & Validation */}
                    {step === 3 && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">
                                ✅ Dernière étape
                            </h2>

                            {/* Summary */}
                            <div className="bg-gray-50 p-6 rounded-xl space-y-3">
                                <h3 className="font-bold text-gray-900 mb-4">Récapitulatif</h3>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <p className="text-gray-500">Boutique</p>
                                        <p className="font-medium text-gray-900">{storeName}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Ville</p>
                                        <p className="font-medium text-gray-900">{city}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Téléphone</p>
                                        <p className="font-medium text-gray-900">{phone}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Adresse</p>
                                        <p className="font-medium text-gray-900 line-clamp-2">{address}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Terms */}
                            <div className="space-y-4">
                                <label className="flex items-start gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={termsAccepted}
                                        onChange={(e) => setTermsAccepted(e.target.checked)}
                                        className="mt-1 w-5 h-5 rounded border-2 border-gray-300 text-[#006233] focus:ring-2 focus:ring-green-100"
                                    />
                                    <span className="text-sm text-gray-700 group-hover:text-gray-900">
                                        J'accepte les{' '}
                                        <Link href="/terms" className="text-[#006233] underline font-medium">
                                            conditions générales de vente
                                        </Link>
                                        {' '}et je m'engage à respecter les règles de la plateforme.
                                    </span>
                                </label>
                            </div>

                            {/* Benefits Reminder */}
                            <div className="bg-green-50 p-5 rounded-xl border border-green-200">
                                <h4 className="font-bold text-green-900 mb-3">🎉 Vous allez bénéficier de :</h4>
                                <ul className="space-y-2 text-sm text-green-800">
                                    <li className="flex items-center gap-2">
                                        <span className="text-green-600">✓</span>
                                        <span><strong>0% de commission</strong> pendant la phase d'essai</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="text-green-600">✓</span>
                                        <span>Visibilité locale auprès de milliers d'acheteurs</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="text-green-600">✓</span>
                                        <span>Paiement à la livraison</span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="text-green-600">✓</span>
                                        <span>Support dédié par notre équipe</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex gap-3 mt-8">
                        {step > 1 && (
                            <button
                                onClick={handleBack}
                                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all"
                            >
                                ← Retour
                            </button>
                        )}
                        {step < 3 ? (
                            <button
                                onClick={handleNext}
                                className="flex-1 px-6 py-3 bg-[#006233] text-white rounded-lg font-medium hover:bg-[#004d28] transition-all shadow-lg"
                            >
                                Continuer →
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={loading || !termsAccepted}
                                className="flex-1 px-6 py-3 bg-[#006233] text-white rounded-lg font-medium hover:bg-[#004d28] transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Création en cours...' : '🚀 Créer ma boutique'}
                            </button>
                        )}
                    </div>

                    {step === 1 && (
                        <p className="text-center text-sm text-gray-500 mt-6">
                            Vous avez déjà une boutique ?{' '}
                            <Link href="/sell" className="text-[#006233] hover:underline font-medium">
                                Accéder au dashboard
                            </Link>
                        </p>
                    )}
                </div>

                {/* Cancel Link */}
                <div className="text-center mt-6">
                    <Link href="/" className="text-sm text-gray-500 hover:text-gray-900">
                        ← Annuler et retourner à l'accueil
                    </Link>
                </div>
            </div>
        </div>
    );
}
