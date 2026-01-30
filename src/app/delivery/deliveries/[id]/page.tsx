"use client";

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Delivery {
    id: string;
    orderId: string;
    status: string;
    trackingNumber: string | null;
    trackingUrl: string | null;
    codAmount: number | null;
    codCollected: boolean;
    codCollectedAt: string | null;
    agentNotes: string | null;
    assignedAt: string | null;
    order: {
        id: string;
        shippingName: string | null;
        shippingPhone: string | null;
        shippingAddress: string | null;
        shippingWilaya: string | null;
        total: number;
        createdAt: string;
    };
}

export default function DeliveryDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const router = useRouter();
    const [delivery, setDelivery] = useState<Delivery | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [notes, setNotes] = useState('');

    useEffect(() => {
        fetchDelivery();
    }, [resolvedParams.id]);

    const fetchDelivery = async () => {
        try {
            const res = await fetch(`/api/deliveries/${resolvedParams.id}`);
            if (res.ok) {
                const data = await res.json();
                setDelivery(data);
                setNotes(data.agentNotes || '');
            }
        } catch (error) {
            console.error('Error fetching delivery:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (newStatus: string) => {
        if (!delivery) return;

        setUpdating(true);
        try {
            const res = await fetch('/api/deliveries', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    deliveryId: delivery.id,
                    status: newStatus
                })
            });

            if (res.ok) {
                fetchDelivery();
            }
        } catch (error) {
            console.error('Error updating status:', error);
        } finally {
            setUpdating(false);
        }
    };

    const confirmCOD = async () => {
        if (!delivery) return;

        setUpdating(true);
        try {
            const res = await fetch('/api/deliveries', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    deliveryId: delivery.id,
                    codCollected: true
                })
            });

            if (res.ok) {
                fetchDelivery();
            }
        } catch (error) {
            console.error('Error confirming COD:', error);
        } finally {
            setUpdating(false);
        }
    };

    const saveNotes = async () => {
        if (!delivery) return;

        setUpdating(true);
        try {
            const res = await fetch('/api/deliveries', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    deliveryId: delivery.id,
                    agentNotes: notes
                })
            });

            if (res.ok) {
                alert('Notes enregistrées');
            }
        } catch (error) {
            console.error('Error saving notes:', error);
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#006233] mx-auto"></div>
                    <p className="mt-4 text-gray-600">Chargement...</p>
                </div>
            </div>
        );
    }

    if (!delivery) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900">Livraison non trouvée</h2>
                    <Link href="/delivery/dashboard" className="mt-4 inline-block text-[#006233] hover:underline">
                        ← Retour au dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <Link href="/delivery/dashboard" className="text-sm text-gray-500 hover:text-gray-700 mb-2 inline-block">
                        ← Retour au dashboard
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">Détails de la Livraison</h1>
                    {delivery.trackingNumber && (
                        <p className="mt-1 text-sm text-gray-500">Tracking: #{delivery.trackingNumber}</p>
                    )}
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Customer Info */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">📍 Informations Client</h2>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm text-gray-500">Nom</p>
                                    <p className="text-base font-medium text-gray-900">{delivery.order.shippingName || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Téléphone</p>
                                    <p className="text-base font-medium text-gray-900">
                                        <a href={`tel:${delivery.order.shippingPhone}`} className="text-[#006233] hover:underline">
                                            {delivery.order.shippingPhone || 'N/A'}
                                        </a>
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Adresse</p>
                                    <p className="text-base font-medium text-gray-900">{delivery.order.shippingAddress || 'N/A'}</p>
                                    <p className="text-sm text-gray-600">{delivery.order.shippingWilaya || 'N/A'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Status Actions */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">🚚 Statut de Livraison</h2>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => updateStatus('PICKED_UP')}
                                    disabled={updating || delivery.status === 'PICKED_UP'}
                                    className="btn bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50"
                                >
                                    📦 Colis récupéré
                                </button>
                                <button
                                    onClick={() => updateStatus('IN_TRANSIT')}
                                    disabled={updating || delivery.status === 'IN_TRANSIT'}
                                    className="btn bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    🚗 En transit
                                </button>
                                <button
                                    onClick={() => updateStatus('DELIVERED')}
                                    disabled={updating || delivery.status === 'DELIVERED'}
                                    className="btn bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                                >
                                    ✅ Livré
                                </button>
                                <button
                                    onClick={() => updateStatus('FAILED')}
                                    disabled={updating || delivery.status === 'FAILED'}
                                    className="btn bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                                >
                                    ❌ Échec
                                </button>
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">📝 Notes</h2>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Ajoutez des notes sur cette livraison..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006233] focus:border-transparent"
                                rows={4}
                            />
                            <button
                                onClick={saveNotes}
                                disabled={updating}
                                className="mt-3 btn bg-[#006233] text-white hover:bg-[#005028] disabled:opacity-50"
                            >
                                Enregistrer les notes
                            </button>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* COD Info */}
                        {delivery.codAmount && (
                            <div className="bg-white rounded-lg shadow p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">💰 COD</h2>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-sm text-gray-500">Montant</p>
                                        <p className="text-2xl font-bold text-gray-900">{delivery.codAmount.toLocaleString()} DA</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Statut</p>
                                        {delivery.codCollected ? (
                                            <p className="text-sm font-medium text-green-600">✅ Collecté</p>
                                        ) : (
                                            <p className="text-sm font-medium text-yellow-600">⏳ À collecter</p>
                                        )}
                                    </div>
                                    {!delivery.codCollected && (
                                        <button
                                            onClick={confirmCOD}
                                            disabled={updating}
                                            className="w-full btn bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                                        >
                                            Confirmer collecte COD
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Order Info */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">📦 Commande</h2>
                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm text-gray-500">ID Commande</p>
                                    <p className="text-sm font-mono text-gray-900">{delivery.orderId.slice(0, 8)}...</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Total</p>
                                    <p className="text-base font-medium text-gray-900">{delivery.order.total.toLocaleString()} DA</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Assignée le</p>
                                    <p className="text-sm text-gray-900">
                                        {delivery.assignedAt ? new Date(delivery.assignedAt).toLocaleDateString('fr-FR') : 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
