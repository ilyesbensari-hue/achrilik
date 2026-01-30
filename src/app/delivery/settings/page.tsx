"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DeliverySettingsPage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            setUser(JSON.parse(userStr));
        }
        setLoading(false);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('userId');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userMode');
        router.push('/');
    };

    if (loading) {
        return <div className="text-center py-12">Chargement...</div>;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Paramètres</h1>

            <div className="max-w-2xl space-y-6">
                {/* Profile Info */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Informations du profil</h2>
                    <div className="space-y-3">
                        <div>
                            <p className="text-sm text-gray-500">Nom</p>
                            <p className="font-medium text-gray-900">{user?.name}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="font-medium text-gray-900">{user?.email}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Téléphone</p>
                            <p className="font-medium text-gray-900">{user?.phone || 'Non renseigné'}</p>
                        </div>
                    </div>
                </div>

                {/* Notifications */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h2>
                    <div className="space-y-3">
                        <label className="flex items-center justify-between">
                            <span className="text-gray-700">Nouvelles livraisons disponibles</span>
                            <input type="checkbox" className="toggle" defaultChecked />
                        </label>
                        <label className="flex items-center justify-between">
                            <span className="text-gray-700">Rappels de livraison</span>
                            <input type="checkbox" className="toggle" defaultChecked />
                        </label>
                        <label className="flex items-center justify-between">
                            <span className="text-gray-700">Notifications par email</span>
                            <input type="checkbox" className="toggle" />
                        </label>
                    </div>
                </div>

                {/* Support */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Support</h2>
                    <div className="space-y-3">
                        <a
                            href="mailto:support@achrilik.com"
                            className="block text-indigo-600 hover:text-indigo-700 font-medium"
                        >
                            📧 Contacter le support
                        </a>
                        <a
                            href="/help"
                            className="block text-indigo-600 hover:text-indigo-700 font-medium"
                        >
                            ❓ Centre d'aide
                        </a>
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="bg-red-50 rounded-xl shadow-sm p-6 border border-red-200">
                    <h2 className="text-lg font-semibold text-red-900 mb-4">Zone dangereuse</h2>
                    <button
                        onClick={handleLogout}
                        className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
                    >
                        🚪 Se déconnecter
                    </button>
                </div>
            </div>
        </div>
    );
}
