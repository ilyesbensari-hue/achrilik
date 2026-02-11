"use client";

import { useEffect, useState } from 'react';
import { logger } from '@/lib/logger';

interface User {
    id: string;
    email: string;
    name: string | null;
    role: string;
    createdAt: string;
    _count: {
        orders: number;
    };
    store: {
        id: string;
        name: string;
        verified: boolean;
        _count: {
            products: number;
        };
    } | null;
}

export default function AdminUsers() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');

    useEffect(() => {
        fetchUsers();
    }, [roleFilter]);

    const fetchUsers = async () => {
        try {
            const params = new URLSearchParams();
            if (roleFilter) params.append('role', roleFilter);
            if (search) params.append('search', search);

            const res = await fetch(`/api/admin/users?${params}`);
            const data = await res.json();
            setUsers(data.users);
        } catch (error) {
            logger.error('Error fetching users', { error });
        } finally {
            setLoading(false);
        }
    };

    const changeUserRole = async (userId: string, newRole: string) => {
        if (!confirm(`Changer le rôle en ${newRole} ?`)) return;

        try {
            const res = await fetch(`/api/admin/users/${userId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: newRole })
            });

            if (res.ok) {
                alert('Rôle mis à jour !');
                fetchUsers();
            }
        } catch (error) {
            logger.error('Error updating role', { error, userId, newRole });
            alert('Erreur lors de la mise à jour');
        }
    };

    const deleteUser = async (userId: string) => {
        if (!confirm('Supprimer cet utilisateur ? Cette action est irréversible.')) return;

        try {
            const res = await fetch(`/api/admin/users/${userId}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                alert('Utilisateur supprimé');
                fetchUsers();
            }
        } catch (error) {
            logger.error('Error deleting user', { error, userId });
            alert('Erreur lors de la suppression');
        }
    };

    const toggleVerification = async (storeId: string, currentStatus: boolean) => {
        const action = currentStatus ? 'retirer la certification' : 'certifier';
        if (!confirm(`Voulez-vous ${action} ce vendeur ?`)) return;

        try {
            const res = await fetch(`/api/admin/stores/${storeId}/verify`, {
                method: 'POST'
            });

            if (res.ok) {
                const data = await res.json();
                alert(data.verified ? '✅ Vendeur certifié !' : 'Certification retirée');
                fetchUsers();
            }
        } catch (error) {
            logger.error('Error toggling verification', { error, storeId });
            alert('Erreur lors de la certification');
        }
    };

    const resetPassword = async (userId: string, userName: string) => {
        const newPassword = prompt(`Nouveau mot de passe pour ${userName} (min 8 caractères):`);
        if (!newPassword) return;

        if (newPassword.length < 8) {
            alert('Le mot de passe doit contenir au moins 8 caractères');
            return;
        }

        try {
            const res = await fetch(`/api/admin/users/${userId}/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newPassword })
            });

            const data = await res.json();

            if (res.ok) {
                alert(`✅ Mot de passe réinitialisé!\n\nNouveau mot de passe: ${newPassword}\n\nCommuniquez-le à l'utilisateur.`);
            } else {
                alert(data.error || 'Erreur lors de la réinitialisation');
            }
        } catch (error) {
            logger.error('Error resetting password', { error, userId });
            alert('Erreur lors de la réinitialisation');
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Gestion des Utilisateurs</h1>
                <div className="flex gap-2">
                    <a
                        href="/api/admin/export/users?format=csv"
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                        📊 Export CSV
                    </a>
                    <a
                        href="/api/admin/export/users?format=pdf"
                        target="_blank"
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                    >
                        📄 Export PDF
                    </a>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-6">
                <div className="flex gap-4">
                    <input
                        type="text"
                        placeholder="Rechercher par nom ou email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && fetchUsers()}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value="">Tous les rôles</option>
                        <option value="BUYER">Buyers</option>
                        <option value="SELLER">Sellers</option>
                        <option value="ADMIN">Admins</option>
                    </select>
                    <button
                        onClick={fetchUsers}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        Rechercher
                    </button>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Utilisateur</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rôle</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Boutique</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Commandes</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                    Chargement...
                                </td>
                            </tr>
                        ) : users.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                    Aucun utilisateur trouvé
                                </td>
                            </tr>
                        ) : (
                            users.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <p className="font-medium text-gray-900">{user.name || 'Sans nom'}</p>
                                        <p className="text-sm text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</p>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900">{user.email}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                                            user.role === 'SELLER' ? 'bg-green-100 text-green-800' :
                                                'bg-blue-100 text-blue-800'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        {user.store ? (
                                            <div className="flex items-center gap-2">
                                                <div>
                                                    <p className="flex items-center gap-1">
                                                        {user.store.name}
                                                        {user.store.verified && (
                                                            <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-500 text-white rounded-full text-xs" title="Vendeur Certifié">
                                                                ✓
                                                            </span>
                                                        )}
                                                    </p>
                                                    <p className="text-xs text-gray-500">{user.store._count.products} produits</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="text-gray-400">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900">{user._count.orders}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex gap-2">
                                                <select
                                                    onChange={(e) => changeUserRole(user.id, e.target.value)}
                                                    className="text-sm border border-gray-300 rounded px-2 py-1"
                                                    defaultValue=""
                                                >
                                                    <option value="" disabled>Changer rôle</option>
                                                    <option value="BUYER">BUYER</option>
                                                    <option value="SELLER">SELLER</option>
                                                    <option value="ADMIN">ADMIN</option>
                                                </select>
                                                <button
                                                    onClick={() => deleteUser(user.id)}
                                                    className="text-sm px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                                                >
                                                    🗑️ Supprimer
                                                </button>
                                                <button
                                                    onClick={() => resetPassword(user.id, user.name || user.email)}
                                                    className="text-sm px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                                                >
                                                    🔑 Reset MDP
                                                </button>
                                            </div>
                                            {user.store && (
                                                <button
                                                    onClick={() => toggleVerification(user.store!.id, user.store!.verified)}
                                                    className={`text-sm font-medium px-3 py-1 rounded ${user.store.verified
                                                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                                        }`}
                                                >
                                                    {user.store.verified ? '✓ Certifié' : '✓ Certifier'}
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
