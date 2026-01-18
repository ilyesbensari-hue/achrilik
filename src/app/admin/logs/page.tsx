"use client";

import { useEffect, useState } from 'react';

interface AdminLog {
    id: string;
    action: string;
    targetType: string;
    targetId?: string;
    details?: string;
    createdAt: string;
    admin: {
        name: string;
        email: string;
    };
    product?: {
        title: string;
    };
}

export default function AdminLogsPage() {
    const [logs, setLogs] = useState<AdminLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionFilter, setActionFilter] = useState('');
    const [targetTypeFilter, setTargetTypeFilter] = useState('');

    useEffect(() => {
        fetchLogs();
    }, [actionFilter, targetTypeFilter]);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (actionFilter) params.append('action', actionFilter);
            if (targetTypeFilter) params.append('targetType', targetTypeFilter);

            const res = await fetch(`/api/admin/logs?${params}`);
            const data = await res.json();
            setLogs(data.logs || []);
        } catch (error) {
            console.error('Error fetching logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const getActionLabel = (action: string) => {
        const labels: Record<string, string> = {
            APPROVE_PRODUCT: 'Produit Approuvé',
            REJECT_PRODUCT: 'Produit Rejeté',
            DELETE_USER: 'Utilisateur Supprimé',
            UPDATE_USER: 'Utilisateur Modifié',
            UPDATE_SETTINGS: 'Paramètres Modifiés',
            PROMOTE_USER: 'Utilisateur Promu'
        };
        return labels[action] || action;
    };

    const getActionColor = (action: string) => {
        if (action.includes('APPROVE')) return 'text-green-600';
        if (action.includes('REJECT') || action.includes('DELETE')) return 'text-red-600';
        if (action.includes('UPDATE')) return 'text-blue-600';
        return 'text-gray-600';
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Logs d'Actions Admin</h1>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Type d'action
                        </label>
                        <select
                            value={actionFilter}
                            onChange={(e) => setActionFilter(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">Toutes les actions</option>
                            <option value="APPROVE_PRODUCT">Produit Approuvé</option>
                            <option value="REJECT_PRODUCT">Produit Rejeté</option>
                            <option value="DELETE_USER">Utilisateur Supprimé</option>
                            <option value="UPDATE_SETTINGS">Paramètres Modifiés</option>
                            <option value="PROMOTE_USER">Utilisateur Promu</option>
                        </select>
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Type de cible
                        </label>
                        <select
                            value={targetTypeFilter}
                            onChange={(e) => setTargetTypeFilter(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">Tous les types</option>
                            <option value="PRODUCT">Produit</option>
                            <option value="USER">Utilisateur</option>
                            <option value="ORDER">Commande</option>
                            <option value="SETTINGS">Paramètres</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Logs Table */}
            {loading ? (
                <div className="text-center py-12">Chargement...</div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Admin
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Action
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Cible
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Détails
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {logs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        Aucun log trouvé
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(log.createdAt).toLocaleString('fr-FR')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {log.admin.name || log.admin.email}
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${getActionColor(log.action)}`}>
                                            {getActionLabel(log.action)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {log.targetType}
                                            {log.product && ` - ${log.product.title}`}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {log.details && (
                                                <details className="cursor-pointer">
                                                    <summary className="text-indigo-600 hover:text-indigo-800">
                                                        Voir détails
                                                    </summary>
                                                    <pre className="mt-2 text-xs bg-gray-50 p-2 rounded">
                                                        {JSON.stringify(JSON.parse(log.details), null, 2)}
                                                    </pre>
                                                </details>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
