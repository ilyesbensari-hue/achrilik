"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AccountPendingPage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            router.push('/login');
            return;
        }

        const userData = JSON.parse(userStr);
        setUser(userData);
        setLoading(false);

        // If account is verified, redirect to appropriate dashboard
        if (userData.role === 'SELLER') {
            // Check store verification status
            fetch('/api/stores')
                .then(res => res.json())
                .then(stores => {
                    const myStore = stores.find((s: any) => s.ownerId === userData.id);
                    if (myStore?.verified) {
                        router.push('/seller/dashboard');
                    }
                })
                .catch(console.error);
        }
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('userId');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userMode');
        router.push('/');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-yellow-500 to-orange-500 px-8 py-6">
                        <div className="flex items-center gap-4">
                            <div className="text-6xl">⏳</div>
                            <div>
                                <h1 className="text-2xl font-bold text-white">
                                    Compte en cours de validation
                                </h1>
                                <p className="text-yellow-100 mt-1">
                                    Votre demande est en cours de traitement
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-8">
                        <div className="space-y-6">
                            {/* Status Message */}
                            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                                <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <span className="text-2xl">📋</span>
                                    Statut de votre demande
                                </h2>
                                <p className="text-gray-700 leading-relaxed">
                                    Nous vérifions actuellement vos documents et informations.
                                    Notre équipe reviendra vers vous sous <strong>24 à 48 heures</strong>.
                                </p>
                            </div>

                            {/* Email Notification */}
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                                <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <span className="text-2xl">📧</span>
                                    Notification par email
                                </h2>
                                <p className="text-gray-700 leading-relaxed">
                                    Vous recevrez un email à <strong>{user?.email}</strong> dès que votre compte sera validé.
                                </p>
                            </div>

                            {/* What happens next */}
                            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                                <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <span className="text-2xl">🔍</span>
                                    Que se passe-t-il ensuite ?
                                </h2>
                                <ul className="space-y-3 text-gray-700">
                                    <li className="flex items-start gap-3">
                                        <span className="text-green-600 font-bold">1.</span>
                                        <span>Vérification de vos informations et documents</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="text-green-600 font-bold">2.</span>
                                        <span>Validation de votre compte par notre équipe</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="text-green-600 font-bold">3.</span>
                                        <span>Réception d'un email de confirmation</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="text-green-600 font-bold">4.</span>
                                        <span>Accès complet à votre {user?.role === 'SELLER' ? 'boutique' : 'espace livreur'}</span>
                                    </li>
                                </ul>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                <Link
                                    href="/profile"
                                    className="flex-1 btn bg-indigo-600 text-white hover:bg-indigo-700 text-center"
                                >
                                    ✏️ Modifier mes informations
                                </Link>
                                <Link
                                    href="/"
                                    className="flex-1 btn bg-gray-100 text-gray-700 hover:bg-gray-200 text-center"
                                >
                                    🏠 Retour à l'accueil
                                </Link>
                            </div>

                            {/* Logout */}
                            <div className="text-center pt-4 border-t">
                                <button
                                    onClick={handleLogout}
                                    className="text-red-600 hover:text-red-700 font-medium text-sm"
                                >
                                    Se déconnecter
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Support */}
                    <div className="bg-gray-50 px-8 py-4 border-t border-gray-100">
                        <p className="text-center text-sm text-gray-600">
                            Besoin d'aide ?{' '}
                            <a href="mailto:support@achrilik.com" className="text-indigo-600 hover:text-indigo-700 font-medium">
                                Contactez notre support
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
