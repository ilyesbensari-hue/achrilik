"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Order {
    id: string;
    total: number;
    status: string;
    createdAt: string;
    deliveryType: string;
    items: any[];
}

interface ProfileClientProps {
    initialUser: any;
}

export default function ProfileClient({ initialUser }: ProfileClientProps) {
    // --- State ---
    // User & Session (initialized from server)
    const [user, setUser] = useState<any>(initialUser);
    const [loading, setLoading] = useState(false);

    // Profile Editing
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState('');
    const [editPassword, setEditPassword] = useState('');
    const [editAddress, setEditAddress] = useState('');
    const [editPhone, setEditPhone] = useState('');

    // Buyer Data
    const [orders, setOrders] = useState<Order[]>([]);

    // Seller Data & View
    const [viewMode, setViewMode] = useState<'buyer' | 'seller'>(initialUser.role === 'SELLER' ? 'seller' : 'buyer');
    const [store, setStore] = useState<any>(null);
    const [sellerOrders, setSellerOrders] = useState<any[]>([]);

    // --- Effects ---
    useEffect(() => {
        const init = async () => {
            if (!initialUser?.id) return;

            try {
                // 1. Fetch Buyer Orders
                fetch(`/api/orders?userId=${initialUser.id}`)
                    .then(res => res.json())
                    .then(data => {
                        if (Array.isArray(data)) setOrders(data);
                    })
                    .catch(console.error);

                // 2. Fetch Seller Data (If Seller)
                if (initialUser.role === 'SELLER') {
                    const storeRes = await fetch('/api/stores');
                    const stores = await storeRes.json();
                    const myStore = stores.find((s: any) => s.ownerId === initialUser.id);

                    if (myStore) {
                        setStore(myStore);
                        const ordersRes = await fetch(`/api/orders?storeId=${myStore.id}`);
                        const ordersData = await ordersRes.json();
                        if (Array.isArray(ordersData)) setSellerOrders(ordersData);
                    }
                }
            } catch (error) {
                console.error(error);
            }
        };

        init();
    }, [initialUser]);

    // --- Handlers ---
    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        try {
            const res = await fetch(`/api/users/${user.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: editName,
                    password: editPassword || undefined,
                    address: editAddress,
                    phone: editPhone
                })
            });

            if (res.ok) {
                const updatedUser = await res.json();
                const newSession = { ...user, ...updatedUser };
                localStorage.setItem('user', JSON.stringify(newSession));
                setUser(newSession);
                setIsEditing(false);
                alert('Profil mis à jour !');
                window.dispatchEvent(new Event('storage'));
            } else {
                alert('Erreur lors de la mise à jour');
            }
        } catch (error) {
            alert('Erreur technique');
        }
    };

    const updateSellerOrder = async (orderId: string, newStatus: string) => {
        if (!confirm(`Changer le statut en "${newStatus}" ?`)) return;
        try {
            const res = await fetch(`/api/orders/${orderId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            if (res.ok) {
                setSellerOrders(sellerOrders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
            } else {
                alert('Erreur lors de la mise à jour');
            }
        } catch (e) { alert('Erreur technique'); }
    };

    // --- Derived State (Stats) ---
    const pendingCount = sellerOrders.filter(o => o.status === 'PENDING').length;
    const confirmedCount = sellerOrders.filter(o => o.status === 'CONFIRMED').length;
    // For 'Ready' counts, usually part of 'Processing', but let's count separately
    const readyCount = sellerOrders.filter(o => o.status === 'READY').length;
    const cancelledCount = sellerOrders.filter(o => o.status === 'CANCELLED').length;
    const deliveredCount = sellerOrders.filter(o => o.status === 'DELIVERED').length;


    // --- Render ---
    if (loading) return <div className="p-10 text-center">Chargement...</div>;
    if (!user) return null;

    return (
        <div className="container py-10">
            <h1 className="text-3xl font-bold mb-8">Mon Espace {viewMode === 'seller' ? 'Vendeur' : 'Client'}</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* ---------------- LEFT COL: Profile & Nav ---------------- */}
                <div className="md:col-span-1">
                    <div className="card p-6 bg-white shadow-lg sticky top-24">
                        <div className="flex flex-col items-center text-center mb-6">
                            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center text-4xl mb-4">
                                👤
                            </div>

                            {!isEditing ? (
                                <>
                                    <h2 className="text-xl font-bold">{user.name}</h2>
                                    <p className="text-gray-500">{user.email}</p>
                                    {(user.address || user.phone) && (
                                        <div className="mt-2 text-sm text-gray-600">
                                            {user.address && <p>📍 {user.address}</p>}
                                            {user.phone && <p>📞 {user.phone}</p>}
                                        </div>
                                    )}
                                    <span className="mt-2 text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full inline-block">
                                        {user.role === 'SELLER' ? 'Compte Vendeur' : 'Compte Acheteur'}
                                    </span>
                                </>
                            ) : (
                                <form onSubmit={handleUpdateProfile} className="w-full space-y-3">
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 float-left ml-1">Nom complet</label>
                                        <input className="input w-full" value={editName} onChange={e => setEditName(e.target.value)} required />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 float-left ml-1">Adresse</label>
                                        <input className="input w-full" value={editAddress} onChange={e => setEditAddress(e.target.value)} placeholder="Adresse" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 float-left ml-1">Téléphone</label>
                                        <input className="input w-full" value={editPhone} onChange={e => setEditPhone(e.target.value)} placeholder="0550..." />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 float-left ml-1">Nouveau mot de passe</label>
                                        <input type="password" className="input w-full" value={editPassword} onChange={e => setEditPassword(e.target.value)} placeholder="Optionnel" />
                                    </div>
                                    <div className="flex gap-2 justify-center pt-2">
                                        <button type="submit" className="btn btn-sm btn-primary">Enregistrer</button>
                                        <button type="button" onClick={() => setIsEditing(false)} className="btn btn-sm btn-outline">Annuler</button>
                                    </div>
                                </form>
                            )}
                        </div>

                        <div className="space-y-2">
                            {!isEditing && (
                                <button
                                    onClick={() => {
                                        setEditName(user.name);
                                        setEditAddress(user.address || '');
                                        setEditPhone(user.phone || '');
                                        setEditPassword('');
                                        setIsEditing(true);
                                    }}
                                    className="btn btn-outline w-full text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                                >
                                    ✏️ Modifier mon profil
                                </button>
                            )}

                            {/* CTA for BUYERS to become sellers */}
                            {user.role === 'BUYER' && !isEditing && (
                                <div className="space-y-2 w-full pt-2 border-t mt-2">
                                    <Link
                                        href="/become-seller"
                                        className="btn w-full bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 flex items-center justify-center gap-2 shadow-lg"
                                    >
                                        <span>🚀</span> Devenir Vendeur
                                    </Link>
                                    <p className="text-xs text-gray-500 text-center px-2">
                                        Créez votre boutique en 2 minutes • 0% commission
                                    </p>
                                </div>
                            )}

                            {/* Dashboard link for SELLERS */}
                            {user.role === 'SELLER' && !isEditing && (
                                <div className="space-y-2 w-full pt-2 border-t mt-2">
                                    <Link href="/sell" className="btn w-full bg-green-600 text-white hover:bg-green-700 flex items-center justify-center gap-2">
                                        <span>📊</span> Mon Dashboard Vendeur
                                    </Link>
                                </div>
                            )}

                            {!isEditing && (
                                <button
                                    onClick={() => {
                                        localStorage.removeItem('user');
                                        localStorage.removeItem('userId');
                                        localStorage.removeItem('userRole');
                                        window.location.href = '/';
                                    }}
                                    className="btn w-full bg-red-50 text-red-600 hover:bg-red-100"
                                >
                                    Déconnexion
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* ---------------- RIGHT COL: Main Content ---------------- */}
                <div className="md:col-span-2">

                    {/* === SELLER VIEW === */}
                    {viewMode === 'seller' && user.role === 'SELLER' ? (
                        <div className="space-y-6">
                            {/* Stats Cards */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="p-4 rounded-xl bg-orange-50 border border-orange-100 text-center">
                                    <p className="text-2xl font-bold text-orange-600">{pendingCount}</p>
                                    <p className="text-[10px] sm:text-xs text-orange-800 font-bold uppercase">En attente</p>
                                </div>
                                <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100 text-center">
                                    <p className="text-2xl font-bold text-indigo-600">{confirmedCount + readyCount}</p>
                                    <p className="text-[10px] sm:text-xs text-indigo-800 font-bold uppercase">En cours</p>
                                </div>
                                <div className="p-4 rounded-xl bg-green-50 border border-green-100 text-center">
                                    <p className="text-2xl font-bold text-green-600">{deliveredCount}</p>
                                    <p className="text-[10px] sm:text-xs text-green-800 font-bold uppercase">Livrées</p>
                                </div>
                                <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-center">
                                    <p className="text-2xl font-bold text-red-600">{cancelledCount}</p>
                                    <p className="text-[10px] sm:text-xs text-red-800 font-bold uppercase">Annulées</p>
                                </div>
                            </div>

                            <div className="card p-6 bg-white shadow-lg">
                                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                    <span>📦</span> Commandes à expédier
                                </h2>

                                {sellerOrders.length === 0 ? (
                                    <div className="text-center py-10 bg-gray-50 rounded-xl">
                                        <div className="text-4xl mb-4">💤</div>
                                        <h3 className="text-lg font-bold text-gray-900">Aucune commande reçue</h3>
                                        <p className="text-gray-500">Dès que vous recevrez une commande, elle s'affichera ici.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {sellerOrders.map(order => {
                                            // Filter items for THIS store
                                            const storeItems = order.items.filter((item: any) => item.variant.product.storeId === store?.id);
                                            if (storeItems.length === 0) return null;

                                            return (
                                                <div key={order.id} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                                                    <div className="flex flex-col md:flex-row justify-between items-start mb-4 gap-4">
                                                        <div>
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <span className="font-bold">Commande #{order.id.slice(0, 8).toUpperCase()}</span>
                                                                <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase
                                                                    ${order.status === 'PENDING' ? 'bg-orange-100 text-orange-700' :
                                                                        order.status === 'CONFIRMED' ? 'bg-indigo-100 text-indigo-700' :
                                                                            order.status === 'READY' ? 'bg-blue-100 text-blue-700' :
                                                                                order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                                                                                    'bg-red-100 text-red-700'}`}>
                                                                    {order.status}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-gray-500 mt-1">
                                                                Client: <span className="text-gray-900 font-medium">{order.user.name}</span> • {new Date(order.createdAt).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                        <div className="text-left md:text-right">
                                                            <p className="font-bold text-lg text-[#006233]">
                                                                {storeItems.reduce((acc: number, i: any) => acc + (i.price * i.quantity), 0)} DA
                                                            </p>
                                                            <span className="text-xs text-gray-400 block">{order.deliveryType === 'CLICK_COLLECT' ? '🏪 Click & Collect' : '🚚 Livraison'}</span>
                                                        </div>
                                                    </div>

                                                    {/* Items Preview */}
                                                    <div className="bg-gray-50 p-3 rounded-lg mb-4 text-sm space-y-2">
                                                        {storeItems.map((item: any) => (
                                                            <div key={item.id} className="flex justify-between">
                                                                <span><span className="font-bold">{item.quantity}x</span> {item.variant.product.title} <span className="text-gray-400">({item.variant.size})</span></span>
                                                                <span>{item.price} DA</span>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {/* Quick Actions */}
                                                    <div className="flex flex-wrap gap-2">
                                                        {order.status === 'PENDING' && (
                                                            <button onClick={() => updateSellerOrder(order.id, 'CONFIRMED')} className="btn btn-sm bg-indigo-600 text-white hover:bg-indigo-700 flex-1">
                                                                Accepter
                                                            </button>
                                                        )}
                                                        {order.status === 'CONFIRMED' && order.deliveryType === 'CLICK_COLLECT' && (
                                                            <button onClick={() => updateSellerOrder(order.id, 'READY')} className="btn btn-sm bg-blue-600 text-white hover:bg-blue-700 flex-1">
                                                                Prêt à récupérer
                                                            </button>
                                                        )}
                                                        {order.status === 'READY' && (
                                                            <button onClick={() => updateSellerOrder(order.id, 'DELIVERED')} className="btn btn-sm bg-green-600 text-white hover:bg-green-700 flex-1">
                                                                Confirmer retrait
                                                            </button>
                                                        )}
                                                        {order.status === 'CONFIRMED' && order.deliveryType !== 'CLICK_COLLECT' && (
                                                            <button onClick={() => updateSellerOrder(order.id, 'DELIVERED')} className="btn btn-sm bg-green-600 text-white hover:bg-green-700 flex-1">
                                                                Marquer Livré
                                                            </button>
                                                        )}
                                                        {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
                                                            <button onClick={() => updateSellerOrder(order.id, 'CANCELLED')} className="btn btn-sm border border-red-200 text-red-600 hover:bg-red-50">
                                                                Annuler
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (

                        /* === BUYER VIEW (Mes Commandes) === */
                        <div className="card p-6 bg-white shadow-lg">
                            <h2 className="text-2xl font-bold mb-6">Mes Commandes</h2>

                            {orders.length > 0 ? (
                                <div className="space-y-4">
                                    {orders.map(order => (
                                        <div key={order.id} className="border rounded-lg p-4 hover:border-green-500 transition-colors">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <p className="font-bold">Commande #{order.id.slice(-6)}</p>
                                                    <p className="text-sm text-gray-500">
                                                        {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                                                    </p>
                                                    {order.deliveryType === 'CLICK_COLLECT' && (
                                                        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded mt-1 inline-block">
                                                            🏪 Click & Collect
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex flex-col items-end gap-1">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold 
                                                    ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                                                            order.status === 'READY' ? 'bg-blue-100 text-blue-700 animate-pulse' :
                                                                order.status === 'CONFIRMED' ? 'bg-indigo-100 text-indigo-700' :
                                                                    order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                                                                        'bg-yellow-100 text-yellow-700'
                                                        }`}>
                                                        {order.status === 'PENDING' && 'En attente'}
                                                        {order.status === 'CONFIRMED' && 'En cours'}
                                                        {order.status === 'READY' && 'Prêt à récupérer'}
                                                        {order.status === 'DELIVERED' && 'Livrée'}
                                                        {order.status === 'CANCELLED' && 'Annulée'}
                                                    </span>
                                                    {order.status === 'READY' && order.deliveryType === 'CLICK_COLLECT' && (
                                                        <small className="text-xs text-blue-600 font-medium">
                                                            Rendez-vous en boutique !
                                                        </small>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center mt-4 pt-4 border-t">
                                                <span className="font-bold text-lg">{order.total} DA</span>
                                                <Link href={`/orders/${order.id}`} className="text-green-600 hover:underline text-sm font-medium">
                                                    Voir détails →
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10 bg-gray-50 rounded-xl">
                                    <div className="text-4xl mb-4">🛍️</div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">Aucune commande</h3>
                                    <p className="text-gray-500 mb-6">Vous n'avez pas encore passé de commande.</p>
                                    <Link href="/" className="btn btn-primary">
                                        Commencer mon shopping
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
