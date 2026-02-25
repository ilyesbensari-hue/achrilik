'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Package, DollarSign, Clock, CheckCircle, AlertCircle, Navigation, AlertTriangle, MessageSquare } from 'lucide-react';

interface OrderDetailClientProps {
    deliveryId: string;
    initialUser: any;
}

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

function calculateStoreTotal(storeId: string, orderItems: any[]): number {
    let total = 0;
    orderItems?.forEach((item: any) => {
        const itemStoreId = item.Variant?.Product?.Store?.id;
        if (itemStoreId === storeId) total += item.price * item.quantity;
    });
    return total;
}

function calculatePaymentBreakdown(order: any, uniqueStores: any[]) {
    const storeTotals: Record<string, number> = {};
    let totalToStores = 0;
    uniqueStores.forEach(store => {
        const storeTotal = calculateStoreTotal(store.id, order.OrderItem);
        storeTotals[store.id] = storeTotal;
        totalToStores += storeTotal;
    });
    const deliveryFee = order.customerDeliveryFee !== undefined ? order.customerDeliveryFee : 500;
    const serviceFee = order.platformCommission || 0;
    const totalToAgent = deliveryFee + serviceFee;
    const calculatedTotal = totalToStores + totalToAgent;
    const isValid = Math.abs(calculatedTotal - order.total) < 0.01;
    return { storeTotals, totalToStores, deliveryFee, serviceFee, totalToAgent, calculatedTotal, isValid };
}

// localStorage helpers
function getPickupStateKey(deliveryId: string, storeId: string) {
    return `pickup_state_${deliveryId}_${storeId}`;
}
function getPickupCommentKey(deliveryId: string, storeId: string) {
    return `pickup_comment_${deliveryId}_${storeId}`;
}

type PickupStatus = 'pending' | 'collected' | 'problem';
type ProblemReason = '' | 'not_ready' | 'out_of_stock' | 'wrong_item' | 'other';

const PROBLEM_LABELS: Record<string, string> = {
    not_ready: '⏳ Colis pas encore prêt',
    out_of_stock: '❌ Produit plus disponible chez le vendeur',
    wrong_item: '⚠️ Mauvais produit / erreur de colis',
    other: '💬 Autre problème',
};

export default function OrderDetailClient({ deliveryId, initialUser }: OrderDetailClientProps) {
    const router = useRouter();
    const [delivery, setDelivery] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [notes, setNotes] = useState('');
    const [uniqueStores, setUniqueStores] = useState<any[]>([]);

    // Per-store pickup state
    const [pickupStates, setPickupStates] = useState<Record<string, PickupStatus>>({});
    const [pickupReasons, setPickupReasons] = useState<Record<string, ProblemReason>>({});
    const [pickupComments, setPickupComments] = useState<Record<string, string>>({});
    // Which store has the problem form open
    const [problemFormOpen, setProblemFormOpen] = useState<Record<string, boolean>>({});

    useEffect(() => { fetchDeliveryDetails(); }, [deliveryId]);

    useEffect(() => {
        if (!delivery || uniqueStores.length === 0) return;
        const states: Record<string, PickupStatus> = {};
        const reasons: Record<string, ProblemReason> = {};
        const comments: Record<string, string> = {};
        uniqueStores.forEach(store => {
            states[store.id] = (localStorage.getItem(getPickupStateKey(delivery.id, store.id)) as PickupStatus) || 'pending';
            reasons[store.id] = (localStorage.getItem(`pickup_reason_${delivery.id}_${store.id}`) as ProblemReason) || '';
            comments[store.id] = localStorage.getItem(getPickupCommentKey(delivery.id, store.id)) || '';
        });
        setPickupStates(states);
        setPickupReasons(reasons);
        setPickupComments(comments);
    }, [delivery, uniqueStores]);

    const setPickupStatus = (storeId: string, status: PickupStatus) => {
        localStorage.setItem(getPickupStateKey(delivery.id, storeId), status);
        setPickupStates(prev => ({ ...prev, [storeId]: status }));
        if (status !== 'problem') {
            setProblemFormOpen(prev => ({ ...prev, [storeId]: false }));
        }
    };

    const setPickupReason = (storeId: string, reason: ProblemReason) => {
        localStorage.setItem(`pickup_reason_${delivery.id}_${storeId}`, reason);
        setPickupReasons(prev => ({ ...prev, [storeId]: reason }));
    };

    const setPickupComment = (storeId: string, comment: string) => {
        localStorage.setItem(getPickupCommentKey(delivery.id, storeId), comment);
        setPickupComments(prev => ({ ...prev, [storeId]: comment }));
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
            alert('Erreur lors de la mise à jour');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="loading loading-spinner loading-lg"></div>
        </div>
    );

    if (!delivery) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
                <AlertCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
                <h2 className="text-2xl font-bold mb-2">Livraison non trouvée</h2>
                <Link href="/livreur" className="btn btn-primary mt-4">Retour au dashboard</Link>
            </div>
        </div>
    );

    const statusColors: Record<string, string> = {
        PENDING: 'bg-yellow-100 text-yellow-800',
        IN_TRANSIT: 'bg-blue-100 text-blue-800',
        DELIVERED: 'bg-green-100 text-green-800',
        CANCELLED: 'bg-red-100 text-red-800'
    };
    const statusLabels: Record<string, string> = {
        PENDING: 'En attente',
        IN_TRANSIT: 'En cours',
        DELIVERED: 'Livrée ✅',
        CANCELLED: 'Annulée'
    };

    const itemsByStore: Record<string, any[]> = {};
    delivery.order.OrderItem?.forEach((item: any) => {
        const storeId = item.Variant?.Product?.Store?.id || 'unknown';
        if (!itemsByStore[storeId]) itemsByStore[storeId] = [];
        itemsByStore[storeId].push(item);
    });

    const allStoresHandled = uniqueStores.length > 0 && uniqueStores.every(s =>
        pickupStates[s.id] === 'collected' || pickupStates[s.id] === 'problem'
    );
    const collectedCount = uniqueStores.filter(s => pickupStates[s.id] === 'collected').length;
    const problemCount = uniqueStores.filter(s => pickupStates[s.id] === 'problem').length;

    return (
        <div className="min-h-screen bg-gray-100 pb-28">
            {/* Sticky Header */}
            <div className="bg-[#006233] text-white px-4 pt-safe pt-4 pb-4 sticky top-0 z-20 shadow-lg">
                <button onClick={() => router.back()} className="flex items-center gap-1.5 mb-2 opacity-90">
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm font-semibold">Retour</span>
                </button>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-black">Livraison #{delivery.orderId.slice(-8).toUpperCase()}</h1>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold mt-1 inline-block ${statusColors[delivery.status]}`}>
                            {statusLabels[delivery.status]}
                        </span>
                    </div>
                    {/* Progress indicator */}
                    {uniqueStores.length > 0 && (
                        <div className="text-right">
                            <div className="text-xs text-green-200 font-semibold">Collectes</div>
                            <div className="text-2xl font-black">
                                {collectedCount + problemCount}/{uniqueStores.length}
                            </div>
                            {problemCount > 0 && (
                                <div className="text-[10px] text-orange-300 font-bold">{problemCount} problème{problemCount > 1 ? 's' : ''}</div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-3 py-4 space-y-3">

                {/* ═══════════════════════════════════════ */}
                {/* ÉTAPES — Points de collecte             */}
                {/* ═══════════════════════════════════════ */}
                <div className="space-y-3">
                    {uniqueStores.map((store, index) => {
                        const storeItems = itemsByStore[store.id] || [];
                        const state = pickupStates[store.id] || 'pending';
                        const reason = pickupReasons[store.id] || '';
                        const comment = pickupComments[store.id] || '';
                        const isProblemOpen = problemFormOpen[store.id] || false;
                        const totalStores = uniqueStores.length;

                        const borderColor = state === 'collected'
                            ? 'border-green-400'
                            : state === 'problem'
                                ? 'border-orange-400'
                                : 'border-gray-200';

                        const headerBg = state === 'collected'
                            ? 'bg-green-600'
                            : state === 'problem'
                                ? 'bg-orange-500'
                                : 'bg-gray-700';

                        return (
                            <div key={store.id} className={`bg-white rounded-2xl border-2 ${borderColor} overflow-hidden shadow-sm`}>
                                {/* Step header */}
                                <div className={`${headerBg} px-4 py-3 flex items-center justify-between`}>
                                    <div className="flex items-center gap-3">
                                        <div className="bg-white/20 rounded-full w-8 h-8 flex items-center justify-center font-black text-white text-sm">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <p className="text-white font-black text-sm">
                                                📦 Point de collecte {totalStores > 1 ? `${index + 1} sur ${totalStores}` : ''}
                                            </p>
                                            <p className="text-white/80 text-xs">{store.name}</p>
                                        </div>
                                    </div>
                                    <div>
                                        {state === 'collected' && <span className="bg-white text-green-700 text-xs font-black px-2 py-1 rounded-full">✅ Récupéré</span>}
                                        {state === 'problem' && <span className="bg-white text-orange-600 text-xs font-black px-2 py-1 rounded-full">⚠️ Problème</span>}
                                        {state === 'pending' && <span className="bg-white/20 text-white text-xs font-bold px-2 py-1 rounded-full">En attente</span>}
                                    </div>
                                </div>

                                <div className="p-4 space-y-4">
                                    {/* Store info */}
                                    <div className="space-y-1.5">
                                        <p className="font-black text-gray-900">🏪 {store.name}</p>
                                        {store.address && <p className="text-sm text-gray-600">📍 {store.address}</p>}
                                        {(store.city || store.storageCity) && <p className="text-sm text-gray-600">🏙️ {store.city || store.storageCity}</p>}
                                        {store.phone && (
                                            <a href={`tel:${store.phone}`} className="flex items-center gap-2 text-green-700 font-bold text-sm">
                                                📞 {store.phone}
                                            </a>
                                        )}
                                    </div>

                                    {/* GPS */}
                                    {store.latitude && store.longitude && (
                                        <button
                                            onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${store.latitude},${store.longitude}`, '_blank')}
                                            className="w-full flex items-center justify-center gap-2 py-2 bg-gray-800 text-white rounded-xl font-bold text-sm"
                                        >
                                            <Navigation className="w-4 h-4" />
                                            Itinéraire GPS
                                        </button>
                                    )}

                                    {/* Products to verify */}
                                    <div>
                                        <p className="text-xs font-black text-gray-500 uppercase tracking-wider mb-2">
                                            🔍 Produits à vérifier ({storeItems.length})
                                        </p>
                                        <div className="space-y-2">
                                            {storeItems.map((item: any, idx: number) => {
                                                const product = item.Variant?.Product;
                                                const images = product?.images || [];
                                                const firstImage = images[0] || null;
                                                return (
                                                    <div key={idx} className="flex gap-3 bg-gray-50 rounded-xl p-2.5 border border-gray-100">
                                                        {firstImage ? (
                                                            <img src={firstImage} alt={product?.title} className="w-16 h-16 object-cover rounded-lg border border-gray-200 flex-shrink-0" />
                                                        ) : (
                                                            <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                                                                <Package className="w-6 h-6 text-gray-400" />
                                                            </div>
                                                        )}
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-bold text-gray-900 text-sm leading-tight">{product?.title}</p>
                                                            <div className="flex flex-wrap gap-1 mt-1">
                                                                {item.Variant?.size && (
                                                                    <span className="text-[10px] bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded">
                                                                        {item.Variant.size}
                                                                    </span>
                                                                )}
                                                                {item.Variant?.color && (
                                                                    <span className="text-[10px] bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded">
                                                                        {item.Variant.color}
                                                                    </span>
                                                                )}
                                                                <span className="text-[10px] bg-[#006233] text-white px-1.5 py-0.5 rounded font-bold">
                                                                    x{item.quantity}
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-gray-500 mt-0.5">{(item.price * item.quantity).toLocaleString()} DA</p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* ── ACTION BUTTONS ── */}
                                    {state === 'pending' && !isProblemOpen && (
                                        <div className="grid grid-cols-2 gap-2 pt-1">
                                            <button
                                                onClick={() => setPickupStatus(storeId, 'collected')}
                                                className="flex flex-col items-center justify-center gap-1 py-4 bg-green-500 text-white rounded-2xl font-black text-sm active:bg-green-600 shadow-md"
                                            >
                                                <CheckCircle className="w-7 h-7" />
                                                Colis récupéré
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setProblemFormOpen(prev => ({ ...prev, [store.id]: true }));
                                                }}
                                                className="flex flex-col items-center justify-center gap-1 py-4 bg-orange-100 text-orange-700 border-2 border-orange-300 rounded-2xl font-black text-sm active:bg-orange-200"
                                            >
                                                <AlertTriangle className="w-7 h-7" />
                                                Signaler un problème
                                            </button>
                                        </div>
                                    )}

                                    {/* Problem form */}
                                    {(isProblemOpen || state === 'problem') && (
                                        <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-4 space-y-3">
                                            <p className="font-black text-orange-800 text-sm flex items-center gap-2">
                                                <AlertTriangle className="w-4 h-4" />
                                                Nature du problème
                                            </p>
                                            <div className="space-y-2">
                                                {Object.entries(PROBLEM_LABELS).map(([key, label]) => (
                                                    <button
                                                        key={key}
                                                        onClick={() => setPickupReason(store.id, key as ProblemReason)}
                                                        className={`w-full text-left text-sm py-2.5 px-3 rounded-xl border-2 font-semibold transition-all ${reason === key
                                                            ? 'bg-orange-500 text-white border-orange-500'
                                                            : 'bg-white text-gray-700 border-gray-200'
                                                            }`}
                                                    >
                                                        {label}
                                                    </button>
                                                ))}
                                            </div>

                                            {/* Comment */}
                                            <div>
                                                <label className="text-xs font-bold text-orange-700 uppercase mb-1 block flex items-center gap-1">
                                                    <MessageSquare className="w-3 h-3" />
                                                    Commentaire (optionnel)
                                                </label>
                                                <textarea
                                                    value={comment}
                                                    onChange={e => setPickupComment(store.id, e.target.value)}
                                                    placeholder="Ex: Le vendeur dit que la commande sera prête demain matin..."
                                                    className="w-full border-2 border-orange-200 rounded-xl p-3 text-sm resize-none bg-white"
                                                    rows={3}
                                                />
                                            </div>

                                            {/* Confirm problem */}
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => {
                                                        setPickupStatus(store.id, 'problem');
                                                        setProblemFormOpen(prev => ({ ...prev, [store.id]: false }));
                                                    }}
                                                    disabled={!reason}
                                                    className={`flex-1 py-3 rounded-xl font-black text-sm ${reason ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-400'}`}
                                                >
                                                    ⚠️ Confirmer le problème
                                                </button>
                                                {state !== 'problem' && (
                                                    <button
                                                        onClick={() => setProblemFormOpen(prev => ({ ...prev, [store.id]: false }))}
                                                        className="px-4 py-3 rounded-xl bg-gray-100 text-gray-600 font-bold text-sm"
                                                    >
                                                        Annuler
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Collected state */}
                                    {state === 'collected' && (
                                        <div className="bg-green-50 border-2 border-green-300 rounded-2xl p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <CheckCircle className="w-8 h-8 text-green-600" />
                                                <div>
                                                    <p className="font-black text-green-800">Colis récupéré ✅</p>
                                                    <p className="text-xs text-green-600">Confirmé par vous</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setPickupStatus(store.id, 'pending')}
                                                className="text-xs text-gray-400 underline"
                                            >
                                                Annuler
                                            </button>
                                        </div>
                                    )}

                                    {/* Problem confirmed state - summary */}
                                    {state === 'problem' && !isProblemOpen && (
                                        <div className="bg-orange-50 border-2 border-orange-300 rounded-2xl p-4 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <AlertTriangle className="w-6 h-6 text-orange-500" />
                                                    <div>
                                                        <p className="font-black text-orange-800 text-sm">Colis non récupéré ⚠️</p>
                                                        {reason && <p className="text-xs text-orange-600">{PROBLEM_LABELS[reason]}</p>}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => setProblemFormOpen(prev => ({ ...prev, [store.id]: true }))}
                                                    className="text-xs text-orange-600 font-bold underline"
                                                >
                                                    Modifier
                                                </button>
                                            </div>
                                            {comment && (
                                                <div className="bg-white rounded-lg p-2.5 border border-orange-200">
                                                    <p className="text-xs text-gray-600 italic">"{comment}"</p>
                                                </div>
                                            )}
                                            <button
                                                onClick={() => { setPickupStatus(store.id, 'pending'); setPickupReason(store.id, ''); setPickupComment(store.id, ''); }}
                                                className="text-xs text-gray-400 underline"
                                            >
                                                Réinitialiser
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* ═══════════════════════════════════════ */}
                {/* POINT DE LIVRAISON                      */}
                {/* ═══════════════════════════════════════ */}
                <div className="bg-white border-2 border-blue-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="bg-blue-600 px-4 py-3 flex items-center gap-3">
                        <div className="bg-white/20 rounded-full w-8 h-8 flex items-center justify-center font-black text-white text-sm">
                            {uniqueStores.length + 1}
                        </div>
                        <div>
                            <p className="text-white font-black text-sm">🏠 Point de livraison</p>
                            <p className="text-blue-100 text-xs">Livrer au client</p>
                        </div>
                    </div>
                    <div className="p-4 space-y-2">
                        <p className="font-black text-gray-900">👤 {delivery.order.shippingName}</p>
                        <a href={`tel:${delivery.order.shippingPhone}`} className="flex items-center gap-2 text-blue-700 font-bold text-sm">
                            📞 {delivery.order.shippingPhone}
                        </a>
                        <p className="text-sm text-gray-600">📍 {delivery.order.shippingAddress}</p>
                        {delivery.order.shippingCity && <p className="text-sm text-gray-600">🏙️ {delivery.order.shippingCity}</p>}
                        <p className="text-sm text-gray-600">🗺️ Wilaya: {delivery.order.shippingWilaya}</p>
                        {delivery.order.deliveryLatitude && delivery.order.deliveryLongitude && (
                            <button
                                onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${delivery.order.deliveryLatitude},${delivery.order.deliveryLongitude}`, '_blank')}
                                className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm mt-2"
                            >
                                <Navigation className="w-4 h-4" />
                                Itinéraire vers le client
                            </button>
                        )}
                    </div>
                </div>

                {/* Payment */}
                {(() => {
                    const breakdown = calculatePaymentBreakdown(delivery.order, uniqueStores);
                    return (
                        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                            <h2 className="font-bold text-base flex items-center gap-2 text-gray-800 mb-4">
                                <DollarSign className="w-5 h-5" />
                                💰 Détail paiement COD
                            </h2>
                            <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3 mb-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-semibold text-gray-700">💵 Total à collecter</span>
                                    <span className="text-2xl font-black text-emerald-700">{delivery.order.total.toLocaleString()} DA</span>
                                </div>
                            </div>
                            <div className="space-y-2 mb-3">
                                {uniqueStores.map((store, idx) => (
                                    <div key={store.id} className="flex justify-between items-center bg-amber-50 border border-amber-200 rounded-xl p-3">
                                        <span className="text-sm font-bold text-gray-800 flex items-center gap-2">
                                            <span className="bg-amber-400 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-black">{idx + 1}</span>
                                            {store.name}
                                        </span>
                                        <span className="font-bold text-amber-700">{breakdown.storeTotals[store.id]?.toLocaleString()} DA</span>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between items-center bg-blue-50 border border-blue-200 rounded-xl p-3">
                                <span className="text-sm font-bold text-blue-800">🚚 Vous gardez</span>
                                <span className="text-lg font-black text-blue-700">{breakdown.totalToAgent.toLocaleString()} DA</span>
                            </div>
                        </div>
                    );
                })()}

                {/* Notes */}
                <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
                    <h2 className="font-bold text-sm text-gray-700 mb-2">📝 Notes générales</h2>
                    <textarea
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        placeholder="Notes générales sur la livraison..."
                        className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none"
                        rows={3}
                    />
                </div>

                {/* Tracking */}
                <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
                    <h2 className="font-bold text-sm text-gray-700 mb-3">📦 Numéro de suivi</h2>
                    <input
                        type="text"
                        value={delivery.trackingNumber || ''}
                        onChange={e => setDelivery({ ...delivery, trackingNumber: e.target.value })}
                        placeholder="Ex: YAL123456"
                        className="input input-bordered w-full text-sm mb-2"
                    />
                    <input
                        type="url"
                        value={delivery.trackingUrl || ''}
                        onChange={e => setDelivery({ ...delivery, trackingUrl: e.target.value })}
                        placeholder="https://yalidine.com/track/..."
                        className="input input-bordered w-full text-sm"
                    />
                </div>
            </div>

            {/* ═══════════════════════════════════════ */}
            {/* FIXED BOTTOM ACTION BAR                 */}
            {/* ═══════════════════════════════════════ */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-2xl px-4 py-3 space-y-2 z-30">
                {delivery.status === 'PENDING' && (
                    <button
                        onClick={async () => { if (confirm('Démarrer la livraison ?')) await updateStatus('IN_TRANSIT'); }}
                        disabled={updating}
                        className="btn btn-block btn-lg font-black text-white text-base"
                        style={{ backgroundColor: '#006233' }}
                    >
                        {updating ? <span className="loading loading-spinner" /> : '🚀'} Démarrer la livraison
                    </button>
                )}

                {delivery.status === 'IN_TRANSIT' && (
                    <>
                        {!allStoresHandled ? (
                            <div className="bg-yellow-50 border border-yellow-300 rounded-xl px-4 py-3 text-center">
                                <p className="text-sm font-bold text-yellow-800">
                                    ⚠️ Confirmez chaque point de collecte avant de livrer
                                </p>
                                <p className="text-xs text-yellow-600 mt-0.5">
                                    {collectedCount + problemCount}/{uniqueStores.length} traité{collectedCount + problemCount > 1 ? 's' : ''}
                                </p>
                            </div>
                        ) : (
                            <button
                                onClick={async () => { if (confirm('Confirmer la livraison au client ?')) await updateStatus('DELIVERED'); }}
                                disabled={updating}
                                className="btn btn-success btn-block btn-lg font-black text-base"
                            >
                                {updating ? <span className="loading loading-spinner" /> : <CheckCircle className="w-5 h-5" />}
                                Marquer comme livrée ✅
                            </button>
                        )}
                        {notes !== delivery.agentNotes && (
                            <button onClick={() => updateStatus(delivery.status)} disabled={updating} className="btn btn-outline btn-sm btn-block">
                                Sauvegarder les notes
                            </button>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
