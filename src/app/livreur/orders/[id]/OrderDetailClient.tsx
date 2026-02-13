'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin, Phone, Package, DollarSign, Clock, CheckCircle, AlertCircle, Navigation } from 'lucide-react';

interface OrderDetailClientProps {
    deliveryId: string;
    initialUser: any;
}

export default function OrderDetailClient({ deliveryId, initialUser }: OrderDetailClientProps) {
    const router = useRouter();
    const [delivery, setDelivery] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [notes, setNotes] = useState('');

    useEffect(() => {
        fetchDeliveryDetails();
    }, [deliveryId]);

    const fetchDeliveryDetails = async () => {
        try {
            const res = await fetch(`/api/deliveries/${deliveryId}`);
            const data = await res.json();
            setDelivery(data);
            setNotes(data.agentNotes || '');
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
                            📦 Commande #{delivery.orderId.slice(0, 8).toUpperCase()}
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

                {/* Point A - PICKUP at Store */}
                {delivery.order.Store && (
                    <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 shadow space-y-3">
                        <h2 className="font-bold text-lg flex items-center gap-2 text-green-800">
                            <Package className="w-5 h-5" />
                            📦 Point A - RÉCUPÉRATION (Magasin)
                        </h2>
                        <div className="space-y-2">
                            <p><strong>Magasin:</strong> {delivery.order.Store.name}</p>
                            <p><strong>Adresse:</strong> {delivery.order.Store.address || 'Non renseignée'}</p>
                            <p><strong>Ville:</strong> {delivery.order.Store.city || delivery.order.Store.storageCity || 'Non renseignée'}</p>
                            {delivery.order.Store.phone && (
                                <p><strong>Téléphone:</strong> <a href={`tel:${delivery.order.Store.phone}`} className="link link-primary">{delivery.order.Store.phone}</a></p>
                            )}
                            {delivery.order.Store.User?.name && (
                                <p><strong>Contact:</strong> {delivery.order.Store.User.name}</p>
                            )}
                            {delivery.order.Store.latitude && delivery.order.Store.longitude && (
                                <button
                                    onClick={() => {
                                        const url = `https://www.google.com/maps/dir/?api=1&destination=${delivery.order.Store.latitude},${delivery.order.Store.longitude}`;
                                        window.open(url, '_blank');
                                    }}
                                    className="btn btn-sm btn-success gap-2 mt-2"
                                >
                                    <Navigation className="w-4 h-4" />
                                    🗺️ Itinéraire vers le magasin
                                </button>
                            )}
                        </div>
                    </div>
                )}

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

                {/* Order Items */}
                {delivery.order.OrderItem && delivery.order.OrderItem.length > 0 && (
                    <div className="bg-white rounded-lg p-4 shadow">
                        <h2 className="font-bold text-lg mb-3 flex items-center gap-2">
                            <Package className="w-5 h-5" />
                            Articles ({delivery.order.OrderItem.length})
                        </h2>
                        <div className="space-y-2">
                            {delivery.order.OrderItem.map((item: any, idx: number) => (
                                <div key={idx} className="flex gap-3 p-2 bg-base-100 rounded">
                                    {item.Variant?.Product?.images?.[0] && (
                                        <img
                                            src={item.Variant.Product.images[0]}
                                            alt={item.Variant.Product.title}
                                            className="w-16 h-16 object-cover rounded"
                                        />
                                    )}
                                    <div className="flex-1">
                                        <p className="font-medium text-sm">{item.Variant?.Product?.title}</p>
                                        <p className="text-xs text-gray-600">Quantité: {item.quantity}</p>
                                        <p className="text-xs text-gray-600">{item.price} DA × {item.quantity}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

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
