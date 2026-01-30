"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DeliveryAgentForm from '@/components/admin/DeliveryAgentForm';

export default function DeliveryAgentsPage() {
    const router = useRouter();
    const [agents, setAgents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [credentials, setCredentials] = useState<{ email: string; password: string } | null>(null);
    const [filterWilaya, setFilterWilaya] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        fetchAgents();
    }, [filterWilaya, filterStatus]);

    const fetchAgents = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filterWilaya) params.append('wilaya', filterWilaya);
            if (filterStatus !== 'all') params.append('isAvailable', filterStatus);

            const res = await fetch(`/api/admin/delivery-agents?${params}`);
            const data = await res.json();
            setAgents(data.agents || []);
        } catch (err) {
            console.error('Error fetching agents:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (agentId: string, currentStatus: boolean) => {
        try {
            const res = await fetch(`/api/admin/delivery-agents/${agentId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isAvailable: !currentStatus })
            });

            if (res.ok) {
                fetchAgents();
            }
        } catch (err) {
            console.error('Error toggling status:', err);
        }
    };

    const handleCreateSuccess = (agent: any, creds?: { email: string; password: string }) => {
        setShowForm(false);
        if (creds) {
            setCredentials(creds);
        }
        fetchAgents();
    };

    const globalStats = {
        total: agents.length,
        active: agents.filter(a => a.isAvailable).length,
        inProgress: agents.reduce((sum, a) => sum + a.stats.inProgress, 0),
        totalCOD: agents.reduce((sum, a) => sum + a.stats.totalCOD, 0)
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion des Prestataires</h1>
                    <p className="text-gray-600">Créez et gérez les prestataires de livraison</p>
                </div>

                {/* Global Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-blue-50 rounded-lg">
                                <span className="text-2xl">👥</span>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Prestataires</p>
                                <p className="text-2xl font-bold text-gray-900">{globalStats.total}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-green-50 rounded-lg">
                                <span className="text-2xl">✅</span>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Actifs</p>
                                <p className="text-2xl font-bold text-green-600">{globalStats.active}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-yellow-50 rounded-lg">
                                <span className="text-2xl">🚚</span>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">En cours</p>
                                <p className="text-2xl font-bold text-yellow-600">{globalStats.inProgress}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-purple-50 rounded-lg">
                                <span className="text-2xl">💰</span>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">COD Collecté</p>
                                <p className="text-2xl font-bold text-purple-600">{globalStats.totalCOD.toLocaleString()} DA</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Credentials Display */}
                {credentials && (
                    <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 mb-6">
                        <div className="flex items-start gap-3">
                            <span className="text-3xl">🎉</span>
                            <div className="flex-1">
                                <h3 className="font-bold text-green-900 text-lg mb-2">Prestataire créé avec succès !</h3>
                                <p className="text-green-700 mb-3">Communiquez ces identifiants au prestataire (ils ne seront plus affichés) :</p>
                                <div className="bg-white p-4 rounded-lg border border-green-200">
                                    <p className="font-mono text-sm mb-2"><strong>Email:</strong> {credentials.email}</p>
                                    <p className="font-mono text-sm"><strong>Mot de passe:</strong> {credentials.password}</p>
                                </div>
                                <button
                                    onClick={() => setCredentials(null)}
                                    className="mt-3 text-sm text-green-700 hover:text-green-900 font-medium"
                                >
                                    J'ai noté les identifiants ✓
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Actions & Filters */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                        <div className="flex gap-3">
                            <select
                                value={filterWilaya}
                                onChange={(e) => setFilterWilaya(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Toutes les wilayas</option>
                                <option value="Oran">Oran</option>
                                <option value="Alger">Alger</option>
                                <option value="Constantine">Constantine</option>
                            </select>

                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">Tous les statuts</option>
                                <option value="true">Actifs uniquement</option>
                                <option value="false">Inactifs uniquement</option>
                            </select>
                        </div>

                        <button
                            onClick={() => setShowForm(true)}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
                        >
                            <span>➕</span>
                            Créer un Prestataire
                        </button>
                    </div>
                </div>

                {/* Agents Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prestataire</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Wilaya</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Véhicule</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stats</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                            Chargement...
                                        </td>
                                    </tr>
                                ) : agents.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                            Aucun prestataire trouvé
                                        </td>
                                    </tr>
                                ) : (
                                    agents.map(agent => (
                                        <tr key={agent.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-medium text-gray-900">{agent.name}</p>
                                                    <p className="text-sm text-gray-500">{agent.licenseNumber}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm">
                                                    <p className="text-gray-900">{agent.email}</p>
                                                    <p className="text-gray-500">{agent.phone}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-sm font-medium">
                                                    {agent.wilaya}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-gray-900">
                                                    {agent.vehicleType === 'MOTO' && '🏍️ Moto'}
                                                    {agent.vehicleType === 'VOITURE' && '🚗 Voiture'}
                                                    {agent.vehicleType === 'VELO' && '🚲 Vélo'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm">
                                                    <p className="text-gray-900">{agent.stats.total} total</p>
                                                    <p className="text-green-600">{agent.stats.delivered} livrées ({agent.stats.successRate}%)</p>
                                                    <p className="text-yellow-600">{agent.stats.inProgress} en cours</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-sm font-medium ${agent.isAvailable
                                                        ? 'bg-green-50 text-green-700'
                                                        : 'bg-gray-100 text-gray-600'
                                                    }`}>
                                                    {agent.isAvailable ? '✓ Actif' : '✗ Inactif'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => router.push(`/admin/delivery-agents/${agent.id}`)}
                                                        className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
                                                    >
                                                        Détails
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggleStatus(agent.id, agent.isAvailable)}
                                                        className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded"
                                                    >
                                                        {agent.isAvailable ? 'Désactiver' : 'Activer'}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Create Form Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-900">Créer un Prestataire</h2>
                        </div>
                        <div className="p-6">
                            <DeliveryAgentForm
                                onSuccess={handleCreateSuccess}
                                onCancel={() => setShowForm(false)}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
