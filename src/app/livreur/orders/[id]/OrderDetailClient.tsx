'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin, Phone, Package, DollarSign, Clock, CheckCircle, AlertCircle, Navigation } from 'lucide-react';

interface OrderDetailClientProps {
    deliveryId: string;
    initialUser: any;
}

// Helper to extract unique stores from OrderItems
function extractUniqueStores(orderItems: any[]) {
    const storesMap = new Map();

    orderItems?.forEach((item: any) => {
        const store = item.Variant?.Product?.Store;
        if (store && !storesMap.has(store.id)) {
            storesMap.set(store.id, store);
        }
    });

    return Array.from(storesMap.values());
}

// Helper to calculate total for a specific store
function calculateStoreTotal(storeId: string, orderItems: any[]): number {
    let total = 0;

    orderItems?.forEach((item: any) => {
        const itemStoreId = item.Variant?.Product?.Store?.id;
        if (itemStoreId === storeId) {
            total += item.price * item.quantity;
        }
    });

    return total;
}

// Helper to calculate payment breakdown for delivery agent
function calculatePaymentBreakdown(order: any, uniqueStores: any[]) {
    const storeTotals: Record<string, number> = {};
    let totalToStores = 0;

    uniqueStores.forEach(store => {
        const storeTotal = calculateStoreTotal(store.id, order.OrderItem);
        storeTotals[store.id] = storeTotal;
        totalToStores += storeTotal;
    });

    const deliveryFee = order.customerDeliveryFee !== undefined
        ? order.customerDeliveryFee
        : 500;

    const serviceFee = order.platformCommission || 0;
    const totalToAgent = deliveryFee + serviceFee;
    const calculatedTotal = totalToStores + totalToAgent;
    const isValid = Math.abs(calculatedTotal - order.total) < 0.01;

    return { storeTotals, totalToStores, deliveryFee, serviceFee, totalToAgent, calculatedTotal, isValid };
}

// localStorage key for pickup confirmation
function getPickupKey(deliveryId: string, storeId: string) {
    return `pickup_confirmed_${deliveryId}_${storeId}`;
}

export default function OrderDetailClient({ deliveryId, initialUser }: OrderDetailClientProps) {
    const router = useRouter();
    const [delivery, setDelivery] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [notes, setNotes] = useState('');
    const [uniqueStores, setUniqueStores] = useState<any[]>([]);
    // Track per-store pickup confirmation
    const [pickupConfirmed, setPickupConfirmed] = useState<Record<string, boolean>>({});

    useEffect(() => {
        fetchDeliveryDetails();
    }, [deliveryId]);

    // Load pickup confirmations from localStorage once delivery loaded
    useEffect(() => {
        if (!delivery || uniqueStores.length === 0) return;
        const confirmed: Record<string, boolean> = {};
        uniqueStores.forEach(store => {
            const key = getPickupKey(delivery.id, store.id);
            confirmed[store.id] = localStorage.getItem(key) === 'true';
        });
        setPickupConfirmed(confirmed);
    }, [delivery, uniqueStores]);

    const togglePickupConfirmed = (storeId: string) => {
        const newValue = !pickupConfirmed[storeId];
        const key = getPickupKey(delivery.id, storeId);
        if (newValue) {
            localStorage.setItem(key, 'true');
        } else {
            localStorage.removeItem(key);
        }
        setPickupConfirmed(prev => ({ ...prev, [storeId]: newValue }));
    };

    const fetchDeliveryDetails = async () => {
        try {
            const res = await fetch(`/api/deliveries/${deliveryId}`);
            const data = await res.json();
            setDelivery(data);
            setNotes(data.agentNotes || '');

            const stores = extractUniqueStores(data.order?.OrderItem || []);
            setUniqueStores(stores);
        } catch (error) {
            console.error('Failed to fetch delivery:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (newStatus: string) => {
        setUpdating(true);
        try {
            const res = await fetch(`/api/deliveries`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    deliveryId: delivery.id,
                    status: newStatus,
                    agentNotes: notes,
                    trackingNumber: delivery.trackingNumber,
                    trackingUrl: delivery.trackingUrl
                })
            });

            if (res.ok) {
                await fetchDeliveryDetails();
                alert('Statut mis à jour avec succès !');
            }
        } catch (error) {
            console.error('Failed to update status:', error);
            alert('Erreur lors de la mise à jour');
        } finally {
            setUpdating(false);
        }
    };

    const markAsDelivered = async () => {
        if (!confirm('Confirmer la livraison de cette commande ?')) return;
        await updateStatus('DELIVERED');
    };

    const startDelivery = async () => {
        if (!confirm('Démarrer cette livraison ?')) return;
        await updateStatus('IN_TRANSIT');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="loading loading-spinner loading-lg"></div>
            </div>
        );
    }

    if (!delivery) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Livraison non trouvée</h2>
                    <Link href="/livreur" className="btn btn-primary mt-4">
                        Retour au dashboard
                    </Link>
                </div>
            </div>
        );
    }

    const statusColors: Record<string, string> = {
        PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        IN_TRANSIT: 'bg-blue-100 text-blue-800 border-blue-300',
        DELIVERED: 'bg-green-100 text-green-800 border-green-300',
        CANCELLED: 'bg-red-100 text-red-800 border-red-300'
    };

    const statusLabels: Record<string, string> = {
        PENDING: 'En attente',
        IN_TRANSIT: 'En cours de livraison',
        DELIVERED: 'Livrée ✅',
        CANCELLED: 'Annulée'
    };

    // Group items by store
    const itemsByStore: Record<string, any[]> = {};
    delivery.order.OrderItem?.forEach((item: any) => {
        const storeId = item.Variant?.Product?.Store?.id || 'unknown';
        if (!itemsByStore[storeId]) {
            itemsByStore[storeId] = [];
        }
        itemsByStore[storeId].push(item);
    });

    const allPickupsConfirmed = uniqueStores.length > 0 && uniqueStores.every(s => pickupConfirmed[s.id]);

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Header */}
            <div className="bg-[#006233] text-white px-4 pt-4 pb-5 sticky top-0 z-10 shadow-lg">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 mb-3 opacity-90 active:opacity-70"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span className="text-sm font-semibold">Retour</span>
                </button>
                <h1 className="text-xl font-black">Détails de la Livraison</h1>
                <div className="flex gap-2 items-center mt-1">
                    <p className="text-sm opacity-90 font-mono">
                        📦 #{delivery.orderId.slice(-8).toUpperCase()}
                    </p>
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-bold ${statusColors[delivery.status]}`}>
                        {statusLabels[delivery.status]}
                    </span>
                </div>
            </div>

            <div className="px-4 py-4 space-y-4 max-w-2xl mx-auto">
                {/* MULTI-VENDOR NOTICE */}
                {uniqueStores.length > 1 && (
                    <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">⚠️</span>
                            <div>
                                <p className="font-bold text-amber-900 text-sm">
                                    Commande multi-vendeur — {uniqueStores.length} points de collecte
                                </p>
                                <p className="text-xs text-amber-700 mt-0.5">
                                    Récupérez les colis chez {uniqueStores.length} magasins avant la livraison
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* ===== POINTS DE COLLECTE ===== */}
                {uniqueStores.map((store, index) => {
                    const storeItems = itemsByStore[store.id] || [];
                    const isConfirmed = pickupConfirmed[store.id] || false;
                    const totalStores = uniqueStores.length;

                    return (
                        <div
                            key={store.id}
                            className={`rounded-xl border-2 overflow-hidden shadow-md transition-all ${isConfirmed
                                ? 'border-green-400 bg-green-50'
                                : 'border-green-200 bg-white'
                                }`}
                        >
                            {/* Section header */}
                            <div className={`px-4 py-3 flex items-center justify-between ${isConfirmed ? 'bg-green-400' : 'bg-green-600'}`}>
                                <div className="flex items-center gap-2">
                                    <span className="text-white text-lg">📦</span>
                                    <div>
                                        <p className="text-white font-black text-sm">
                                            Point de collecte {totalStores > 1 ? `${index + 1}/${totalStores}` : ''}
                                        </p>
                                        <p className="text-green-100 text-xs">Récupérer le colis ici</p>
                                    </div>
                                </div>
                                {isConfirmed && (
                                    <span className="text-white font-bold text-xs bg-green-600 px-2 py-1 rounded-full">
                                        ✅ Collecté
                                    </span>
                                )}
                            </div>

                            <div className="p-4 space-y-3">
                                {/* Store info */}
                                <div className="space-y-1.5">
                                    <p className="font-black text-gray-900 text-base">🏪 {store.name}</p>
                                    {store.address && (
                                        <p className="text-sm text-gray-600">📍 {store.address}</p>
                                    )}
                                    {(store.city || store.storageCity) && (
                                        <p className="text-sm text-gray-600">🏙️ {store.city || store.storageCity}</p>
                                    )}
                                    {store.phone && (
                                        <a
                                            href={`tel:${store.phone}`}
                                            className="flex items-center gap-2 text-green-700 font-semibold text-sm"
                                        >
                                            📞 {store.phone}
                                        </a>
                                    )}
                                    {store.User?.name && (
                                        <p className="text-sm text-gray-600">👤 {store.User.name}</p>
                                    )}
                                </div>

                                {/* GPS Button */}
                                {store.latitude && store.longitude && (
                                    <button
                                        onClick={() => {
                                            const url = `https://www.google.com/maps/dir/?api=1&destination=${store.latitude},${store.longitude}`;
                                            window.open(url, '_blank');
                                        }}
                                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-green-600 text-white rounded-lg font-bold text-sm active:bg-green-700"
                                    >
                                        <Navigation className="w-4 h-4" />
                                        🗺️ Itinéraire vers {store.name}
                                    </button>
                                )}

                                {/* ===== PRODUITS À VÉRIFIER ===== */}
                                <div className="border-t border-green-200 pt-3">
                                    <p className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">
                                        🔍 Vérifier les produits ({storeItems.length} article{storeItems.length > 1 ? 's' : ''})
                                    </p>
                                    <div className="space-y-3">
                                        {storeItems.map((item: any, idx: number) => {
                                            const product = item.Variant?.Product;
                                            const images = product?.images || [];
                                            const firstImage = images[0] || null;
                                            const variantSize = item.Variant?.size;
                                            const variantColor = item.Variant?.color;

                                            return (
                                                <div key={idx} className="flex gap-3 bg-white rounded-xl p-3 border border-green-100 shadow-sm">
                                                    {/* Product Image */}
                                                    <div className="flex-shrink-0">
                                                        {firstImage ? (
                                                            <img
                                                                src={firstImage}
                                                                alt={product?.title || 'Produit'}
                                                                className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200 shadow"
                                                            />
                                                        ) : (
                                                            <div className="w-20 h-20 bg-gray-100 rounded-lg border-2 border-gray-200 flex items-center justify-center">
                                                                <Package className="w-8 h-8 text-gray-400" />
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Product Info */}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-bold text-gray-900 text-sm leading-tight mb-1">
                                                            {product?.title || 'Produit inconnu'}
                                                        </p>
                                                        <div className="flex flex-wrap gap-1.5 mb-1.5">
                                                            {variantSize && (
                                                                <span className="text-[10px] font-bold bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                                                                    Taille: {variantSize}
                                                                </span>
                                                            )}
                                                            {variantColor && (
                                                                <span className="text-[10px] font-bold bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                                                                    Couleur: {variantColor}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-xs font-bold text-[#006233]">
                                                                Qté: {item.quantity}
                                                            </span>
                                                            <span className="text-xs font-bold text-gray-700">
                                                                {(item.price * item.quantity).toLocaleString()} DA
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* ===== CHECKBOX COLLECTE ===== */}
                                <button
                                    onClick={() => togglePickupConfirmed(store.id)}
                                    className={`w-full flex items-center justify-center gap-3 py-4 rounded-xl border-2 font-black text-base transition-all active:scale-[0.98] ${isConfirmed
                                        ? 'bg-green-500 border-green-600 text-white shadow-lg'
                                        : 'bg-white border-dashed border-green-400 text-green-700'
                                        }`}
                                >
                                    <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isConfirmed
                                        ? 'bg-white border-white'
                                        : 'border-green-400'
                                        }`}>
                                        {isConfirmed && <CheckCircle className="w-5 h-5 text-green-600" />}
                                    </div>
                                    {isConfirmed
                                        ? `✅ Colis récupéré chez ${store.name}`
                                        : `Appuyer pour confirmer la collecte`
                                    }
                                </button>
                            </div>
                        </div>
                    );
                })}

                {/* ===== POINT DE LIVRAISON ===== */}
                <div className="bg-white border-2 border-blue-200 rounded-xl overflow-hidden shadow-md">
                    <div className="bg-blue-600 px-4 py-3 flex items-center gap-2">
                        <span className="text-white text-lg">🏠</span>
                        <div>
                            <p className="text-white font-black text-sm">Point de livraison</p>
                            <p className="text-blue-100 text-xs">Livrer au client</p>
                        </div>
                    </div>
                    <div className="p-4 space-y-2">
                        <p className="font-black text-gray-900 text-base">👤 {delivery.order.shippingName}</p>
                        <a
                            href={`tel:${delivery.order.shippingPhone}`}
                            className="flex items-center gap-2 text-blue-700 font-semibold text-sm"
                        >
                            📞 {delivery.order.shippingPhone}
                        </a>
                        <p className="text-sm text-gray-600">📍 {delivery.order.shippingAddress}</p>
                        {delivery.order.shippingCity && (
                            <p className="text-sm text-gray-600">🏙️ {delivery.order.shippingCity}</p>
                        )}
                        <p className="text-sm text-gray-600">🗺️ {delivery.order.shippingWilaya}</p>
                        {delivery.order.deliveryLatitude && delivery.order.deliveryLongitude && (
                            <button
                                onClick={() => {
                                    const url = `https://www.google.com/maps/dir/?api=1&destination=${delivery.order.deliveryLatitude},${delivery.order.deliveryLongitude}`;
                                    window.open(url, '_blank');
                                }}
                                className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white rounded-lg font-bold text-sm active:bg-blue-700 mt-2"
                            >
                                <Navigation className="w-4 h-4" />
                                🗺️ Itinéraire vers le client
                            </button>
                        )}
                    </div>
                </div>

                {/* Tracking */}
                <div className="bg-white rounded-xl p-4 shadow border border-gray-200">
                    <h2 className="font-bold text-base mb-3 flex items-center gap-2 text-gray-800">
                        <Package className="w-5 h-5" />
                        Suivi Livraison
                    </h2>
                    <div className="space-y-3">
                        <div>
                            <label className="text-xs font-bold text-gray-600 mb-1 block uppercase tracking-wide">
                                Numéro de dossier (Yalidine, etc.)
                            </label>
                            <input
                                type="text"
                                value={delivery.trackingNumber || ''}
                                onChange={(e) => setDelivery({ ...delivery, trackingNumber: e.target.value })}
                                placeholder="Ex: YAL123456"
                                className="input input-bordered w-full text-sm"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-600 mb-1 block uppercase tracking-wide">
                                Lien de suivi
                            </label>
                            <input
                                type="url"
                                value={delivery.trackingUrl || ''}
                                onChange={(e) => setDelivery({ ...delivery, trackingUrl: e.target.value })}
                                placeholder="https://yalidine.com/track/123456"
                                className="input input-bordered w-full text-sm"
                            />
                            {delivery.trackingUrl && (
                                <a
                                    href={delivery.trackingUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-600 hover:underline mt-1 inline-block"
                                >
                                    🔗 Ouvrir le lien de suivi
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {/* Payment Breakdown */}
                {(() => {
                    const breakdown = calculatePaymentBreakdown(delivery.order, uniqueStores);

                    return (
                        <div className="bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-400 rounded-xl p-4 shadow">
                            <h2 className="font-bold text-lg flex items-center gap-2 text-emerald-900 mb-4">
                                <DollarSign className="w-6 h-6" />
                                💰 Détail Paiement COD
                            </h2>

                            {/* Total à collecter */}
                            <div className="bg-white rounded-xl p-4 mb-4 border-2 border-emerald-500 shadow">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                        <span className="text-xl">💵</span>
                                        Total à collecter
                                    </span>
                                    <span className="text-3xl font-black text-emerald-700">
                                        {delivery.order.total} DA
                                    </span>
                                </div>
                            </div>

                            {/* À payer aux magasins */}
                            <div className="bg-amber-50 rounded-xl p-4 mb-4 border-2 border-amber-300 shadow">
                                <h3 className="font-bold text-base mb-3 text-amber-900 flex items-center gap-2">
                                    📦 À payer aux magasins
                                </h3>
                                <div className="space-y-2">
                                    {uniqueStores.map((store, index) => {
                                        const storeTotal = breakdown.storeTotals[store.id];
                                        return (
                                            <div key={store.id} className="flex justify-between items-center bg-white p-3 rounded-lg border border-amber-200">
                                                <span className="font-semibold text-gray-800 flex items-center gap-2 text-sm">
                                                    <span className="bg-amber-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                                                        {index + 1}
                                                    </span>
                                                    {store.name}
                                                </span>
                                                <span className="text-lg font-bold text-amber-700">
                                                    {storeTotal.toLocaleString()} DA
                                                </span>
                                            </div>
                                        );
                                    })}
                                    <div className="flex justify-between items-center bg-amber-100 p-3 rounded-lg mt-2">
                                        <span className="font-bold text-amber-900 text-sm">💰 Sous-total magasins</span>
                                        <span className="text-xl font-black text-amber-800">{breakdown.totalToStores.toLocaleString()} DA</span>
                                    </div>
                                </div>
                            </div>

                            {/* Vous gardez */}
                            <div className="bg-blue-50 rounded-xl p-4 mb-4 border-2 border-blue-300 shadow">
                                <h3 className="font-bold text-base mb-3 text-blue-900 flex items-center gap-2">
                                    💵 Vous gardez
                                </h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-blue-200">
                                        <span className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                                            🚚 Frais de livraison
                                        </span>
                                        <span className="text-lg font-bold text-blue-700">{breakdown.deliveryFee.toLocaleString()} DA</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-blue-100 p-3 rounded-lg">
                                        <span className="font-bold text-blue-900 text-sm">Total à garder</span>
                                        <span className="text-xl font-black text-blue-800">{breakdown.totalToAgent.toLocaleString()} DA</span>
                                    </div>
                                </div>
                            </div>

                            {/* Info */}
                            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 rounded-lg text-xs text-yellow-900 leading-relaxed">
                                <strong>ℹ️ Process :</strong> Collectez <strong>{delivery.order.total.toLocaleString()} DA</strong> du client, payez chaque magasin sa part, et gardez <strong>{breakdown.totalToAgent.toLocaleString()} DA</strong> pour votre livraison.
                            </div>
                        </div>
                    );
                })()}

                {/* Notes */}
                <div className="bg-white rounded-xl p-4 shadow border border-gray-200">
                    <h2 className="font-bold text-base mb-3 text-gray-800">📝 Notes</h2>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Ajoutez vos notes ici..."
                        className="textarea textarea-bordered w-full text-sm"
                        rows={3}
                    />
                </div>

                {/* Historique */}
                <div className="bg-white rounded-xl p-4 shadow border border-gray-200">
                    <h2 className="font-bold text-base mb-3 flex items-center gap-2 text-gray-800">
                        <Clock className="w-5 h-5" />
                        Historique
                    </h2>
                    <ul className="timeline timeline-vertical">
                        <li>
                            <div className="timeline-start text-xs">Créée</div>
                            <div className="timeline-middle">
                                <div className="w-4 h-4 rounded-full bg-[#006233]"></div>
                            </div>
                            <div className="timeline-end timeline-box text-xs">
                                {new Date(delivery.order.createdAt).toLocaleString('fr-FR')}
                            </div>
                        </li>
                        {delivery.status !== 'PENDING' && (
                            <li>
                                <div className="timeline-start text-xs">En cours</div>
                                <div className="timeline-middle">
                                    <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                                </div>
                                <div className="timeline-end timeline-box text-xs">
                                    {delivery.updatedAt ? new Date(delivery.updatedAt).toLocaleString('fr-FR') : ''}
                                </div>
                            </li>
                        )}
                        {delivery.status === 'DELIVERED' && (
                            <li>
                                <div className="timeline-start text-xs">Livrée</div>
                                <div className="timeline-middle">
                                    <div className="w-4 h-4 rounded-full bg-green-500"></div>
                                </div>
                                <div className="timeline-end timeline-box text-xs">
                                    {delivery.updatedAt ? new Date(delivery.updatedAt).toLocaleString('fr-FR') : ''}
                                </div>
                            </li>
                        )}
                    </ul>
                </div>
            </div>

            {/* Fixed Bottom Action Buttons */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 space-y-2 shadow-2xl">
                {/* Save notes if changed */}
                {(delivery.status === 'PENDING' || delivery.status === 'IN_TRANSIT') && notes !== delivery.agentNotes && (
                    <button
                        onClick={() => updateStatus(delivery.status)}
                        disabled={updating}
                        className="btn btn-outline btn-sm btn-block"
                    >
                        Sauvegarder les notes
                    </button>
                )}

                {delivery.status === 'PENDING' && (
                    <button
                        onClick={startDelivery}
                        disabled={updating}
                        className="btn btn-block btn-lg text-white font-black text-base"
                        style={{ backgroundColor: '#006233' }}
                    >
                        {updating ? <span className="loading loading-spinner"></span> : '🚀'}
                        Démarrer la livraison
                    </button>
                )}

                {delivery.status === 'IN_TRANSIT' && (
                    <button
                        onClick={markAsDelivered}
                        disabled={updating || !allPickupsConfirmed}
                        className={`btn btn-block btn-lg font-black text-base ${allPickupsConfirmed ? 'btn-success' : 'btn-disabled'}`}
                    >
                        {updating ? <span className="loading loading-spinner"></span> : <CheckCircle className="w-5 h-5" />}
                        {allPickupsConfirmed
                            ? 'Marquer comme livrée ✅'
                            : `Confirmez d'abord les collectes (${Object.values(pickupConfirmed).filter(Boolean).length}/${uniqueStores.length})`
                        }
                    </button>
                )}
            </div>
        </div>
    );
}
