'use client';

import { useState } from 'react';
import { RefreshCw, Check, AlertCircle } from 'lucide-react';

export default function CacheManagementPage() {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleForceRefresh = async () => {
        setLoading(true);
        setStatus('idle');

        try {
            const res = await fetch('/api/admin/force-refresh', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            const data = await res.json();

            if (res.ok) {
                setStatus('success');
                setMessage(`✅ ${data.message} à ${new Date(data.refreshedAt).toLocaleTimeString('fr-FR')}`);
            } else {
                setStatus('error');
                setMessage(`❌ ${data.error || 'Erreur inconnue'}`);
            }
        } catch (error) {
            setStatus('error');
            setMessage('❌ Erreur de connexion');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Gestion du Cache
                </h1>
                <p className="text-gray-600">
                    Force le rafraîchissement complet du cache après modifications Prisma Studio
                </p>
            </div>

            {/* Main Card */}
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
                {/* Icon */}
                <div className="flex justify-center mb-6">
                    <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-6 rounded-full">
                        <RefreshCw className="w-16 h-16 text-emerald-600" />
                    </div>
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-center text-gray-900 mb-4">
                    Rafraîchir le Cache Complet
                </h2>

                {/* Description */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-blue-900 mb-2">
                        <strong>Quand utiliser ce bouton :</strong>
                    </p>
                    <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                        <li>Après modifications via Prisma Studio</li>
                        <li>Après migrations de base de données</li>
                        <li>Si homepage ne reflète pas les changements</li>
                    </ul>
                </div>

                {/* Refresh Button */}
                <button
                    onClick={handleForceRefresh}
                    disabled={loading}
                    className={`
                        w-full py-4 px-6 rounded-lg font-bold text-lg
                        transition-all duration-300 transform
                        ${loading
                            ? 'bg-gray-300 cursor-not-allowed'
                            : 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg hover:shadow-xl hover:scale-105'
                        }
                    `}
                >
                    {loading ? (
                        <span className="flex items-center justify-center gap-2">
                            <RefreshCw className="w-5 h-5 animate-spin" />
                            Rafraîchissement en cours...
                        </span>
                    ) : (
                        <span className="flex items-center justify-center gap-2">
                            <RefreshCw className="w-5 h-5" />
                            Rafraîchir Maintenant
                        </span>
                    )}
                </button>

                {/* Status Message */}
                {status !== 'idle' && (
                    <div
                        className={`
                            mt-6 p-4 rounded-lg flex items-start gap-3
                            ${status === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}
                        `}
                    >
                        {status === 'success' ? (
                            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        ) : (
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        )}
                        <p className={`text-sm font-medium ${status === 'success' ? 'text-green-900' : 'text-red-900'}`}>
                            {message}
                        </p>
                    </div>
                )}

                {/* Info Box */}
                <div className="mt-8 bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-xs text-gray-600 mb-2">
                        <strong>📝 Note :</strong>
                    </p>
                    <p className="text-xs text-gray-600 leading-relaxed">
                        Ce bouton invalide le cache de toutes les pages (homepage, catégories, produits, nouveautés).
                        Les changements seront visibles immédiatement après rafraîchissement.
                        Pas besoin de redémarrer le serveur.
                    </p>
                </div>
            </div>

            {/* Quick Links */}
            <div className="mt-6 flex gap-4 justify-center">
                <a
                    href="/admin/products"
                    className="text-sm text-emerald-600 hover:text-emerald-700 font-medium hover:underline"
                >
                    ← Retour aux produits
                </a>
                <span className="text-gray-300">•</span>
                <a
                    href="http://localhost:5555"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-emerald-600 hover:text-emerald-700 font-medium hover:underline"
                >
                    Ouvrir Prisma Studio →
                </a>
            </div>
        </div>
    );
}
