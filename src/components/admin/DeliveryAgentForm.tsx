"use client";

import { useState } from 'react';
import { isValidAlgerianPhone } from '@/lib/delivery-helpers';

interface DeliveryAgentFormProps {
    onSuccess: (agent: any, credentials?: { email: string; password: string }) => void;
    onCancel: () => void;
}

export default function DeliveryAgentForm({ onSuccess, onCancel }: DeliveryAgentFormProps) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        wilaya: 'Oran',
        vehicleType: 'MOTO',
        licenseNumber: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const wilayas = [
        'Oran', 'Alger', 'Constantine', 'Annaba', 'Tlemcen', 'Sétif', 'Béjaïa',
        'Blida', 'Batna', 'Mostaganem', 'Sidi Bel Abbès', 'Biskra', 'Tébessa'
    ];

    const vehicleTypes = [
        { value: 'MOTO', label: '🏍️ Moto' },
        { value: 'VOITURE', label: '🚗 Voiture' },
        { value: 'VELO', label: '🚲 Vélo' }
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!formData.name || !formData.email || !formData.phone) {
            setError('Tous les champs sont requis');
            return;
        }

        if (!isValidAlgerianPhone(formData.phone)) {
            setError('Numéro de téléphone invalide (format: 0XXXXXXXXX)');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/admin/delivery-agents', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Erreur lors de la création');
            }

            onSuccess(data.agent, data.credentials);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom complet *
                </label>
                <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Karim Benali"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                </label>
                <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="karim@example.com"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Téléphone *
                </label>
                <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0770123456"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Wilaya *
                </label>
                <select
                    value={formData.wilaya}
                    onChange={(e) => setFormData({ ...formData, wilaya: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                >
                    {wilayas.map(w => (
                        <option key={w} value={w}>{w}</option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type de véhicule *
                </label>
                <select
                    value={formData.vehicleType}
                    onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                >
                    {vehicleTypes.map(v => (
                        <option key={v.value} value={v.value}>{v.label}</option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Numéro de permis (optionnel)
                </label>
                <input
                    type="text"
                    value={formData.licenseNumber}
                    onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="DZ-2024-12345"
                />
            </div>

            <div className="flex gap-3 pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    disabled={loading}
                >
                    Annuler
                </button>
                <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    disabled={loading}
                >
                    {loading ? 'Création...' : 'Créer le prestataire'}
                </button>
            </div>
        </form>
    );
}
