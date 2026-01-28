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
    OrderItem?: any[]; // Added for buyer orders display
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

    // Seller Data (for button display only)
    const [store, setStore] = useState<any>(null);

    // --- Effects ---
    useEffect(() => {
        const init = async () => {
            if (!initialUser?.id) return;

            try {
                // 1. Fetch Buyer Orders (orders placed BY this user)
                fetch(`/api/orders?userId=${initialUser.id}`)
                    .then(res => res.json())
                    .then(data => {
                        if (Array.isArray(data)) setOrders(data);
                    })
                    .catch(console.error);

                // 2. Check if user has a store (for dashboard button display)
                if (initialUser.role === 'SELLER') {
                    const storeRes = await fetch('/api/stores');
                    const stores = await storeRes.json();
                    const myStore = stores.find((s: any) => s.ownerId === initialUser.id);
                    if (myStore) setStore(myStore);
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




    // --- Render ---
    if (loading) return <div className="p-10 text-center">Chargement...</div>;
    if (!user) return null;

    return (
        <div className="container py-10">
            <h1 className="text-3xl font-bold mb-8">Mon Profil</h1>

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
                                <div className="w-full pt-4 border-t mt-4">
                                    <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-xl border border-green-100">
                                        <p className="text-sm text-gray-700 mb-2">
                                            Vous souhaitez devenir vendeur ?
                                        </p>
                                        <Link
                                            href="/why-sell"
                                            className="text-green-600 font-medium hover:underline flex items-center gap-1 text-sm"
                                        >
                                            Créer ma boutique
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </Link>
                                    </div>
                                </div>
                            )}

                            {/* Dashboard link for SELLERS */}
                            {user.role === 'SELLER' && !isEditing && store && (
                                <div className="w-full pt-2 border-t mt-2">
                                    <Link href="/seller/dashboard" className="btn w-full bg-green-600 text-white hover:bg-green-700 flex items-center justify-center gap-2">
                                        <span>🏪</span> Ma boutique en ligne
                                    </Link>
                                </div>
                            )}

                            {/* Dashboard link for ADMINS */}
                            {user.role === 'ADMIN' && !isEditing && (
                                <div className="w-full pt-2 border-t mt-2">
                                    <Link href="/admin" className="btn w-full bg-purple-600 text-white hover:bg-purple-700 flex items-center justify-center gap-2">
                                        <span>👑</span> Dashboard Admin
                                    </Link>
                                </div>
                            )}

                            {!isEditing && (
                                <button
                                    onClick={async () => {
                                        try {
                                            // Call logout API to clear HttpOnly cookie
                                            await fetch('/api/auth/logout', { method: 'POST' });
                                            // Clear localStorage
                                            localStorage.removeItem('user');
                                            localStorage.removeItem('userId');
                                            localStorage.removeItem('userRole');
                                            // Redirect to home
                                            window.location.href = '/';
                                        } catch (error) {
                                            console.error('Logout error:', error);
                                            // Fallback: still clear localStorage and redirect
                                            localStorage.removeItem('user');
                                            window.location.href = '/';
                                        }
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
                    {/* === BUYER VIEW (Mes Commandes) === */}
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

                                        {/* Products List */}
                                        {order.OrderItem && order.OrderItem.length > 0 && (
                                            <div className="mt-3 bg-gray-50 p-3 rounded-lg space-y-2">
                                                <p className="text-xs font-bold text-gray-600 uppercase mb-2">Articles commandés:</p>
                                                {order.OrderItem.map((item: any) => (
                                                    <div key={item.id} className="flex justify-between items-center text-sm">
                                                        <div className="flex-1">
                                                            <span className="font-semibold text-gray-900">
                                                                {item.quantity}x {item.Variant?.Product?.title || 'Produit'}
                                                            </span>
                                                            {item.Variant?.size && (
                                                                <span className="text-gray-500 text-xs ml-2">
                                                                    (Taille: {item.Variant.size})
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className="text-gray-700 font-medium">
                                                            {item.price * item.quantity} DA
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

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
                </div>
            </div>
        </div>
        </div >
    );
}
