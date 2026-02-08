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
                    agentNotes: notes
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
                    <p className="text-sm opacity-90">#{delivery.orderId.slice(0, 8)}</p>
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

                {/* Customer Info */}
                <div className="bg-white rounded-lg p-4 shadow space-y-3">
                    <h2 className="font-bold text-lg flex items-center gap-2">
                        <MapPin className="w-5 h-5" />
                        Informations Client
                    </h2>
                    <div className="space-y-2">
                        <p><strong>Nom:</strong> {delivery.order.shippingName}</p>
                        <p><strong>Téléphone:</strong> <a href={`tel:${delivery.order.shippingPhone}`} className="link link-primary">{delivery.order.shippingPhone}</a></p>
                        <p><strong>Adresse:</strong> {delivery.order.shippingAddress}</p>
                        <p><strong>Wilaya:</strong> {delivery.order.shippingWilaya}</p>
                    </div>
                </div>

                {/* Google Maps */}
                {delivery.order.deliveryLatitude && delivery.order.deliveryLongitude && (
                    <div className="bg-white rounded-lg p-4 shadow">
                        <h2 className="font-bold text-lg mb-3 flex items-center gap-2">
                            <Navigation className="w-5 h-5" />
                            Carte
                        </h2>
                        <div className="aspect-video w-full bg-gray-100 rounded-lg overflow-hidden mb-3">
                            <iframe
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                loading="lazy"
                                src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}&q=${delivery.order.deliveryLatitude},${delivery.order.deliveryLongitude}&zoom=15`}
                            ></iframe>
                        </div>
                        <button
                            onClick={openInGoogleMaps}
                            className="btn btn-primary btn-block"
                        >
                            <Navigation className="w-5 h-5" />
                            Ouvrir dans Google Maps
                        </button>
                    </div>
                )}

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
                                    {item.product.images?.[0] && (
                                        <img
                                            src={item.product.images[0]}
                                            alt={item.product.name}
                                            className="w-16 h-16 object-cover rounded"
                                        />
                                    )}
                                    <div className="flex-1">
                                        <p className="font-medium text-sm">{item.product.name}</p>
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
