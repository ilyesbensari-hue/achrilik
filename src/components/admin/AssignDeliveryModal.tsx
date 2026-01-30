"use client";

import { useState, useEffect } from 'react';

interface AssignDeliveryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function AssignDeliveryModal({ isOpen, onClose, onSuccess }: AssignDeliveryModalProps) {
    const [orders, setOrders] = useState<any[]>([]);
    const [agents, setAgents] = useState<any[]>([]);
    const [selectedOrder, setSelectedOrder] = useState('');
    const [selectedAgent, setSelectedAgent] = useState('');
    const [pickupAddress, setPickupAddress] = useState('');
    const [deliveryAddress, setDeliveryAddress] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchOrders();
            fetchAgents();
        }
    }, [isOpen]);

    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/orders?status=CONFIRMED,SHIPPED');
            const data = await res.json();
            setOrders(data.orders || []);
        } catch (err) {
            console.error('Error fetching orders:', err);
        }
    };

    const fetchAgents = async () => {
        try {
            const res = await fetch('/api/admin/delivery-agents?isAvailable=true');
            const data = await res.json();
            setAgents(data.agents || []);
        } catch (err) {
            console.error('Error fetching agents:', err);
        }
    };

    const handleOrderSelect = (orderId: string) => {
        setSelectedOrder(orderId);
        const order = orders.find(o => o.id === orderId);
        if (order) {
            setDeliveryAddress(order.shippingAddress || '');
            // Filter agents by order wilaya
            const orderWilaya = order.wilaya || 'Oran';
            const filteredAgents = agents.filter(a => a.wilaya === orderWilaya);
            if (filteredAgents.length > 0) {
                setSelectedAgent(filteredAgents[0].id);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!selectedOrder || !pickupAddress || !deliveryAddress) {
            setError('Tous les champs sont requis');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/admin/deliveries/assign', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId: selectedOrder,
                    agentId: selectedAgent || undefined,
                    pickupAddress,
                    deliveryAddress
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Erreur lors de l\'assignation');
            }

            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900">Assigner une Livraison</h2>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Commande *
                        </label>
                        <select
                            value={selectedOrder}
                            onChange={(e) => handleOrderSelect(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            required
                        >
                            <option value="">Sélectionner une commande</option>
                            {orders.map(order => (
                                <option key={order.id} value={order.id}>
                                    #{order.id.slice(0, 8)} - {order.buyerName} - {order.total} DA
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Prestataire
                        </label>
                        <select
                            value={selectedAgent}
                            onChange={(e) => setSelectedAgent(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Auto (meilleur disponible)</option>
                            {agents.map(agent => (
                                <option key={agent.id} value={agent.id}>
                                    {agent.name} - {agent.wilaya} ({agent.stats.inProgress} en cours)
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Adresse de collecte *
                        </label>
                        <input
                            type="text"
                            value={pickupAddress}
                            onChange={(e) => setPickupAddress(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Adresse du vendeur"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Adresse de livraison *
                        </label>
                        <textarea
                            value={deliveryAddress}
                            onChange={(e) => setDeliveryAddress(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            rows={3}
                            placeholder="Adresse du client"
                            required
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            disabled={loading}
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? 'Assignation...' : 'Assigner'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
