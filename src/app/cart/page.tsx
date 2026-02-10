"use client";

import { useEffect, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';
import { validateCart, getRemainingCapacity, CART_LIMITS } from '@/lib/cartLimits';
import { calculateFreeDeliveryStatus, getIncentiveStores } from '@/lib/freeDeliveryHelpers';
import FreeDeliveryIncentivePopup from '@/components/FreeDeliveryIncentivePopup';

const MapPicker = dynamic(() => import('@/components/Map'), { ssr: false });

export default function CartPage() {
    const router = useRouter();
    const { user, isLoading } = useAuth(); // Use AuthContext
    const [cart, setCart] = useState<any[]>([]);
    const [total, setTotal] = useState(0);

    // Form State
    const [method, setMethod] = useState<'DELIVERY' | 'CLICK_COLLECT'>('DELIVERY');
    const [payment, setPayment] = useState<'CASH_ON_DELIVERY' | 'ONLINE' | 'STORE'>('CASH_ON_DELIVERY');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');

    // Click & Collect
    const [stores, setStores] = useState<any[]>([]);
    const [selectedStore, setSelectedStore] = useState<any>(null);
    const [hasMixedCart, setHasMixedCart] = useState(false);
    const [onlineOnlyItems, setOnlineOnlyItems] = useState<string[]>([]);

    // Free Delivery Popup
    const [showFreeDeliveryPopup, setShowFreeDeliveryPopup] = useState(false);
    const [enrichedCart, setEnrichedCart] = useState<any[]>([]);

    useEffect(() => {
        const c = JSON.parse(localStorage.getItem('cart') || '[]');
        setCart(c);
        setTotal(c.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0));

        // Fetch stores
        fetch('/api/stores').then(res => res.json()).then(data => {
            setStores(data);

            // Check for Mixed Cart (Online Only + Physical)
            let hasOnline = false;
            let hasPhysical = false;
            const onlineItems: string[] = [];

            c.forEach((item: any) => {
                const store = data.find((s: any) => s.id === item.storeId);
                if (store) {
                    if (store.clickCollect === false) {
                        hasOnline = true;
                        onlineItems.push(item.id || item.productId);
                    } else {
                        hasPhysical = true;
                    }
                }
            });

            setHasMixedCart(hasOnline && hasPhysical);
            setOnlineOnlyItems(onlineItems);

            // Auto-select store if cart items belong to one (and permissible)
            if (c.length > 0) {
                const firstStoreId = c[0].storeId;
                if (firstStoreId) {
                    const store = data.find((s: any) => s.id === firstStoreId);
                    if (store && store.clickCollect !== false) setSelectedStore(store);
                }
            }
        }).catch(console.error);

        // Auth check is now handled by useAuth() hook

        // Fetch enriched cart data with Store info for free delivery calculation
        if (c.length > 0) {
            const fetchEnrichedCart = async () => {
                try {
                    const productIds = c.map((item: any) => item.productId);
                    const uniqueIds = [...new Set(productIds)];

                    const productPromises = uniqueIds.map(id =>
                        fetch(`/api/products/${id}`).then(r => r.json())
                    );

                    const products = await Promise.all(productPromises);

                    // Map cart items with full product data
                    const enriched = c.map((cartItem: any) => {
                        const product = products.find(p => p.id === cartItem.productId);
                        if (!product) return null;

                        return {
                            id: cartItem.productId + cartItem.variantId,
                            productId: cartItem.productId,
                            variantId: cartItem.variantId,
                            cartQuantity: cartItem.quantity || 1,
                            Product: {
                                id: product.id,
                                title: product.title,
                                price: product.price,
                                storeId: product.storeId,
                                Store: product.Store || product.store
                            }
                        };
                    }).filter(Boolean);

                    setEnrichedCart(enriched);

                    // Calculate free delivery status
                    if (enriched.length > 0) {
                        const storesData = calculateFreeDeliveryStatus(enriched);
                        const incentiveStores = getIncentiveStores(storesData);

                        // Show popup if applicable (within 3000 DA of threshold)
                        if (incentiveStores.length > 0) {
                            // Wait 1 second before showing popup (don't overwhelm immediately)
                            setTimeout(() => {
                                setShowFreeDeliveryPopup(true);
                            }, 1000);
                        }
                    }
                } catch (error) {
                    console.error('Error fetching enriched cart:', error);
                }
            };

            fetchEnrichedCart();
        }
    }, []);

    const handleCheckout = (e?: React.MouseEvent) => {
        if (e) e.preventDefault();

        if (!user) {
            alert('Veuillez vous connecter pour commander');
            router.push('/login?callbackUrl=/cart');
            return;
        }

        if (cart.length === 0) return alert('Panier vide');

        // Redirect to full checkout page for address/payment details
        router.push('/checkout');
    };

    const removeItem = (index: number) => {
        const newCart = [...cart];
        newCart.splice(index, 1);
        setCart(newCart);
        localStorage.setItem('cart', JSON.stringify(newCart));
        window.dispatchEvent(new Event('storage'));
        setTotal(newCart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0));
    };

    const updateQuantity = (index: number, newQuantity: number) => {
        if (newQuantity < 1) return;

        const item = cart[index];

        // Vérifier le stock disponible
        if (newQuantity > item.stock) {
            alert(`Stock maximum disponible: ${item.stock}`);
            return;
        }

        // 🔒 VALIDATE CART LIMITS
        const newCart = [...cart];
        newCart[index] = { ...newCart[index], quantity: newQuantity };

        const error = validateCart(newCart);
        if (error) {
            let message = error.message;
            if (error.type === 'MAX_ITEMS_PER_STORE') {
                message = `Vous ne pouvez pas dépasser ${CART_LIMITS.MAX_ITEMS_PER_STORE} articles pour "${error.storeName}"`;
            }
            alert(message);
            return;
        }

        // Mettre à jour le panier
        setCart(newCart);
        localStorage.setItem('cart', JSON.stringify(newCart));
        window.dispatchEvent(new Event('storage'));

        // Recalculer le total
        setTotal(newCart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0));
    };

    if (isLoading) {
        return <div className="container py-10 text-center">Chargement...</div>;
    }

    return (
        <div className="container py-10">
            <h1 className="text-3xl font-bold mb-6">Mon Panier</h1>

            {/* Free Delivery Progress Banner */}
            {enrichedCart.length > 0 && (() => {
                const storesData = calculateFreeDeliveryStatus(enrichedCart);
                const storesWithFreeDelivery = storesData.filter(s => s.offersFreeDelivery && s.freeDeliveryThreshold);

                if (storesWithFreeDelivery.length === 0) return null;

                return (
                    <div className="mb-6 space-y-3">
                        {storesWithFreeDelivery.map(store => {
                            const isQualified = store.amountToFreeDelivery === null || store.amountToFreeDelivery <= 0;

                            if (isQualified) {
                                // ✅ THRESHOLD REACHED - Congratulations
                                return (
                                    <div key={store.storeId} className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-500 rounded-xl p-5 shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-green-500 rounded-full p-2">
                                                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-lg font-bold text-green-700">
                                                    🎉 Félicitations ! Livraison GRATUITE pour {store.storeName}
                                                </h3>
                                                <p className="text-sm text-green-600">
                                                    Vous avez atteint le seuil de {store.freeDeliveryThreshold?.toLocaleString()} DA
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            } else {
                                // 📦 NOT YET - Show Progress
                                const progress = store.percentageToThreshold;
                                return (
                                    <div key={store.storeId} className="bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-400 rounded-xl p-5 shadow-sm">
                                        <div className="flex items-start gap-3">
                                            <div className="bg-orange-500 rounded-full p-2 flex-shrink-0">
                                                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                                </svg>
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-base font-bold text-orange-700 mb-1">
                                                    🚚 Plus que {store.amountToFreeDelivery?.toLocaleString()} DA pour la livraison gratuite !
                                                </h3>
                                                <p className="text-sm text-orange-600 mb-3">
                                                    {store.storeName} • {store.totalAmount.toLocaleString()} DA / {store.freeDeliveryThreshold?.toLocaleString()} DA
                                                </p>

                                                {/* Progress bar */}
                                                <div className="relative">
                                                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                                        <div
                                                            className="bg-gradient-to-r from-orange-500 to-yellow-500 h-full rounded-full transition-all duration-500"
                                                            style={{ width: `${Math.min(progress, 100)}%` }}
                                                        />
                                                    </div>
                                                    <div className="flex justify-between text-xs text-gray-600 mt-1">
                                                        <span>{progress.toFixed(0)}% atteint</span>
                                                        <span className="font-semibold text-orange-600">Continue !</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            }
                        })}
                    </div>
                );
            })()}

            <div className="grid md:grid-cols-3 gap-8">
                {/* Items List */}
                <div className="md:col-span-2 space-y-4">
                    {/* Mixed Cart Warning */}
                    {hasMixedCart && (
                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg animate-fade-in">
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-yellow-800">Panier mixte détecté</h3>
                                    <div className="mt-2 text-sm text-yellow-700">
                                        <p>
                                            Votre panier contient des articles de vendeurs <strong>100% en ligne</strong> (livraison obligatoire).
                                            <br />
                                            Par conséquent, <strong>la livraison à domicile</strong> s'applique à l'ensemble de la commande.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {cart.length === 0 ? (
                        <div className="text-center py-10 bg-gray-50 rounded-xl">
                            <p className="text-xl mb-4">Votre panier est vide.</p>
                            <a href="/" className="btn btn-primary">Découvrir nos produits</a>
                        </div>
                    ) : (
                        cart.map((item, i) => {
                            const store = stores.find(s => s.id === item.storeId);
                            const isOnlineOnly = store?.clickCollect === false;

                            return (
                                <div key={i} className="card flex gap-4 items-start p-4 relative overflow-hidden">
                                    <Image src={item.image} alt={item.title} width={96} height={96} className="object-cover rounded bg-gray-100" />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-col sm:flex-row sm:justify-between items-start gap-2 mb-1">
                                            <h3 className="font-bold text-gray-900 truncate pr-4">{item.title}</h3>
                                            {store && (
                                                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${isOnlineOnly ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                                                    {isOnlineOnly ? '🚚 Livraison Uniquement' : '🏪 Retrait Disponible'}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-500 mb-2">Taille: {item.size} | Couleur: {item.color}</p>
                                        <div className="flex items-center justify-between mt-2 gap-3">
                                            {/* Quantity controls */}
                                            <div className="flex items-center border border-gray-300 rounded-lg">
                                                <button
                                                    onClick={() => updateQuantity(i, (item.quantity || 1) - 1)}
                                                    className="min-w-[44px] min-h-[44px] px-3 py-2 hover:bg-gray-100 transition-colors flex items-center justify-center"
                                                    disabled={(item.quantity || 1) <= 1}
                                                    aria-label="Diminuer la quantité"
                                                >
                                                    −
                                                </button>
                                                <span className="px-4 py-2 font-medium min-w-[40px] text-center">
                                                    {item.quantity || 1}
                                                </span>
                                                <button
                                                    onClick={() => updateQuantity(i, (item.quantity || 1) + 1)}
                                                    className="min-w-[44px] min-h-[44px] px-3 py-2 hover:bg-gray-100 transition-colors flex items-center justify-center"
                                                    aria-label="Augmenter la quantité"
                                                >
                                                    +
                                                </button>
                                            </div>

                                            {/* Price */}
                                            <div className="flex flex-col items-end">
                                                <p className="text-[#006233] font-bold text-lg">
                                                    {(item.price * (item.quantity || 1)).toLocaleString()} DA
                                                </p>
                                                <button
                                                    onClick={() => removeItem(i)}
                                                    className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors mt-1"
                                                    aria-label="Supprimer l'article"
                                                >
                                                    Supprimer
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Summary Card */}
                {cart.length > 0 && (
                    <div className="card h-fit sticky top-24 p-6 bg-white shadow-sm border border-gray-100 rounded-2xl">
                        <h2 className="text-xl font-bold mb-6">Résumé</h2>
                        <div className="flex justify-between mb-4 text-gray-600">
                            <span>Sous-total</span>
                            <span>{total.toLocaleString()} DA</span>
                        </div>
                        <div className="flex justify-between mb-6 text-xl font-black text-gray-900 border-t pt-4">
                            <span>Total</span>
                            <span>{total.toLocaleString()} DA</span>
                        </div>

                        <button
                            onClick={handleCheckout}
                            className="btn btn-primary w-full py-4 text-lg font-bold shadow-xl shadow-green-100 hover:shadow-2xl hover:-translate-y-1 transition-all"
                        >
                            {user ? 'PAYER' : 'SE CONNECTER ET PAYER'}
                        </button>

                        <p className="text-center text-xs text-gray-500 mt-4">
                            Livraison et taxes calculées à l'étape suivante.
                        </p>
                    </div>
                )}
            </div>

            {/* Free Delivery Incentive Popup */}
            {showFreeDeliveryPopup && enrichedCart.length > 0 && (() => {
                const storesData = calculateFreeDeliveryStatus(enrichedCart);
                const incentiveStores = getIncentiveStores(storesData);
                const firstIncentive = incentiveStores[0];

                if (!firstIncentive) return null;

                return (
                    <FreeDeliveryIncentivePopup
                        storeName={firstIncentive.storeName}
                        currentAmount={firstIncentive.totalAmount}
                        threshold={firstIncentive.freeDeliveryThreshold!}
                        amountNeeded={firstIncentive.amountToFreeDelivery!}
                        storeId={firstIncentive.storeId}
                        onClose={() => setShowFreeDeliveryPopup(false)}
                    />
                );
            })()}
        </div>
    );
}
