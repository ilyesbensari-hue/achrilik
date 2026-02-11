"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { logger } from '@/lib/logger';

interface Vendor {
    id: string;
    name: string;
    description: string | null;
    verified: boolean;
    verifiedAt: Date | null;
    createdAt: Date;
    address: string | null;
    city: string | null;
    phone: string | null;
    clickCollect: boolean;
    owner: {
        id: string;
        email: string;
        name: string | null;
        createdAt: Date;
    };
    productCount: number;
    orderCount: number;
    defaultDeliveryAgent?: {
        id: string;
        name: string;
        provider: string;
    } | null;
}

interface DeliveryAgent {
    id: string;
    name: string;
    provider: string;
    wilayasCovered: string[];
    isActive: boolean;
}

export default function VendorsPage() {
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [deliveryAgents, setDeliveryAgents] = useState<DeliveryAgent[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'verified'>('all');
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchVendors();
        fetchDeliveryAgents();
    }, [filter]);

    const fetchVendors = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/admin/vendors?status=${filter}`);
            const data = await res.json();
            setVendors(data.vendors);
        } catch (error) {
            logger.error('Error fetching vendors', { error });
        } finally {
            setLoading(false);
        }
    };

    const fetchDeliveryAgents = async () => {
        try {
            const res = await fetch('/api/admin/delivery-agents');
            const data = await res.json();
            if (data.agents) {
                setDeliveryAgents(data.agents.filter((a: DeliveryAgent) => a.isActive));
            }
        } catch (error) {
            logger.error('Error fetching delivery agents', { error });
        }
    };

    const handleAssignDefaultAgent = async (storeId: string, agentId: string | null) => {
        try {
            const res = await fetch(`/api/admin/stores/${storeId}/default-agent`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ deliveryAgentId: agentId })
            });

            if (res.ok) {
                alert('✅ Prestataire par défaut mis à jour');
                fetchVendors();
            } else {
                const data = await res.json();
                alert(`Erreur: ${data.error}`);
            }
        } catch (error) {
            logger.error('Error assigning default agent', { error, storeId, agentId });
            alert('Erreur technique');
        }
    };

    const handleVerify = async (storeId: string, currentStatus: boolean) => {
        logger.debug('VENDOR CERTIFICATION: handleVerify called', { storeId, currentStatus });

        const action = currentStatus ? 'retirer la certification' : 'certifier';

        logger.debug('VENDOR CERTIFICATION: About to show confirm dialog', { action });
        if (!confirm(`Voulez-vous ${action} ce vendeur ?`)) {
            logger.debug('VENDOR CERTIFICATION: User cancelled certification');
            return;
        }

        logger.info('VENDOR CERTIFICATION: User confirmed, sending API request', { endpoint: `/api/admin/stores/${storeId}/verify` });
        try {
            const res = await fetch(`/api/admin/stores/${storeId}/verify`, {
                method: 'POST'
            });

            logger.info('VENDOR CERTIFICATION: API response received', { ok: res.ok, status: res.status });

            if (res.ok) {
                const data = await res.json();
                logger.info('VENDOR CERTIFICATION: Response data', { data });
                alert(data.verified ? '✅ Vendeur certifié ! Email envoyé.' : 'Certification retirée');
                fetchVendors();
            } else {
                const errorText = await res.text();
                logger.error('VENDOR CERTIFICATION: API error response', { errorText });
                alert('Erreur lors de la certification');
            }
        } catch (error) {
            logger.error('VENDOR CERTIFICATION: Exception caught', { error });
            alert('Erreur technique');
        }
    };

    const filteredVendors = vendors.filter(vendor => {
        if (!search) return true;
        const searchLower = search.toLowerCase();
        return (
            vendor.name.toLowerCase().includes(searchLower) ||
            vendor.owner.email.toLowerCase().includes(searchLower) ||
            vendor.owner.name?.toLowerCase().includes(searchLower) ||
            vendor.city?.toLowerCase().includes(searchLower)
        );
    });

    const pendingCount = vendors.filter(v => !v.verified).length;
    const verifiedCount = vendors.filter(v => v.verified).length;

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Gestion des Vendeurs</h1>
                    <p className="text-gray-600 mt-2">
                        Total: {vendors.length} vendeurs ({pendingCount} en attente, {verifiedCount} certifiés)
                    </p>
                </div>
                <Link
                    href="/admin"
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                >
                    ← Retour
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    <input
                        type="text"
                        placeholder="Rechercher par nom, email, ville..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />

                    <div className="flex gap-2">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${filter === 'all'
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Tous ({vendors.length})
                        </button>
                        <button
                            onClick={() => setFilter('pending')}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${filter === 'pending'
                                ? 'bg-yellow-600 text-white shadow-md'
                                : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                                }`}
                        >
                            En attente ({pendingCount})
                        </button>
                        <button
                            onClick={() => setFilter('verified')}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${filter === 'verified'
                                ? 'bg-green-600 text-white shadow-md'
                                : 'bg-green-50 text-green-700 hover:bg-green-100'
                                }`}
                        >
                            Certifiés ({verifiedCount})
                        </button>
                    </div>
                </div>
            </div>

            {/* Vendors List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="text-center py-12 text-gray-500">Chargement...</div>
                ) : filteredVendors.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        Aucun vendeur trouvé
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Boutique</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Propriétaire</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Localisation</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Activité</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prestataire</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredVendors.map((vendor) => (
                                    <tr key={vendor.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-bold text-gray-900">{vendor.name}</p>
                                                    {vendor.verified && (
                                                        <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-500 text-white rounded-full text-xs" title="Vendeur Certifié">
                                                            ✓
                                                        </span>
                                                    )}
                                                </div>
                                                {vendor.description && (
                                                    <p className="text-sm text-gray-500 mt-1 line-clamp-1">{vendor.description}</p>
                                                )}
                                                <p className="text-xs text-gray-400 mt-1">
                                                    Créé: {new Date(vendor.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-gray-900">{vendor.owner.name || 'Sans nom'}</p>
                                            <p className="text-sm text-gray-500">{vendor.owner.email}</p>
                                            {vendor.phone && (
                                                <p className="text-xs text-gray-400 mt-1">📞 {vendor.phone}</p>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {vendor.city ? (
                                                <div className="text-sm">
                                                    <p className="font-medium text-gray-900">{vendor.city}</p>
                                                    {vendor.address && (
                                                        <p className="text-gray-500 text-xs mt-1 line-clamp-2">{vendor.address}</p>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 text-sm">Non renseigné</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-gray-600">📦</span>
                                                    <span className="font-medium text-gray-900">{vendor.productCount}</span>
                                                    <span className="text-gray-500 text-xs">produits</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-gray-600">🛒</span>
                                                    <span className="font-medium text-gray-900">{vendor.orderCount}</span>
                                                    <span className="text-gray-500 text-xs">commandes</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-gray-600">🏪</span>
                                                    <span className={`text-xs font-medium ${vendor.clickCollect ? 'text-green-600' : 'text-gray-400'}`}>
                                                        {vendor.clickCollect ? 'Click & Collect' : 'Livraison uniquement'}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {vendor.verified ? (
                                                <div>
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        ✓ Certifié
                                                    </span>
                                                    {vendor.verifiedAt && (
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {new Date(vendor.verifiedAt).toLocaleDateString()}
                                                        </p>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                    ⏳ En attente
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => {
                                                    console.log('[VENDOR CERTIFICATION] Button clicked for vendor:', vendor.id, 'verified:', vendor.verified);
                                                    handleVerify(vendor.id, vendor.verified);
                                                }}
                                                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${vendor.verified
                                                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
                                                    }`}
                                            >
                                                {vendor.verified ? '✓ Retirer' : '✓ Certifier'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
