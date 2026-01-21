"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

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

    // User Details
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        wilaya: '',
        city: '',
        address: ''
    });

    useEffect(() => {
        // Load Cart
        const storedCart = JSON.parse(localStorage.getItem('cart') || '[]');
        setCart(storedCart);
        const t = storedCart.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
        setTotal(t);

        // Fetch Stores if pickup
        fetch('/api/stores/locations')
            .then(res => res.json())
            .then(data => {
                // Filter stores relevant to cart? Or just show all?
                // For simplicity, show all stores where user can pickup.
                // Optionally filter by stores present in cart if strictly per-store pickup.
                // Let's show all for now or filter if cart has items.
                setStores(data);
            })
            .catch(e => console.error(e));
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: initialUser.id,
                    cart,
                    deliveryMethod,
                    paymentMethod,
                    ...formData
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Erreur');
            }

            // Success
            localStorage.removeItem('cart');
            if (confirm('✅ Commande validée ! Voir mes commandes ?')) {
                window.location.href = '/profile';
            } else {
                window.location.href = '/';
            }

        } catch (error: any) {
            alert(error.message);
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

                        {/* Delivery Form */}
                        {deliveryMethod === 'DELIVERY' && (
                            <div className="mt-6 space-y-4 animate-fade-in">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-bold text-gray-700 mb-1 block">Nom complet</label>
                                        <input type="text" name="name" onChange={handleChange} className="w-full rounded-lg border-gray-300" placeholder="Votre nom" required />
                                    </div>
                                    <div>
                                        <label className="text-sm font-bold text-gray-700 mb-1 block">Téléphone</label>
                                        <input type="tel" name="phone" onChange={handleChange} className="w-full rounded-lg border-gray-300" placeholder="05..." required />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-gray-700 mb-1 block">Adresse</label>
                                    <input type="text" name="address" onChange={handleChange} className="w-full rounded-lg border-gray-300" placeholder="Cité 123 logts..." required />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-bold text-gray-700 mb-1 block">Wilaya</label>
                                        <input type="text" name="wilaya" onChange={handleChange} className="w-full rounded-lg border-gray-300" placeholder="Oran" required />
                                    </div>
                                    <div>
                                        <label className="text-sm font-bold text-gray-700 mb-1 block">Commune</label>
                                        <input type="text" name="city" onChange={handleChange} className="w-full rounded-lg border-gray-300" placeholder="Es Senia" required />
                                    </div>
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
                                <div className="mt-4">
                                    <label className="text-sm font-bold text-gray-700 mb-1 block">Nom complet (pour le retrait)</label>
                                    <input type="text" name="name" onChange={handleChange} className="w-full rounded-lg border-gray-300" placeholder="Votre nom" required />
                                </div>
                                <div className="mt-2">
                                    <label className="text-sm font-bold text-gray-700 mb-1 block">Téléphone</label>
                                    <input type="tel" name="phone" onChange={handleChange} className="w-full rounded-lg border-gray-300" placeholder="05..." required />
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
                                        <img src={item.image} alt="" className="w-full h-full object-cover" />
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
                            disabled={!formData.name || !formData.phone}
                            className="w-full btn btn-primary mt-6 py-4 text-lg font-bold shadow-xl shadow-green-100"
                        >
                            CONFIRMER LA COMMANDE
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
