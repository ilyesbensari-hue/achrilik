'use client';

import { useEffect, useState } from 'react';
import { logger } from '@/lib/logger';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface DeliveryFee {
    id: string;
    fromCity: string;
    toWilaya: string;
    baseFee: number;
    isActive: boolean;
}

export default function DeliveryFeesPage() {
    const [fees, setFees] = useState<DeliveryFee[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);

    const [formData, setFormData] = useState({
        fromCity: '',
        toWilaya: '',
        baseFee: 500
    });

    useEffect(() => {
        fetchFees();
    }, []);

    const fetchFees = async () => {
        try {
            const res = await fetch('/api/admin/delivery-fees');
            const data = await res.json();
            setFees(data);
        } catch (error) {
            logger.error('Error fetching fees', { error });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const toastId = toast.loading('Création...');
        try {
            const res = await fetch('/api/admin/delivery-fees', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                toast.success('✅ Configuration créée', { id: toastId });
                await fetchFees();
                setFormData({ fromCity: '', toWilaya: '', baseFee: 500 });
                setShowAddForm(false);
            } else {
                const error = await res.json();
                toast.error(error.error || '❌ Erreur lors de la création', { id: toastId });
            }
        } catch (error) {
            logger.error('Error creating fee', { error });
            toast.error('❌ Erreur lors de la création', { id: toastId });
        }
    };

    const handleUpdate = async (id: string, baseFee: number) => {
        try {
            const res = await fetch('/api/admin/delivery-fees', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, baseFee })
            });

            if (res.ok) {
                await fetchFees();
                setEditingId(null);
            }
        } catch (error) {
            logger.error('Error updating fee', { error, id, baseFee });
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette configuration ?')) return;

        try {
            const res = await fetch(`/api/admin/delivery-fees?id=${id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                await fetchFees();
            }
        } catch (error) {
            logger.error('Error deleting fee', { error, id });
        }
    };

    const toggleActive = async (id: string, isActive: boolean) => {
        try {
            const res = await fetch('/api/admin/delivery-fees', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, isActive: !isActive })
            });

            if (res.ok) {
                await fetchFees();
            }
        } catch (error) {
            logger.error('Error toggling active', { error, id, isActive });
        }
    };

    const wilayas = [
        'Adrar', 'Chlef', 'Laghouat', 'Oum El Bouaghi', 'Batna', 'Béjaïa', 'Biskra', 'Béchar',
        'Blida', 'Bouira', 'Tamanrasset', 'Tébessa', 'Tlemcen', 'Tiaret', 'Tizi Ouzou', 'Alger',
        'Djelfa', 'Jijel', 'Sétif', 'Saïda', 'Skikda', 'Sidi Bel Abbès', 'Annaba', 'Guelma',
        'Constantine', 'Médéa', 'Mostaganem', 'M\'Sila', 'Mascara', 'Ouargla', 'Oran', 'El Bayadh',
        'Illizi', 'Bordj Bou Arreridj', 'Boumerdès', 'El Tarf', 'Tindouf', 'Tissemsilt', 'El Oued',
        'Khenchela', 'Souk Ahras', 'Tipaza', 'Mila', 'Aïn Defla', 'Naâma', 'Aïn Témouchent',
        'Ghardaïa', 'Relizane', 'Timimoun', 'Bordj Badji Mokhtar', 'Ouled Djellal', 'Béni Abbès',
        'In Salah', 'In Guezzam', 'Touggourt', 'Djanet', 'El M\'Ghair', 'El Meniaa', 'Autre'
    ];

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 p-8">
                <div className="max-w-6xl mx-auto">
                    <p className="text-gray-600">Chargement...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Frais de Livraison</h1>
                        <p className="text-sm text-gray-600 mt-1">
                            Configurez les frais selon la ville de stockage et la wilaya de destination
                        </p>
                    </div>
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="flex items-center gap-2 bg-[#006233] text-white px-4 py-2 rounded-lg hover:bg-[#005028] transition-colors"
                    >
                        <Plus className="h-5 w-5" />
                        Ajouter
                    </button>
                </div>

                {/* Add Form */}
                {showAddForm && (
                    <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold">Nouvelle Configuration</h2>
                            <button
                                onClick={() => setShowAddForm(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Ville de Stockage
                                </label>
                                <select
                                    value={formData.fromCity}
                                    onChange={(e) => setFormData({ ...formData, fromCity: e.target.value })}
                                    className="w-full rounded-lg border-gray-300 focus:ring-[#006233] focus:border-[#006233]"
                                    required
                                >
                                    <option value="">Sélectionner...</option>
                                    {wilayas.map((city) => (
                                        <option key={city} value={city}>{city}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Wilaya Destination
                                </label>
                                <select
                                    value={formData.toWilaya}
                                    onChange={(e) => setFormData({ ...formData, toWilaya: e.target.value })}
                                    className="w-full rounded-lg border-gray-300 focus:ring-[#006233] focus:border-[#006233]"
                                    required
                                >
                                    <option value="">Sélectionner...</option>
                                    {wilayas.map((wilaya) => (
                                        <option key={wilaya} value={wilaya}>{wilaya}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Frais (DA)
                                </label>
                                <input
                                    type="number"
                                    value={formData.baseFee}
                                    onChange={(e) => setFormData({ ...formData, baseFee: parseInt(e.target.value) })}
                                    className="w-full rounded-lg border-gray-300 focus:ring-[#006233] focus:border-[#006233]"
                                    min="0"
                                    step="50"
                                    required
                                />
                            </div>
                            <div className="flex items-end">
                                <button
                                    type="submit"
                                    className="w-full bg-[#006233] text-white px-4 py-2 rounded-lg hover:bg-[#005028] transition-colors flex items-center justify-center gap-2"
                                >
                                    <Save className="h-4 w-4" />
                                    Enregistrer
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Fees Table */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Ville Stockage
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Wilaya Destination
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Frais
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Statut
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {fees.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        Aucune configuration. Cliquez sur "Ajouter" pour commencer.
                                    </td>
                                </tr>
                            ) : (
                                fees.map((fee) => (
                                    <tr key={fee.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                            {fee.fromCity}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700">
                                            {fee.toWilaya}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            {editingId === fee.id ? (
                                                <input
                                                    type="number"
                                                    defaultValue={fee.baseFee}
                                                    onBlur={(e) => handleUpdate(fee.id, parseInt(e.target.value))}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            handleUpdate(fee.id, parseInt(e.currentTarget.value));
                                                        }
                                                    }}
                                                    className="w-24 rounded border-gray-300 focus:ring-[#006233] focus:border-[#006233]"
                                                    autoFocus
                                                />
                                            ) : (
                                                <span className="font-semibold text-gray-900">
                                                    {fee.baseFee.toLocaleString()} DA
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <input
                                                type="checkbox"
                                                checked={fee.isActive}
                                                onChange={() => toggleActive(fee.id, fee.isActive)}
                                                className="h-5 w-5 rounded border-gray-300 text-[#006233] focus:ring-[#006233] cursor-pointer"
                                            />
                                            <span className={`block text-xs mt-1 font-medium ${fee.isActive ? 'text-green-600' : 'text-gray-400'}`}>
                                                {fee.isActive ? 'Actif' : 'Inactif'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => setEditingId(fee.id)}
                                                    className="text-blue-600 hover:text-blue-800"
                                                    title="Modifier le prix"
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(fee.id)}
                                                    className="text-red-600 hover:text-red-800"
                                                    title="Supprimer"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Info Box */}
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-blue-900 mb-2">💡 Comment ça marche ?</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Chaque magasin a une <strong>ville de stockage</strong> définie</li>
                        <li>• Les frais de livraison se calculent selon: <strong>Ville de Stockage → Wilaya de Destination</strong></li>
                        <li>• Si aucune configuration n'existe, les frais par défaut (500 DA) s'appliquent</li>
                        <li>• Utilisez "Autre" comme wilaya de destination pour créer un frais par défaut</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
