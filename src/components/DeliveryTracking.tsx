'use client';

interface DeliveryTrackingProps {
    order: any;
}

export default function DeliveryTracking({ order }: DeliveryTrackingProps) {
    const statusLabels: { [key: string]: string } = {
        PENDING: 'En attente',
        ACCEPTED: 'Acceptée',
        READY_TO_SHIP: 'Prête à expédier',
        PICKED_UP: 'Récupérée par livreur',
        IN_TRANSIT: 'En transit',
        DELIVERED: 'Livrée',
        FAILED: 'Échec de livraison',
        RETURNED: 'Retournée',
    };

    const statusColors: { [key: string]: string } = {
        PENDING: 'bg-gray-100 text-gray-800',
        ACCEPTED: 'bg-blue-100 text-blue-800',
        READY_TO_SHIP: 'bg-indigo-100 text-indigo-800',
        PICKED_UP: 'bg-purple-100 text-purple-800',
        IN_TRANSIT: 'bg-yellow-100 text-yellow-800',
        DELIVERED: 'bg-green-100 text-green-800',
        FAILED: 'bg-red-100 text-red-800',
        RETURNED: 'bg-orange-100 text-orange-800',
    };

    const statusIcons: { [key: string]: string } = {
        PENDING: '⏳',
        ACCEPTED: '✅',
        READY_TO_SHIP: '📦',
        PICKED_UP: '🚚',
        IN_TRANSIT: '🛣️',
        DELIVERED: '🎉',
        FAILED: '❌',
        RETURNED: '↩️',
    };

    if (!order.deliveryStatus || order.deliveryStatus === 'PENDING') {
        return (
            <div className="bg-gray-50 rounded-lg p-6 text-center">
                <p className="text-gray-600">
                    Le suivi de livraison sera disponible une fois que le vendeur aura accepté votre commande.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">🚚 Suivi de Livraison</h3>

            {/* Statut actuel */}
            <div className="mb-6">
                <p className="text-sm text-gray-600 mb-2">Statut actuel</p>
                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${statusColors[order.deliveryStatus] || 'bg-gray-100 text-gray-800'
                    }`}>
                    <span className="text-lg">{statusIcons[order.deliveryStatus]}</span>
                    {statusLabels[order.deliveryStatus] || order.deliveryStatus}
                </span>
            </div>

            {/* Numéro de suivi */}
            {order.trackingNumber && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm font-medium text-blue-900 mb-1">Numéro de suivi</p>
                    <p className="text-xl font-mono font-bold text-blue-900">
                        {order.trackingNumber}
                    </p>

                    {/* Lien de tracking */}
                    {order.trackingUrl && (
                        <a
                            href={order.trackingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block mt-3 text-sm text-blue-600 hover:text-blue-800 underline"
                        >
                            🔗 Suivre ma livraison en temps réel →
                        </a>
                    )}
                </div>
            )}

            {/* Progression visuelle */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Progression</span>
                    <span className="text-sm font-medium text-[#006233]">
                        {order.deliveryStatus === 'DELIVERED' ? '100%' :
                            order.deliveryStatus === 'IN_TRANSIT' ? '75%' :
                                order.deliveryStatus === 'PICKED_UP' ? '50%' :
                                    order.deliveryStatus === 'READY_TO_SHIP' ? '25%' : '10%'}
                    </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                        className={`h-2 rounded-full transition-all duration-500 ${order.deliveryStatus === 'DELIVERED' ? 'bg-green-600' :
                                order.deliveryStatus === 'FAILED' || order.deliveryStatus === 'RETURNED' ? 'bg-red-600' :
                                    'bg-[#006233]'
                            }`}
                        style={{
                            width: order.deliveryStatus === 'DELIVERED' ? '100%' :
                                order.deliveryStatus === 'IN_TRANSIT' ? '75%' :
                                    order.deliveryStatus === 'PICKED_UP' ? '50%' :
                                        order.deliveryStatus === 'READY_TO_SHIP' ? '25%' : '10%'
                        }}
                    />
                </div>
            </div>

            {/* Timeline des étapes */}
            <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Étapes de livraison</h4>

                <div className="relative pl-8 space-y-6">
                    {/* Ligne verticale */}
                    <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-gray-200" />

                    {/* Étape: Commande acceptée */}
                    <div className="relative">
                        <div className={`absolute left-[-1.75rem] w-4 h-4 rounded-full border-2 ${['ACCEPTED', 'READY_TO_SHIP', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED'].includes(order.deliveryStatus)
                                ? 'bg-[#006233] border-[#006233]'
                                : 'bg-white border-gray-300'
                            }`} />
                        <div>
                            <p className="font-medium text-gray-900">Commande acceptée</p>
                            <p className="text-sm text-gray-500">Le vendeur a accepté votre commande</p>
                        </div>
                    </div>

                    {/* Étape: Prête à expédier */}
                    <div className="relative">
                        <div className={`absolute left-[-1.75rem] w-4 h-4 rounded-full border-2 ${['READY_TO_SHIP', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED'].includes(order.deliveryStatus)
                                ? 'bg-[#006233] border-[#006233]'
                                : 'bg-white border-gray-300'
                            }`} />
                        <div>
                            <p className="font-medium text-gray-900">Prête à expédier</p>
                            <p className="text-sm text-gray-500">Votre colis est prêt</p>
                        </div>
                    </div>

                    {/* Étape: Récupérée par le livreur */}
                    <div className="relative">
                        <div className={`absolute left-[-1.75rem] w-4 h-4 rounded-full border-2 ${['PICKED_UP', 'IN_TRANSIT', 'DELIVERED'].includes(order.deliveryStatus)
                                ? 'bg-[#006233] border-[#006233]'
                                : 'bg-white border-gray-300'
                            }`} />
                        <div>
                            <p className="font-medium text-gray-900">Récupérée par le livreur</p>
                            <p className="text-sm text-gray-500">Le colis a été pris en charge</p>
                        </div>
                    </div>

                    {/* Étape: En transit */}
                    <div className="relative">
                        <div className={`absolute left-[-1.75rem] w-4 h-4 rounded-full border-2 ${['IN_TRANSIT', 'DELIVERED'].includes(order.deliveryStatus)
                                ? 'bg-[#006233] border-[#006233]'
                                : 'bg-white border-gray-300'
                            }`} />
                        <div>
                            <p className="font-medium text-gray-900">En transit</p>
                            <p className="text-sm text-gray-500">Votre colis est en route</p>
                        </div>
                    </div>

                    {/* Étape: Livré */}
                    <div className="relative">
                        <div className={`absolute left-[-1.75rem] w-4 h-4 rounded-full border-2 ${order.deliveryStatus === 'DELIVERED'
                                ? 'bg-green-600 border-green-600'
                                : 'bg-white border-gray-300'
                            }`} />
                        <div>
                            <p className="font-medium text-gray-900">Livré</p>
                            <p className="text-sm text-gray-500">Votre colis a été livré</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Message de livraison réussie */}
            {order.deliveryStatus === 'DELIVERED' && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-900 font-medium">
                        🎉 Votre commande a été livrée avec succès !
                    </p>
                    <p className="text-sm text-green-700 mt-1">
                        Nous espérons que vous êtes satisfait de votre achat.
                    </p>
                </div>
            )}

            {/* Message d'échec */}
            {(order.deliveryStatus === 'FAILED' || order.deliveryStatus === 'RETURNED') && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-900 font-medium">
                        ❌ Problème de livraison
                    </p>
                    <p className="text-sm text-red-700 mt-1">
                        Veuillez contacter le vendeur pour plus d'informations.
                    </p>
                </div>
            )}

            {/* Dernière mise à jour */}
            {order.lastUpdatedAt && (
                <div className="mt-6 pt-4 border-t">
                    <p className="text-xs text-gray-500">
                        Dernière mise à jour: {new Date(order.lastUpdatedAt).toLocaleString('fr-FR')}
                    </p>
                </div>
            )}
        </div>
    );
}
