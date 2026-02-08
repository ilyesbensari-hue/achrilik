"use client";

import { useState } from 'react';
import { Search, User, Package, Truck, Phone, Mail, MapPin, Calendar } from 'lucide-react';

export default function SupportCRM() {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const handleSearch = async () => {
        if (searchQuery.length < 3) {
            alert('Entrez au moins 3 caractères');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`/api/support/customers?q=${encodeURIComponent(searchQuery)}`);
            const data = await res.json();

            if (res.ok) {
                setSearchResults(data.customers);
            } else {
                alert(data.error || 'Erreur lors de la recherche');
            }
        } catch (error) {
            console.error('Search error:', error);
            alert('Erreur réseau');
        } finally {
            setLoading(false);
        }
    };

    const loadCustomerDetails = async (customerId: string) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/support/customers/${customerId}`);
            const data = await res.json();

            if (res.ok) {
                setSelectedCustomer(data.customer);
                setOrders(data.orders);
                setSearchResults([]); // Clear search results
            } else {
                alert(data.error || 'Erreur lors du chargement');
            }
        } catch (error) {
            console.error('Load error:', error);
            alert('Erreur réseau');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">🎧 Support Client CRM</h1>
                <p className="text-gray-600">Recherchez un client pour voir ses commandes et livraisons</p>
            </div>

            {/* Search Bar */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                <div className="flex gap-3">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            placeholder="Email, nom, ou téléphone du client..."
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                        />
                    </div>
                    <button
                        onClick={handleSearch}
                        disabled={loading}
                        className="btn btn-primary px-6"
                    >
                        {loading ? 'Recherche...' : 'Rechercher'}
                    </button>
                    {selectedCustomer && (
                        <button
                            onClick={() => {
                                setSelectedCustomer(null);
                                setOrders([]);
                                setSearchQuery('');
                            }}
                            className="btn btn-outline"
                        >
                            Nouvelle recherche
                        </button>
                    )}
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                    <div className="mt-4 space-y-2">
                        <p className="text-sm text-gray-600 mb-3">{searchResults.length} résultat(s) trouvé(s)</p>
                        {searchResults.map((customer) => (
                            <button
                                key={customer.id}
                                onClick={() => loadCustomerDetails(customer.id)}
                                className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="font-semibold text-gray-900">{customer.name || 'Sans nom'}</p>
                                        <p className="text-sm text-gray-600">{customer.email}</p>
                                        {customer.phone && (
                                            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                                <Phone className="w-3 h-3" />
                                                {customer.phone}
                                            </p>
                                        )}
                                    </div>
                                    <span className="text-xs text-gray-400">
                                        Inscrit: {new Date(customer.createdAt).toLocaleDateString('fr-FR')}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Customer Details */}
            {selectedCustomer && (
                <>
                    <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-6 mb-6 border border-primary/20">
                        <div className="flex items-start gap-4">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm border-2 border-primary/30">
                                <User className="w-8 h-8 text-primary" />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedCustomer.name || 'Client sans nom'}</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <Mail className="w-4 h-4 text-gray-400" />
                                        <span>{selectedCustomer.email}</span>
                                    </div>
                                    {selectedCustomer.phone && (
                                        <div className="flex items-center gap-2 text-gray-700">
                                            <Phone className="w-4 h-4 text-gray-400" />
                                            <span>{selectedCustomer.phone}</span>
                                        </div>
                                    )}
                                    {selectedCustomer.address && (
                                        <div className="flex items-center gap-2 text-gray-700">
                                            <MapPin className="w-4 h-4 text-gray-400" />
                                            <span>{selectedCustomer.address}, {selectedCustomer.city}, {selectedCustomer.wilaya}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        <span>Client depuis: {new Date(selectedCustomer.createdAt).toLocaleDateString('fr-FR')}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Orders */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Package className="w-6 h-6" />
                            Historique des commandes ({orders.length})
                        </h3>

                        {orders.length === 0 ? (
                            <div className="text-center py-12 text-gray-400">
                                <Package className="w-16 h-16 mx-auto mb-3 opacity-50" />
                                <p>Aucune commande pour ce client</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {orders.map((order) => (
                                    <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <p className="font-semibold text-gray-900">Commande #{order.id.slice(0, 8)}</p>
                                                <p className="text-sm text-gray-600">
                                                    {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                                                        day: 'numeric',
                                                        month: 'long',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                                                    order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                                                        'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                    {order.status}
                                                </span>
                                                <span className="text-lg font-bold text-primary">
                                                    {order.total.toLocaleString()} DA
                                                </span>
                                            </div>
                                        </div>

                                        {/* Order Items */}
                                        <div className="space-y-2 mb-3 bg-gray-50 rounded-lg p-3">
                                            {order.OrderItem.map((item: any, idx: number) => (
                                                <div key={idx} className="flex items-center gap-3 text-sm">
                                                    {item.Variant?.Product?.images?.[0] && (
                                                        <img
                                                            src={JSON.parse(item.Variant.Product.images)[0]}
                                                            alt=""
                                                            className="w-10 h-10 object-cover rounded"
                                                        />
                                                    )}
                                                    <div className="flex-1">
                                                        <p className="font-medium">{item.Variant?.Product?.title}</p>
                                                        <p className="text-xs text-gray-600">Qté: {item.quantity} × {item.price} DA</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Delivery Info */}
                                        {order.delivery && (
                                            <div className="border-t border-gray-200 pt-3 mt-3">
                                                <div className="flex items-start gap-3">
                                                    <Truck className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                                                    <div className="flex-1">
                                                        <p className="font-semibold text-gray-900 mb-1">Livraison</p>
                                                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                                                            <div>
                                                                <span className="text-gray-500">Statut:</span>{' '}
                                                                <span className="font-semibold">{order.delivery.status}</span>
                                                            </div>
                                                            {order.delivery.trackingNumber && (
                                                                <div>
                                                                    <span className="text-gray-500">N° suivi:</span>{' '}
                                                                    <span className="font-semibold">{order.delivery.trackingNumber}</span>
                                                                </div>
                                                            )}
                                                            {order.delivery.trackingUrl && (
                                                                <div className="col-span-2">
                                                                    <a
                                                                        href={order.delivery.trackingUrl}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="text-primary hover:underline text-xs"
                                                                    >
                                                                        🔗 Lien de suivi
                                                                    </a>
                                                                </div>
                                                            )}
                                                            {order.delivery.agent && (
                                                                <div className="col-span-2">
                                                                    <span className="text-gray-500">Livreur:</span>{' '}
                                                                    <span className="font-semibold">
                                                                        {order.delivery.agent.user.name} ({order.delivery.agent.user.phone})
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
