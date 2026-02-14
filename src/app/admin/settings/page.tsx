"use client";

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { logger } from '@/lib/logger';

interface Setting {
    id: string;
    key: string;
    value: string;
    description?: string;
    category: string;
}

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState<Setting[]>([]);
    const [loading, setLoading] = useState(true);
    const [adminId, setAdminId] = useState('');
    const [activeCategory, setActiveCategory] = useState('GENERAL');

    const categories = [
        { key: 'GENERAL', label: 'Général' },
        { key: 'COMMISSION', label: '💰 Commissions' },
        { key: 'EMAIL', label: 'Email' },
        { key: 'PAYMENT', label: 'Paiement' },
        { key: 'SHIPPING', label: 'Livraison' }
    ];

    useEffect(() => {
        const storedAdminId = localStorage.getItem('userId');
        if (storedAdminId) {
            setAdminId(storedAdminId);
        }
        fetchSettings();
    }, [activeCategory]);

    const fetchSettings = async () => {
        try {
            const res = await fetch(`/api/admin/settings?category=${activeCategory}`);
            const data = await res.json();
            setSettings(Array.isArray(data) ? data : []);
        } catch (error) {
            logger.error('Error fetching settings:', { error });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (key: string, value: string, description?: string) => {
        if (!adminId) {
            toast.error('❌ Admin ID non trouvé');
            return;
        }

        const toastId = toast.loading('Sauvegarde...');
        try {
            const res = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    key,
                    value,
                    category: activeCategory,
                    description,
                    adminId
                })
            });

            if (res.ok) {
                toast.success('✅ Paramètre sauvegardé', { id: toastId });
                setTimeout(() => fetchSettings(), 500);
            } else {
                toast.error('❌ Erreur lors de la sauvegarde', { id: toastId });
            }
        } catch (error) {
            logger.error('Error saving setting:', { error });
            toast.error('❌ Erreur lors de la sauvegarde', { id: toastId });
        }
    };

    const handleAddNew = () => {
        const key = prompt('Clé du paramètre:');
        if (!key) return;

        const value = prompt('Valeur:');
        if (value === null) return;

        const description = prompt('Description (optionnel):');
        handleSave(key, value, description ?? undefined);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Paramètres Système</h1>
                <button
                    onClick={handleAddNew}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                    + Ajouter un paramètre
                </button>
            </div>

            {/* Category Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
                <div className="flex border-b border-gray-200">
                    {categories.map((cat) => (
                        <button
                            key={cat.key}
                            onClick={() => setActiveCategory(cat.key)}
                            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${activeCategory === cat.key
                                ? 'bg-indigo-50 text-indigo-600 border-b-2 border-indigo-600'
                                : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Settings List */}
            {loading ? (
                <div className="text-center py-12">Chargement...</div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                    {settings.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                            Aucun paramètre dans cette catégorie
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {settings.map((setting) => (
                                <div key={setting.id} className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 mr-4">
                                            <h3 className="font-medium text-gray-900 mb-1">
                                                {setting.key}
                                            </h3>
                                            {setting.description && (
                                                <p className="text-sm text-gray-500 mb-3">
                                                    {setting.description}
                                                </p>
                                            )}
                                            {/* Commission percentage special input */}
                                            {setting.key === 'PLATFORM_COMMISSION_RATE' ? (
                                                <div>
                                                    <div className="flex items-center gap-4 mb-2">
                                                        <input
                                                            type="range"
                                                            min="0"
                                                            max="20"
                                                            step="0.5"
                                                            defaultValue={setting.value}
                                                            onChange={(e) => {
                                                                const newValue = e.target.value;
                                                                const display = e.target.nextElementSibling as HTMLSpanElement;
                                                                const input = display?.nextElementSibling as HTMLInputElement;
                                                                if (display) display.textContent = newValue + '%';
                                                                if (input) input.value = newValue;
                                                            }}
                                                            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                                        />
                                                        <span className="text-2xl font-bold text-indigo-600 min-w-[60px]">{setting.value}%</span>
                                                        <input type="hidden" defaultValue={setting.value} />
                                                    </div>
                                                    <p className="text-xs text-gray-500 mb-3">
                                                        💡 Commission prélevée sur chaque vente. Actuellement à <strong>{setting.value}%</strong> pendant la phase de test.
                                                    </p>
                                                </div>
                                            ) : (
                                                <input
                                                    type="text"
                                                    defaultValue={setting.value}
                                                    onChange={(e) => {
                                                        const newValue = e.target.value;
                                                        const btn = e.target.nextElementSibling as HTMLButtonElement;
                                                        if (btn) {
                                                            btn.onclick = () => handleSave(setting.key, newValue, setting.description ?? undefined);
                                                        }
                                                    }}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                                />
                                            )}
                                            <button
                                                onClick={(e) => {
                                                    let newValue = setting.value;
                                                    if (setting.key === 'PLATFORM_COMMISSION_RATE') {
                                                        const hiddenInput = e.currentTarget.previousElementSibling?.querySelector('input[type="hidden"]') as HTMLInputElement;
                                                        if (hiddenInput) newValue = hiddenInput.value;
                                                    } else {
                                                        const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                                                        if (input) newValue = input.value;
                                                    }
                                                    handleSave(setting.key, newValue, setting.description ?? undefined);
                                                }}
                                                className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                                            >
                                                Sauvegarder
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
