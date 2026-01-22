"use client";

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';

const MapPicker = dynamic(() => import('@/components/Map'), { ssr: false });

export default function CartPage() {
    const router = useRouter();
    const [cart, setCart] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

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

        // Check login status - extracted to function for reusability
        const checkAuth = () => {
            const userId = localStorage.getItem('userId');
            const userStr = localStorage.getItem('user');
            let loggedIn = !!userId;

            if (userStr) {
                try {
                    const user = JSON.parse(userStr);
                    if (user.id) loggedIn = true;
                } catch (e) { }
            }
            setIsLoggedIn(loggedIn);
        };

        // Initial check
        checkAuth();

        // Listen for storage changes (cross-tab)
        window.addEventListener('storage', checkAuth);

        // Listen for focus (when user comes back to tab)
        window.addEventListener('focus', checkAuth);

        return () => {
            window.removeEventListener('storage', checkAuth);
            window.removeEventListener('focus', checkAuth);
        };
    }, []);

    const handleCheckout = async (e?: React.MouseEvent) => {
        if (e) e.preventDefault();

        // STRICT RE-CHECK of auth status right before action
        const userId = localStorage.getItem('userId');
        const userStr = localStorage.getItem('user');

        let currentUserId = userId;
        let isActuallyLoggedIn = !!userId;

        if (userStr) {
            try {
                const userObj = JSON.parse(userStr);
                if (userObj.id) {
                    currentUserId = userObj.id;
                    isActuallyLoggedIn = true;
                }
            } catch (e) { }
        }

        // Update state to match reality
        setIsLoggedIn(isActuallyLoggedIn);

        if (!isActuallyLoggedIn) {
            alert('Veuillez vous connecter pour commander');
            router.push('/login');
            return;
        }

        if (cart.length === 0) return alert('Panier vide');
        if (method === 'CLICK_COLLECT' && !selectedStore) return alert('Veuillez sélectionner un magasin sur la carte');

        let role = localStorage.getItem('userRole');
        if (userStr) {
            try {
                const userObj = JSON.parse(userStr);
                if (userObj.role) role = userObj.role;
            } catch (e) { }
        }

        if (role === 'SELLER') {
            alert("Les comptes vendeurs ne peuvent pas effectuer d'achats. Veuillez créer un compte client pour passer commande.");
            return;
        }

        if (payment === 'ONLINE') {
            const confirmed = confirm("Simulation CIB/Edahabia: Paiement accepté par la banque ?");
            if (!confirmed) return;
        }

        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: currentUserId,
                    items: cart,
                    total,
                    paymentMethod: method === 'CLICK_COLLECT' ? 'STORE_PAYMENT' : payment,
                    deliveryType: method
                })
            });

            if (res.ok) {
                const data = await res.json();
                localStorage.setItem('cart', '[]');
                window.dispatchEvent(new Event('storage'));
                router.push(`/order-confirmation/${data.id}`);
            } else {
                alert('Erreur lors de la commande');
            }
        } catch (error) {
            console.error(error);
            alert('Erreur technique');
        }
    };

    const removeItem = (index: number) => {
        const newCart = [...cart];
        newCart.splice(index, 1);
        setCart(newCart);
        localStorage.setItem('cart', JSON.stringify(newCart));
        window.dispatchEvent(new Event('storage'));
        setTotal(newCart.reduce((sum, item) => sum + (item.price * item.quantity), 0));
    };

    return (
        <div className="container py-10">
            <h1 className="text-3xl font-bold mb-8">Mon Panier</h1>

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
                                    <img src={item.image} alt={item.title} className="w-24 h-24 object-cover rounded bg-gray-100" />
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
                                        <div className="flex items-center justify-between mt-2">
                                            <p className="text-[#006233] font-bold text-lg">{item.price.toLocaleString()} DA</p>
                                            <button onClick={() => removeItem(i)} className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors">
                                                Supprimer
                                            </button>
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
                            {isLoggedIn ? 'PAYER' : 'SE CONNECTER ET PAYER'}
                        </button>

                        <p className="text-center text-xs text-gray-500 mt-4">
                            Livraison et taxes calculées à l'étape suivante.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
