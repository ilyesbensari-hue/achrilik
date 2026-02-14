"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CommissionSettingsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const [commissionRate, setCommissionRate] = useState(0);
    const [previousRate, setPreviousRate] = useState<number | null>(null);
    const [lastUpdated, setLastUpdated] = useState<string | null>(null);

    // Fetch current settings
    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/settings/commission');
            const data = await res.json();

            if (data.success) {
                setCommissionRate(data.settings.commissionRate);
                setPreviousRate(data.settings.previousRate);
                setLastUpdated(data.settings.updatedAt);
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
            alert('Erreur lors du chargement');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (commissionRate < 0 || commissionRate > 100) {
            alert('Le taux doit être entre 0 et 100%');
            return;
        }

        setSaving(true);
        try {
            const userStr = localStorage.getItem('user');
            const user = userStr ? JSON.parse(userStr) : null;

            const res = await fetch('/api/admin/settings/commission', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    commissionRate,
                    userId: user?.id
                })
            });

            const data = await res.json();

            if (data.success) {
                alert(`Taux commission mis à jour : ${commissionRate}%`);
                fetchSettings(); // Reload
            } else {
                alert(`Erreur: ${data.error}`);
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            alert('Erreur technique');
        } finally {
            setSaving(false);
        }
    };

    const previewAmount = (orderTotal: number) => {
        return (orderTotal * commissionRate / 100).toFixed(2);
    };

    if (loading) {
        return (
            <div className="container py-10">
                <div className="card max-w-2xl mx-auto p-8">
                    <p>Chargement...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container py-10">
            <div className="card max-w-2xl mx-auto p-8">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold">Configuration Commission Plateforme</h1>
                    <button
                        onClick={() => router.push('/admin/commissions')}
                        className="btn btn-outline"
                    >
                        Voir Dashboard
                    </button>
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                    <p className="text-sm text-blue-900">
                        💡 <strong>Comment ça marche:</strong> Le taux de commission s'applique automatiquement
                        aux nouvelles commandes <strong>DELIVERED</strong>. Les anciennes commandes ne sont pas affectées.
                    </p>
                </div>

                {/* Current Rate Display */}
                <div className="bg-gray-50 p-6 rounded-xl border mb-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Taux Actuel</p>
                            <p className="text-3xl font-bold text-[#006233]">{commissionRate}%</p>
                        </div>
                        {previousRate !== null && (
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Ancien Taux</p>
                                <p className="text-2xl font-bold text-gray-400">{previousRate}%</p>
                            </div>
                        )}
                    </div>
                    {lastUpdated && (
                        <p className="text-xs text-gray-500 mt-4">
                            Dernière mise à jour: {new Date(lastUpdated).toLocaleString('fr-FR')}
                        </p>
                    )}
                </div>

                {/* Rate Input */}
                <div className="mb-6">
                    <label className="label mb-2 block font-bold">
                        Nouveau Taux de Commission (%)
                    </label>
                    <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={commissionRate}
                        onChange={(e) => setCommissionRate(parseFloat(e.target.value) || 0)}
                        className="input text-2xl font-bold"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Entre 0% et 100%
                    </p>
                </div>

                {/* Preview */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border-2 border-green-200 mb-6">
                    <h3 className="font-bold mb-4">Aperçu des Commissions</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span>Commande de 10,000 DA</span>
                            <span className="font-bold text-[#006233]">{previewAmount(10000)} DA</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Commande de 50,000 DA</span>
                            <span className="font-bold text-[#006233]">{previewAmount(50000)} DA</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Commande de 100,000 DA</span>
                            <span className="font-bold text-[#006233]">{previewAmount(100000)} DA</span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                    <button
                        onClick={() => router.back()}
                        className="btn btn-outline flex-1"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="btn btn-primary flex-1"
                    >
                        {saving ? 'Enregistrement...' : 'Enregistrer'}
                    </button>
                </div>
            </div>
        </div>
    );
}
