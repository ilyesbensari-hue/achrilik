"use client";

import { useEffect, useState } from 'react';

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
            console.error('Error fetching settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (key: string, value: string, description?: string) => {
        if (!adminId) {
            alert('Admin ID non trouvé');
            return;
        }

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
                alert('Paramètre sauvegardé!');
                fetchSettings();
            } else {
                alert('Erreur lors de la sauvegarde');
            }
        } catch (error) {
            console.error('Error saving setting:', error);
            alert('Erreur lors de la sauvegarde');
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
                                            <button
                                                onClick={() => handleSave(setting.key, setting.value, setting.description ?? undefined)}
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
