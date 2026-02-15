"use client";

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface AgentData {
    agentId: string;
    agentName: string;
    deliveryCount: number;
    codCollected: number;
    codTransferred: number;
    deliveryFeesDue: number;
    deliveryFeesPaid: number;
    pendingCOD: number;
    pendingFees: number;
}

interface GlobalStats {
    totalCODCollected: number;
    totalCODTransferred: number;
    totalAgentFeesDue: number;
    totalAgentFeesPaid: number;
    deliveryCount: number;
}

export default function DeliveryPaymentsPage() {
    const [loading, setLoading] = useState(true);
    const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);
    const [agents, setAgents] = useState<AgentData[]>([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/delivery-payments/summary');
            const data = await res.json();

            if (data.success) {
                setGlobalStats(data.globalStats);
                setAgents(data.byAgent);
            }
        } catch (error) {
            console.error('Error fetchung payment data:', error);
            toast.error('❌ Erreur de chargement');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmCODTransfer = async (agentId: string, agentName: string, amount: number) => {
        if (amount === 0) {
            toast.error('Aucun COD en attente de transfert');
            return;
        }

        if (!confirm(`Confirmer le transfert de ${amount.toLocaleString()} DA de ${agentName} ?`)) {
            return;
        }

        const note = prompt('Note (optionnelle):');

        const toastId = toast.loading('Traitement...');
        try {
            const res = await fetch('/api/admin/delivery-payments/mark-cod-transferred', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ agentId, note })
            });

            const data = await res.json();

            if (data.success) {
                toast.success(`✅ ${data.updatedCount} transfert(s) confirmé(s)`, { id: toastId });
                setTimeout(fetchData, 500);
            } else {
                toast.error(`❌ ${data.error}`, { id: toastId });
            }
        } catch (error) {
            console.error('Error confirming COD transfer:', error);
            toast.error('❌ Erreur technique', { id: toastId });
        }
    };

    const handlePayAgent = async (agentId: string, agentName: string, amount: number) => {
        if (amount === 0) {
            toast.error('Aucun frais en attente de paiement');
            return;
        }

        if (!confirm(`Payer ${amount.toLocaleString()} DA à ${agentName} ?`)) {
            return;
        }

        const note = prompt('Mode de paiement (ex: Espèces, Virement):');

        const toastId = toast.loading('Traitement...');
        try {
            const res = await fetch('/api/admin/delivery-payments/mark-agent-paid', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ agentId, note })
            });

            const data = await res.json();

            if (data.success) {
                toast.success(`✅ ${data.updatedCount} paiement(s) enregistré(s)`, { id: toastId });
                setTimeout(fetchData, 500);
            } else {
                toast.error(`❌ ${data.error}`, { id: toastId });
            }
        } catch (error) {
            console.error('Error paying agent:', error);
            toast.error('❌ Erreur technique', { id: toastId });
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-white rounded-xl p-8 text-center">
                    <p>Chargement...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">💰 Gestion Paiements Livreurs</h1>
                <p className="text-gray-600">Suivez les COD collectés et les frais à payer aux livreurs</p>
            </div>

            {/* Global Stats */}
            {globalStats && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                    <div className="bg-white p-6 rounded-xl border-2 border-blue-200 shadow-sm">
                        <p className="text-sm font-semibold text-gray-600 mb-1">Livraisons Totales</p>
                        <p className="text-3xl font-bold text-blue-600">{globalStats.deliveryCount}</p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border-2 border-purple-200">
                        <p className="text-sm font-semibold text-gray-600 mb-1">COD Collecté</p>
                        <p className="text-2xl font-bold text-purple-600">
                            {globalStats.totalCODCollected.toLocaleString()} DA
                        </p>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border-2 border-green-200">
                        <p className="text-sm font-semibold text-gray-600 mb-1">COD Transféré</p>
                        <p className="text-2xl font-bold text-green-600">
                            {globalStats.totalCODTransferred.toLocaleString()} DA
                        </p>
                    </div>

                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border-2 border-orange-200">
                        <p className="text-sm font-semibold text-gray-600 mb-1">Frais Dus Livreurs</p>
                        <p className="text-2xl font-bold text-orange-600">
                            {globalStats.totalAgentFeesDue.toLocaleString()} DA
                        </p>
                    </div>

                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-xl border-2 border-emerald-200">
                        <p className="text-sm font-semibold text-gray-600 mb-1">Frais Payés</p>
                        <p className="text-2xl font-bold text-emerald-600">
                            {globalStats.totalAgentFeesPaid.toLocaleString()} DA
                        </p>
                    </div>
                </div>
            )}

            {/* By Agent */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-xl font-bold text-gray-900">Par Livreur</h2>
                </div>

                {agents.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        Aucun livreur avec des livraisons
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Livreur</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Livraisons</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">COD Collecté</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">COD Transféré</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Frais Dus</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Frais Payés</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {agents.map((agent) => (
                                    <tr key={agent.agentId} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-gray-900">{agent.agentName}</p>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-sm font-medium text-gray-600">{agent.deliveryCount}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <p className="text-sm font-bold text-purple-600">
                                                {agent.codCollected.toLocaleString()} DA
                                            </p>
                                            {agent.pendingCOD > 0 && (
                                                <p className="text-xs text-orange-600">
                                                    ⚠️ {agent.pendingCOD.toLocaleString()} DA en attente
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <p className="text-sm font-medium text-green-600">
                                                {agent.codTransferred.toLocaleString()} DA
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <p className="text-sm font-bold text-orange-600">
                                                {agent.deliveryFeesDue.toLocaleString()} DA
                                            </p>
                                            {agent.pendingFees > 0 && (
                                                <p className="text-xs text-red-600">
                                                    ❌ {agent.pendingFees.toLocaleString()} DA impayé
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <p className="text-sm font-medium text-emerald-600">
                                                {agent.deliveryFeesPaid.toLocaleString()} DA
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2 justify-center">
                                                {agent.pendingCOD > 0 && (
                                                    <button
                                                        onClick={() => handleConfirmCODTransfer(agent.agentId, agent.agentName, agent.pendingCOD)}
                                                        className="px-3 py-1 bg-purple-600 text-white rounded text-xs font-medium hover:bg-purple-700"
                                                    >
                                                        ✅ Confirmer Transfert
                                                    </button>
                                                )}
                                                {agent.pendingFees > 0 && (
                                                    <button
                                                        onClick={() => handlePayAgent(agent.agentId, agent.agentName, agent.pendingFees)}
                                                        className="px-3 py-1 bg-emerald-600 text-white rounded text-xs font-medium hover:bg-emerald-700"
                                                    >
                                                        💵 Payer Frais
                                                    </button>
                                                )}
                                                {agent.pendingCOD === 0 && agent.pendingFees === 0 && (
                                                    <span className="text-xs text-gray-400">✓ Tout réglé</span>
                                                )}
                                            </div>
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
