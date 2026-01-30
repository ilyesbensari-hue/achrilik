"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Product {
    id: string;
    title: string;
    price: number;
    images: string;
    Variant?: any[];
}

interface Store {
    id: string;
    name: string;
    description?: string;
    address?: string;
    city?: string;
    phone?: string;
    latitude?: number;
    longitude?: number;
    Product?: Product[];
}

interface SellerPageClientProps {
    initialUser: any;
}

export default function SellerPageClient({ initialUser }: SellerPageClientProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [store, setStore] = useState<Store | null>(null);
    const [orders, setOrders] = useState<any[]>([]);
    const [ordersLoading, setOrdersLoading] = useState(true);

    // Form states
    const [storeName, setStoreName] = useState('');
    const [storeDesc, setStoreDesc] = useState('');
    const [storeCity, setStoreCity] = useState('');
    const [storeAddress, setStoreAddress] = useState('');
    const [storePhone, setStorePhone] = useState('');
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const [locationError, setLocationError] = useState('');
    const [hasPhysicalStore, setHasPhysicalStore] = useState(true);

    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (initialUser?.id) {
            fetchStore(initialUser.id);
        }
    }, [initialUser]);

    const fetchStore = async (userId: string) => {
        try {
            const res = await fetch('/api/stores');
            const stores = await res.json();
            const myStore = stores.find((s: any) => s.ownerId === userId);
            if (myStore) {
                setStore(myStore);
                // Pre-fill form state for editing
                setStoreName(myStore.name);
                setStoreDesc(myStore.description || '');
                setStoreCity(myStore.city || '');
                setStoreAddress(myStore.address || '');
                setStorePhone(myStore.phone || '');
                setLatitude(myStore.latitude ? myStore.latitude.toString() : '');
                setLongitude(myStore.longitude ? myStore.longitude.toString() : '');
                setHasPhysicalStore(myStore.clickCollect !== false);

                // Fetch orders for this store
                fetchOrders(myStore.id);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const fetchOrders = async (storeId: string) => {
        try {
            const res = await fetch(`/api/orders?storeId=${storeId}`);
            if (res.ok) {
                const data = await res.json();
                setOrders(data || []);
            }
        } catch (e) {
            console.error('Error fetching orders:', e);
        } finally {
            setOrdersLoading(false);
        }
    };

    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            setLocationError("La géolocalisation n'est pas supportée par votre navigateur.");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLatitude(position.coords.latitude.toString());
                setLongitude(position.coords.longitude.toString());
                setLocationError("");
            },
            (error) => {
                setLocationError("Impossible de récupérer la position : " + error.message);
            }
        );
    };

    const handleCreateOrUpdateStore = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const payload = {
                name: storeName,
                description: storeDesc,
                city: storeCity,
                address: hasPhysicalStore ? storeAddress : null,
                phone: storePhone,
                latitude: hasPhysicalStore ? latitude : null,
                longitude: hasPhysicalStore ? longitude : null,
                clickCollect: hasPhysicalStore
            };

            let res;
            if (isEditing && store) {
                // Update existing store
                res = await fetch('/api/stores', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...payload, id: store.id })
                });
            } else {
                // Create new store
                res = await fetch('/api/stores', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...payload, ownerId: initialUser.id })
                });
            }

            if (res.ok) {
                const data = await res.json();
                setStore(data.Store);
                setIsEditing(false);
                alert('Boutique ' + (isEditing ? 'mise à jour' : 'créée') + ' avec succès!');
                fetchStore(initialUser.id); // Refresh data
            } else {
                alert('Erreur lors de l\'opération');
            }
        } catch (e) {
            alert('Erreur technique');
        }
    };

    const handleDeleteProduct = async (productId: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) return;

        try {
            const res = await fetch(`/api/products/${productId}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                // Refresh store data using initialUser
                if (initialUser?.id) {
                    fetchStore(initialUser.id);
                }
            } else {
                alert('Erreur lors de la suppression');
            }
        } catch (e) {
            alert('Erreur technique');
        }
    };

    const getGoogleMapsLink = () => {
        if (store?.latitude && store?.longitude) {
            return `https://www.google.com/maps?q=${store.latitude},${store.longitude}`;
        } else if (store?.address && store?.city) {
            return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.address + ', ' + store.city)}`;
        }
        return null;
    };

    if (loading) return <div className="p-10 text-center">Chargement...</div>;

    // RENDER: Create OR Edit Mode
    if (isEditing) {
        return (
            <div className="container py-10">
                <div className="card max-w-2xl mx-auto p-8">
                    <h1 className="text-3xl mb-4 text-center">{isEditing ? 'Modifier ma boutique' : 'Devenir Vendeur'}</h1>
                    {!isEditing && <p className="text-gray-600 text-center mb-8">Créez votre boutique et commencez à vendre vos articles dès aujourd'hui.</p>}

                    <form onSubmit={handleCreateOrUpdateStore} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium mb-1">Nom de la boutique</label>
                            <input className="input" required value={storeName} onChange={e => setStoreName(e.target.value)} />
                        </div>

                        {/* Physical Store Toggle */}
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
                            <input
                                type="checkbox"
                                id="physicalStore"
                                checked={hasPhysicalStore}
                                onChange={(e) => setHasPhysicalStore(e.target.checked)}
                                className="mt-1 w-5 h-5 text-primary rounded focus:ring-primary"
                            />
                            <div>
                                <label htmlFor="physicalStore" className="font-bold text-gray-900 block cursor-pointer">
                                    Disposer d'un magasin / point de retrait physique ?
                                </label>
                                <p className="text-sm text-gray-600 mt-1">
                                    Cochez cette case si les clients peuvent venir récupérer leurs commandes (Click & Collect).
                                    Si décoché, vous ferez uniquement de la livraison.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Ville</label>
                                <input className="input" required value={storeCity} onChange={e => setStoreCity(e.target.value)} placeholder="Ex: Oran" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Téléphone</label>
                                <input className="input" value={storePhone} onChange={e => setStorePhone(e.target.value)} placeholder="05 50..." />
                            </div>
                        </div>

                        {hasPhysicalStore && (
                            <div className="animate-fade-in space-y-6">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Adresse complète</label>
                                    <input className="input" required={hasPhysicalStore} value={storeAddress} onChange={e => setStoreAddress(e.target.value)} placeholder="Ex: 12 Rue Larbi Ben M'hidi" />
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <label className="block text-sm font-medium mb-2">Localisation sur la carte (Recommandé)</label>
                                    <div className="flex gap-2 mb-2">
                                        <button type="button" onClick={handleGetLocation} className="btn btn-sm bg-white border border-gray-300 hover:bg-gray-100 flex items-center gap-1">
                                            📍 Ma position actuelle
                                        </button>
                                        {locationError && <span className="text-red-500 text-xs flex items-center">{locationError}</span>}
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs text-gray-500">Latitude</label>
                                            <input type="number" step="any" className="input text-sm" value={latitude} onChange={e => setLatitude(e.target.value)} placeholder="35.69..." />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500">Longitude</label>
                                            <input type="number" step="any" className="input text-sm" value={longitude} onChange={e => setLongitude(e.target.value)} placeholder="-0.63..." />
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1">Nécessaire pour que les clients trouvent votre magasin sur la carte.</p>
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium mb-1">Description</label>
                            <textarea className="input h-32 py-2" value={storeDesc} onChange={e => setStoreDesc(e.target.value)} />
                        </div>
                        <div className="flex gap-4">
                            {isEditing && (
                                <button type="button" onClick={() => setIsEditing(false)} className="btn btn-outline flex-1">
                                    Annuler
                                </button>
                            )}
                            <button type="submit" className="btn btn-primary flex-1">
                                {isEditing ? 'Sauvegarder les modifications' : 'Créer ma boutique'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    const mapsLink = getGoogleMapsLink();

    return (
        <div className="container py-10">
            {/* Store Info Section */}
            <div className="card p-6 mb-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div>
                        <h1 className="text-3xl font-bold">{store?.name}</h1>
                        <p className="text-gray-500">{store?.description}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button onClick={() => setIsEditing(true)} className="btn btn-outline whitespace-nowrap">
                            ✏️ Ma boutique en ligne
                        </button>
                        <Link href="/sell/analytics" className="btn btn-outline whitespace-nowrap">
                            📊 Analytics
                        </Link>
                        <Link href="/sell/new" className="btn btn-primary whitespace-nowrap">
                            + Ajouter un produit
                        </Link>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="text-2xl font-bold text-green-600">{store?.Product?.length || 0}</div>
                        <div className="text-sm text-gray-600">Produits en ligne</div>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="text-2xl font-bold text-blue-600">{store?.city || 'N/A'}</div>
                        <div className="text-sm text-gray-600">Ville</div>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <div className="text-2xl font-bold text-purple-600">
                            {store?.Product?.reduce((sum, p) => sum + (p.Variant?.length || 0), 0) || 0}
                        </div>
                        <div className="text-sm text-gray-600">Variantes totales</div>
                    </div>
                </div>

                {/* Location Info */}
                {(store?.address || store?.city) && (
                    <div className="border-t pt-4">
                        <h3 className="font-semibold mb-2">📍 Localisation</h3>
                        <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                            <span className="text-gray-700">
                                {store?.address && `${store.address}, `}
                                {store?.city}
                            </span>
                            {mapsLink && (
                                <a
                                    href={mapsLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-outline btn-sm flex items-center gap-1"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    Voir sur Google Maps
                                </a>
                            )}
                        </div>
                        {store?.phone && (
                            <div className="mt-2">
                                <span className="text-gray-700">📞 {store.phone}</span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Orders Summary Section */}
            <div className="card p-6 mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">📦 Mes Commandes</h2>
                    <Link href="/sell/orders" className="btn btn-primary btn-sm">
                        Voir toutes les commandes →
                    </Link>
                </div>

                {ordersLoading ? (
                    <div className="text-center py-8 text-gray-500">Chargement des commandes...</div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <div className="text-4xl mb-2">📭</div>
                        <p className="text-gray-600">Aucune commande pour le moment</p>
                        <p className="text-sm text-gray-500 mt-1">Les commandes apparaîtront ici dès qu'un client achètera vos produits</p>
                    </div>
                ) : (
                    <div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <div className="text-2xl font-bold text-yellow-600">
                                    {orders.filter(o => o.status === 'PENDING').length}
                                </div>
                                <div className="text-sm text-gray-600">En attente</div>
                            </div>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="text-2xl font-bold text-blue-600">
                                    {orders.filter(o => o.status === 'CONFIRMED').length}
                                </div>
                                <div className="text-sm text-gray-600">Confirmées</div>
                            </div>
                            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                <div className="text-2xl font-bold text-purple-600">
                                    {orders.filter(o => o.status === 'READY').length}
                                </div>
                                <div className="text-sm text-gray-600">Prêtes</div>
                            </div>
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <div className="text-2xl font-bold text-green-600">
                                    {orders.filter(o => o.status === 'DELIVERED').length}
                                </div>
                                <div className="text-sm text-gray-500">Livrées</div>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm text-gray-600">Total des commandes</p>
                                    <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
                                </div>
                                <Link href="/sell/orders" className="btn btn-outline">
                                    Gérer les commandes
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Product List */}
            <h2 className="text-2xl font-bold mb-4">Mes Produits</h2>
            {store?.Product && store.Product.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {store.Product.map(product => {
                        const imageUrl = product.images?.split(',')[0] || '';
                        return (
                            <div key={product.id} className="card p-0 overflow-hidden group">
                                <div className="h-48 bg-gray-100 flex items-center justify-center overflow-hidden relative">
                                    {imageUrl ? (
                                        <img
                                            src={imageUrl}
                                            alt={product.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-gray-400">📷 Pas d'image</span>
                                    )}
                                    {/* Hover Actions */}
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                                        <Link
                                            href={`/products/${product.id}`}
                                            className="btn btn-sm bg-blue-500 text-white hover:bg-blue-600"
                                            target="_blank"
                                            aria-label="Voir le produit"
                                        >
                                            👁️ Voir
                                        </Link>
                                        <Link
                                            href={`/sell/products/${product.id}/edit`}
                                            className="btn btn-sm bg-white text-black hover:bg-gray-100"
                                            aria-label="Éditer le produit"
                                        >
                                            ✏️ Éditer
                                        </Link>
                                        <button
                                            onClick={() => handleDeleteProduct(product.id)}
                                            className="btn btn-sm bg-red-500 text-white hover:bg-red-600"
                                            aria-label="Supprimer le produit"
                                        >
                                            🗑️ Supprimer
                                        </button>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h3 className="font-bold truncate">{product.title}</h3>
                                    <p className="text-primary font-bold">{product.price} DA</p>
                                    <p className="text-sm text-gray-500">{product.Variant?.length || 0} variante(s)</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="card p-10 text-center text-gray-500">
                    <p className="mb-4">Vous n'avez pas encore de produits</p>
                    <Link href="/sell/new" className="btn btn-primary">
                        Ajouter votre premier produit
                    </Link>
                </div>
            )}
        </div>
    );
}
