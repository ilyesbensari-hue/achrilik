"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { logger } from '@/lib/logger';

interface DeliveryAgent {
    id: string;
    name: string;
    provider: string;
    wilayasCovered: string[];
    isActive: boolean;
}

const ALGERIA_WILAYAS = [
    'Adrar', 'Chlef', 'Laghouat', 'Oum El Bouaghi', 'Batna', 'Béjaïa', 'Biskra', 'Béchar',
    'Blida', 'Bouira', 'Tamanrasset', 'Tébessa', 'Tlemcen', 'Tiaret', 'Tizi Ouzou', 'Alger',
    'Djelfa', 'Jijel', 'Sétif', 'Saïda', 'Skikda', 'Sidi Bel Abbès', 'Annaba', 'Guelma',
    'Constantine', 'Médéa', 'Mostaganem', 'M\'Sila', 'Mascara', 'Ouargla', 'Oran', 'El Bayadh',
    'Illizi', 'Bordj Bou Arréridj', 'Boumerdès', 'El Tarf', 'Tindouf', 'Tissemsilt', 'El Oued',
    'Khenchela', 'Souk Ahras', 'Tipaza', 'Mila', 'Aïn Defla', 'Naâma', 'Aïn Témouchent',
    'Ghardaïa', 'Relizane'
];

export default function DeliveryConfigPage() {
    const [agents, setAgents] = useState<DeliveryAgent[]>([]);
    const [wilayaAgents, setWilayaAgents] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);

            // Fetch delivery agents
            const agentsRes = await fetch('/api/admin/delivery-agents');
            const agentsData = await agentsRes.json();
            if (agentsData.agents) {
                setAgents(agentsData.agents.filter((a: DeliveryAgent) => a.isActive));
            }

            // Fetch current configuration
            const configRes = await fetch('/api/admin/delivery-config');
            const configData = await configRes.json();
            if (configData.wilayaAgents) {
                setWilayaAgents(configData.wilayaAgents);
            }
        } catch (error) {
            logger.error('Error fetching data:', { error });
        } finally {
            setLoading(false);
        }
    };

    const handleAssign = async (wilaya: string, agentId: string | null) => {
        const toastId = toast.loading('Mise à jour...');
        try {
            setSaving(true);
            const res = await fetch('/api/admin/delivery-config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ wilaya, deliveryAgentId: agentId })
            });

            if (res.ok) {
                const data = await res.json();
                toast.success(`✅ ${data.message}`, { id: toastId });
                setTimeout(() => fetchData(), 500);
            } else {
                const data = await res.json();
                toast.error(`❌ ${data.error}`, { id: toastId });
            }
        } catch (error) {
            logger.error('Error assigning agent:', { error });
            toast.error('❌ Erreur technique', { id: toastId });
        } finally {
            setSaving(false);
        }
    };

    const getAgentForWilaya = (wilaya: string) => {
        const agentId = wilayaAgents[wilaya];
        return agents.find(a => a.id === agentId);
    };

    const getAvailableAgentsForWilaya = (wilaya: string) => {
        return agents.filter(a => a.wilayasCovered.includes(wilaya));
    };

    if (loading) {
        return <div className="text-center py-12">Chargement...</div>;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Configuration Livraisons</h1>
                    <p className="text-gray-600 mt-2">
                        Assignez un prestataire par défaut pour chaque wilaya
                    </p>
                </div>
                <Link
                    href="/admin"
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                >
                    ← Retour
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-600">Total Wilayas</h3>
                        <span className="text-2xl">📍</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{ALGERIA_WILAYAS.length}</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-600">Configurées</h3>
                        <span className="text-2xl">✅</span>
                    </div>
                    <p className="text-3xl font-bold text-green-600">
                        {Object.keys(wilayaAgents).length}
                    </p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-600">Prestataires Actifs</h3>
                        <span className="text-2xl">🚚</span>
                    </div>
                    <p className="text-3xl font-bold text-blue-600">{agents.length}</p>
                </div>
            </div>

            {/* Configuration Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Configuration par Wilaya
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Les commandes seront automatiquement assignées au prestataire défini
                    </p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Wilaya
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Prestataire Assigné
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Prestataires Disponibles
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {ALGERIA_WILAYAS.map((wilaya) => {
                                const currentAgent = getAgentForWilaya(wilaya);
                                const availableAgents = getAvailableAgentsForWilaya(wilaya);

                                return (
                                    <tr key={wilaya} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-gray-900">{wilaya}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            {currentAgent ? (
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        {currentAgent.name}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        {currentAgent.provider}
                                                    </p>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 text-sm">
                                                    Non configuré
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-600">
                                                {availableAgents.length} prestataire(s)
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <select
                                                value={wilayaAgents[wilaya] || ''}
                                                onChange={(e) => handleAssign(wilaya, e.target.value || null)}
                                                disabled={saving || availableAgents.length === 0}
                                                className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                            >
                                                <option value="">Aucun</option>
                                                {availableAgents.map((agent) => (
                                                    <option key={agent.id} value={agent.id}>
                                                        {agent.name} ({agent.provider})
                                                    </option>
                                                ))}
                                            </select>
                                            {availableAgents.length === 0 && (
                                                <p className="text-xs text-red-500 mt-1">
                                                    Aucun prestataire disponible
                                                </p>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Help Section */}
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
                <h3 className="font-semibold text-blue-900 mb-2">💡 Comment ça marche ?</h3>
                <ul className="text-sm text-blue-800 space-y-2">
                    <li>• Sélectionnez un prestataire pour chaque wilaya</li>
                    <li>• Toutes les nouvelles commandes de cette wilaya seront automatiquement assignées</li>
                    <li>• Seuls les prestataires qui couvrent la wilaya sont disponibles</li>
                    <li>• Vous pouvez modifier ou supprimer l'assignation à tout moment</li>
                </ul>
            </div>
        </div>
    );
}
