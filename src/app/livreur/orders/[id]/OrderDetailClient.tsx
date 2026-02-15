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
    // Calculate total for each store
    const storeTotals: Record<string, number> = {};
    let totalToStores = 0;

    uniqueStores.forEach(store => {
        const storeTotal = calculateStoreTotal(store.id, order.OrderItem);
        storeTotals[store.id] = storeTotal;
        totalToStores += storeTotal;
    });

    // Delivery fee that agent keeps
    // Use customerDeliveryFee if available (what client paid)
    // Otherwise default to 500 DA
    const deliveryFee = order.customerDeliveryFee !== undefined
        ? order.customerDeliveryFee
        : 500;

    // Platform commission (frais service) - currently 0
    const serviceFee = order.platformCommission || 0;

    // What agent keeps
    const totalToAgent = deliveryFee + serviceFee;

    // Verification
    const calculatedTotal = totalToStores + totalToAgent;
    const isValid = Math.abs(calculatedTotal - order.total) < 0.01;

    return {
        storeTotals,
        totalToStores,
        deliveryFee,
        serviceFee,
        totalToAgent,
        calculatedTotal,
        isValid
    };
}

export default function OrderDetailClient({ deliveryId, initialUser }: OrderDetailClientProps) {
    const router = useRouter();
    const [delivery, setDelivery] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [notes, setNotes] = useState('');
    const [uniqueStores, setUniqueStores] = useState<any[]>([]);

    useEffect(() => {
        fetchDeliveryDetails();
    }, [deliveryId]);

    const fetchDeliveryDetails = async () => {
        try {
            const res = await fetch(`/api/deliveries/${deliveryId}`);
            const data = await res.json();
            setDelivery(data);
            setNotes(data.agentNotes || '');

            // Extract unique stores from order items
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

    const openInGoogleMaps = () => {
        if (delivery?.order?.deliveryLatitude && delivery?.order?.deliveryLongitude) {
            const url = `https://www.google.com/maps/dir/?api=1&destination=${delivery.order.deliveryLatitude},${delivery.order.deliveryLongitude}`;
            window.open(url, '_blank');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-base-200 flex items-center justify-center">
                <div className="loading loading-spinner loading-lg"></div>
            </div>
        );
    }

    if (!delivery) {
        return (
            <div className="min-h-screen bg-base-200 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="w-16 h-16 mx-auto text-error mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Livraison non trouvée</h2>
                    <Link href="/livreur" className="btn btn-primary mt-4">
                        Retour au dashboard
                    </Link>
                </div>
            </div>
        );
    }

    const statusColors: Record<string, string> = {
        PENDING: 'badge-warning',
        IN_TRANSIT: 'badge-info',
        DELIVERED: 'badge-success',
        CANCELLED: 'badge-error'
    };

    const statusLabels: Record<string, string> = {
        PENDING: 'En attente',
        IN_TRANSIT: 'En cours',
        DELIVERED: 'Livrée',
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

    return (
        <div className="min-h-screen bg-base-200 pb-20">
            {/* Header */}
            <div className="bg-primary text-primary-content p-4">
                <div className="container mx-auto">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 mb-4 hover:opacity-80"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Retour
                    </button>
                    <h1 className="text-2xl font-bold">Détails de la Livraison</h1>
                    <div className="flex gap-3 items-center mt-2">
                        <p className="text-sm opacity-90 font-mono">
                            📦 Commande #{delivery.orderId.slice(-8).toUpperCase()}
                        </p>
                        <span className="text-xs opacity-70">
                            • Livraison {delivery.id.slice(0, 6)}
                        </span>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-6 space-y-4">
                {/* Status Badge */}
                <div className="bg-white rounded-lg p-4 shadow">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Statut actuel</span>
                        <span className={`badge ${statusColors[delivery.status]} badge-lg`}>
                            {statusLabels[delivery.status]}
                        </span>
                    </div>
                </div>

                {/* MULTI-VENDOR INDICATOR */}
                {uniqueStores.length > 1 && (
                    <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-4 shadow-md">
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">⚠️</span>
                            <div>
                                <p className="font-bold text-amber-900">
                                    Commande Multi-Vendeur - {uniqueStores.length} points de collecte
                                </p>
                                <p className="text-sm text-amber-800">
                                    Vous devez récupérer les colis chez {uniqueStores.length} magasins différents
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* POINTS A - PICKUP (All Stores) */}
                {uniqueStores.map((store, index) => {
                    const storeItems = itemsByStore[store.id] || [];

                    return (
                        <div key={store.id} className="bg-green-50 border-2 border-green-200 rounded-lg p-4 shadow space-y-3">
                            <h2 className="font-bold text-lg flex items-center gap-2 text-green-800">
                                <Package className="w-5 h-5" />
                                📦 Point A{uniqueStores.length > 1 ? ` ${index + 1}/${uniqueStores.length}` : ''} - RÉCUPÉRATION
                            </h2>

                            <div className="bg-white p-3 rounded-lg space-y-2">
                                <p className="text-lg"><strong>🏪 {store.name}</strong></p>
                                <p><strong>Adresse:</strong> {store.address || 'Non renseignée'}</p>
                                <p><strong>Ville:</strong> {store.city || store.storageCity || 'Non renseignée'}</p>
                                {store.phone && (
                                    <p><strong>Téléphone:</strong> <a href={`tel:${store.phone}`} className="link link-primary">{store.phone}</a></p>
                                )}
                                {store.User?.name && (
                                    <p><strong>Contact:</strong> {store.User.name}</p>
                                )}

                                {/* Items from this store */}
                                <div className="mt-3 pt-3 border-t border-green-200">
                                    <p className="text-sm font-semibold mb-2">
                                        Articles à récupérer ({storeItems.length}):
                                    </p>
                                    <div className="space-y-1">
                                        {storeItems.map((item: any, idx: number) => (
                                            <div key={idx} className="text-sm bg-green-50 p-2 rounded">
                                                • {item.Variant?.Product?.title} (x{item.quantity})
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {store.latitude && store.longitude && (
                                    <button
                                        onClick={() => {
                                            const url = `https://www.google.com/maps/dir/?api=1&destination=${store.latitude},${store.longitude}`;
                                            window.open(url, '_blank');
                                        }}
                                        className="btn btn-sm btn-success gap-2 mt-2"
                                    >
                                        <Navigation className="w-4 h-4" />
                                        🗺️ Itinéraire vers {store.name}
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}

                {/* Point B - DELIVERY to Customer */}
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 shadow space-y-3">
                    <h2 className="font-bold text-lg flex items-center gap-2 text-blue-800">
                        <MapPin className="w-5 h-5" />
                        🚚 Point B - LIVRAISON (Client)
                    </h2>
                    <div className="space-y-2">
                        <p><strong>Nom:</strong> {delivery.order.shippingName}</p>
                        <p><strong>Téléphone:</strong> <a href={`tel:${delivery.order.shippingPhone}`} className="link link-primary">{delivery.order.shippingPhone}</a></p>
                        <p><strong>Adresse:</strong> {delivery.order.shippingAddress}</p>
                        {delivery.order.shippingCity && (
                            <p><strong>Ville:</strong> {delivery.order.shippingCity}</p>
                        )}
                        <p><strong>Wilaya:</strong> {delivery.order.shippingWilaya}</p>
                        {delivery.order.deliveryLatitude && delivery.order.deliveryLongitude && (
                            <button
                                onClick={() => {
                                    const url = `https://www.google.com/maps/dir/?api=1&destination=${delivery.order.deliveryLatitude},${delivery.order.deliveryLongitude}`;
                                    window.open(url, '_blank');
                                }}
                                className="btn btn-sm btn-info gap-2 mt-2"
                            >
                                <Navigation className="w-4 h-4" />
                                🗺️ Itinéraire vers le client
                            </button>
                        )}
                    </div>
                </div>

                {/* Tracking Information */}
                <div className="bg-white rounded-lg p-4 shadow">
                    <h2 className="font-bold text-lg mb-3 flex items-center gap-2">
                        <Package className="w-5 h-5" />
                        Suivi Livraison
                    </h2>
                    <div className="space-y-3">
                        <div>
                            <label className="text-sm font-semibold text-gray-700 mb-1 block">
                                Numéro de dossier (Yalidine, etc.)
                            </label>
                            <input
                                type="text"
                                value={delivery.trackingNumber || ''}
                                onChange={(e) => setDelivery({ ...delivery, trackingNumber: e.target.value })}
                                placeholder="Ex: YAL123456"
                                className="input input-bordered w-full"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-gray-700 mb-1 block">
                                Lien de suivi
                            </label>
                            <input
                                type="url"
                                value={delivery.trackingUrl || ''}
                                onChange={(e) => setDelivery({ ...delivery, trackingUrl: e.target.value })}
                                placeholder="https://yalidine.com/track/123456"
                                className="input input-bordered w-full"
                            />
                            {delivery.trackingUrl && (
                                <a
                                    href={delivery.trackingUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-primary hover:underline mt-1 inline-block"
                                >
                                    🔗 Ouvrir le lien de suivi
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {/* Payment Info */}
                <div className="bg-white rounded-lg p-4 shadow">
                    <h2 className="font-bold text-lg mb-3 flex items-center gap-2">
                        <DollarSign className="w-5 h-5" />
                        Paiement
                    </h2>
                    <div className="space-y-2">
                        <p><strong>Total:</strong> {delivery.order.total} DA</p>
                        {delivery.codAmount && (
                            <>
                                <p><strong>COD à collecter:</strong> {delivery.codAmount} DA</p>
                                <p><strong>COD collecté:</strong> {delivery.codCollected ? '✅ Oui' : '❌ Non'}</p>
                            </>
                        )}
                    </div>
                </div>

                {/* PAYMENT BREAKDOWN - Detailed */}
                {(() => {
                    const breakdown = calculatePaymentBreakdown(delivery.order, uniqueStores);

                    return (
                        <div className="bg-gradient-to-br from-emerald-50 to-green-50 border-3 border-emerald-400 rounded-xl p-5 shadow-xl">
                            {/* Header */}
                            <h2 className="font-bold text-2xl flex items-center gap-2 text-emerald-900 mb-5">
                                <DollarSign className="w-7 h-7" />
                                💰 Détail Paiement COD
                            </h2>

                            {/* Total COD to Collect */}
                            <div className="bg-white rounded-xl p-4 mb-5 border-3 border-emerald-500 shadow-lg">
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                                        <span className="text-2xl">💵</span>
                                        Total COD à Collecter
                                    </span>
                                    <span className="text-4xl font-black text-emerald-700">
                                        {delivery.order.total} DA
                                    </span>
                                </div>
                            </div>

                            {/* À PAYER AUX MAGASINS */}
                            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-5 mb-5 border-3 border-amber-400 shadow-lg">
                                <h3 className="font-bold text-xl mb-4 text-amber-900 flex items-center gap-2">
                                    <span className="text-2xl">📦</span>
                                    À Payer aux Magasins
                                </h3>

                                <div className="space-y-3">
                                    {uniqueStores.map((store, index) => {
                                        const storeTotal = breakdown.storeTotals[store.id];

                                        return (
                                            <div key={store.id} className="flex justify-between items-center bg-white p-4 rounded-lg shadow border-2 border-amber-200">
                                                <span className="font-semibold text-gray-800 flex items-center gap-2">
                                                    <span className="bg-amber-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold">
                                                        {index + 1}
                                                    </span>
                                                    {store.name}
                                                </span>
                                                <span className="text-2xl font-bold text-amber-700">
                                                    {storeTotal.toLocaleString()} DA
                                                </span>
                                            </div>
                                        );
                                    })}

                                    {/* Subtotal Stores */}
                                    <div className="border-t-3 border-amber-500 pt-3 mt-3">
                                        <div className="flex justify-between items-center bg-amber-100 p-4 rounded-lg">
                                            <span className="font-bold text-xl text-amber-900">
                                                💰 Sous-total Magasins
                                            </span>
                                            <span className="text-3xl font-black text-amber-800">
                                                {breakdown.totalToStores.toLocaleString()} DA
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* VOUS GARDEZ (Livreur) */}
                            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-5 mb-5 border-3 border-blue-400 shadow-lg">
                                <h3 className="font-bold text-xl mb-4 text-blue-900 flex items-center gap-2">
                                    <span className="text-2xl">💵</span>
                                    Vous Gardez (Livreur)
                                </h3>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow border-2 border-blue-200">
                                        <span className="font-semibold text-gray-800 flex items-center gap-2">
                                            <span className="text-xl">🚚</span>
                                            Frais de livraison
                                        </span>
                                        <span className="text-2xl font-bold text-blue-700">
                                            {breakdown.deliveryFee.toLocaleString()} DA
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow border-2 border-blue-200">
                                        <span className="font-semibold text-gray-800 flex items-center gap-2">
                                            <span className="text-xl">🏢</span>
                                            Frais service Achrilik
                                        </span>
                                        <span className="text-2xl font-bold text-blue-700">
                                            {breakdown.serviceFee.toLocaleString()} DA
                                        </span>
                                    </div>

                                    {/* Total Agent */}
                                    <div className="border-t-3 border-blue-500 pt-3 mt-3">
                                        <div className="flex justify-between items-center bg-blue-100 p-4 rounded-lg">
                                            <span className="font-bold text-xl text-blue-900">
                                                💰 Total à Garder
                                            </span>
                                            <span className="text-3xl font-black text-blue-800">
                                                {breakdown.totalToAgent.toLocaleString()} DA
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* VÉRIFICATION */}
                            <div className={`rounded-xl p-4 border-3 shadow-lg ${breakdown.isValid ? 'bg-emerald-100 border-emerald-600' : 'bg-red-100 border-red-600'}`}>
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-lg flex items-center gap-2">
                                        {breakdown.isValid ? '✅' : '⚠️'}
                                        <span className={breakdown.isValid ? 'text-emerald-900' : 'text-red-900'}>
                                            Vérification
                                        </span>
                                    </span>
                                    <span className={`text-sm font-mono ${breakdown.isValid ? 'text-emerald-800' : 'text-red-800'}`}>
                                        {breakdown.totalToStores.toLocaleString()} + {breakdown.totalToAgent.toLocaleString()} = {breakdown.calculatedTotal.toLocaleString()} DA
                                    </span>
                                </div>
                            </div>

                            {/* Process Info */}
                            <div className="mt-5 bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg shadow">
                                <p className="text-sm text-yellow-900 leading-relaxed">
                                    <strong className="flex items-center gap-2 mb-2">
                                        <span className="text-xl">ℹ️</span>
                                        Process de Dispatch:
                                    </strong>
                                    Vous collectez le COD total (<strong>{delivery.order.total.toLocaleString()} DA</strong>) du client.
                                    Ensuite, vous payez chaque magasin sa part, et vous gardez <strong>{breakdown.totalToAgent.toLocaleString()} DA</strong> pour votre livraison.
                                    {breakdown.serviceFee > 0 && ' Les frais service seront facturés plus tard par Achrilik.'}
                                </p>
                            </div>
                        </div>
                    );
                })()}

                {/* Agent Notes */}
                <div className="bg-white rounded-lg p-4 shadow">
                    <h2 className="font-bold text-lg mb-3">Notes</h2>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Ajoutez vos notes ici..."
                        className="textarea textarea-bordered w-full"
                        rows={3}
                    />
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                    {delivery.status === 'PENDING' && (
                        <button
                            onClick={startDelivery}
                            disabled={updating}
                            className="btn btn-primary btn-block btn-lg"
                        >
                            {updating ? <span className="loading loading-spinner"></span> : null}
                            Démarrer la Livraison
                        </button>
                    )}

                    {delivery.status === 'IN_TRANSIT' && (
                        <button
                            onClick={markAsDelivered}
                            disabled={updating}
                            className="btn btn-success btn-block btn-lg"
                        >
                            {updating ? <span className="loading loading-spinner"></span> : <CheckCircle className="w-5 h-5" />}
                            Marquer comme Livrée
                        </button>
                    )}

                    {(delivery.status === 'PENDING' || delivery.status === 'IN_TRANSIT') && notes !== delivery.agentNotes && (
                        <button
                            onClick={() => updateStatus(delivery.status)}
                            disabled={updating}
                            className="btn btn-outline btn-block"
                        >
                            Sauvegarder les Notes
                        </button>
                    )}
                </div>

                {/* Timeline */}
                <div className="bg-white rounded-lg p-4 shadow">
                    <h2 className="font-bold text-lg mb-3 flex items-center gap-2">
                        <Clock className="w-5 h-5" />
                        Historique
                    </h2>
                    <ul className="timeline timeline-vertical">
                        <li>
                            <div className="timeline-start">Créée</div>
                            <div className="timeline-middle">
                                <div className="w-4 h-4 rounded-full bg-primary"></div>
                            </div>
                            <div className="timeline-end timeline-box">
                                {new Date(delivery.order.createdAt).toLocaleString('fr-FR')}
                            </div>
                        </li>
                        {delivery.status !== 'PENDING' && (
                            <li>
                                <div className="timeline-start">En cours</div>
                                <div className="timeline-middle">
                                    <div className="w-4 h-4 rounded-full bg-info"></div>
                                </div>
                                <div className="timeline-end timeline-box">
                                    {delivery.updatedAt ? new Date(delivery.updatedAt).toLocaleString('fr-FR') : ''}
                                </div>
                            </li>
                        )}
                        {delivery.status === 'DELIVERED' && (
                            <li>
                                <div className="timeline-start">Livrée</div>
                                <div className="timeline-middle">
                                    <div className="w-4 h-4 rounded-full bg-success"></div>
                                </div>
                                <div className="timeline-end timeline-box">
                                    {delivery.updatedAt ? new Date(delivery.updatedAt).toLocaleString('fr-FR') : ''}
                                </div>
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
}
