"use client";

import { useEffect, useState, use } from 'react';
import Link from 'next/link';

export default function OrderConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center space-y-6">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-4xl">🎉</span>
                </div>

                <h1 className="text-2xl font-black text-gray-900">Commande Confirmée !</h1>

                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <p className="text-gray-500 text-sm mb-1">Numéro de commande</p>
                    <p className="font-mono font-bold text-lg text-indigo-600">#{id.slice(0, 8).toUpperCase()}</p>
                </div>

                <p className="text-gray-600">
                    Merci pour votre achat. Votre commande a été enregistrée avec succès.
                    <br />
                    <span className="font-semibold text-green-600">Un email de confirmation vous a été envoyé. 📧</span>
                </p>
                <p className="text-sm text-gray-500">
                    Vous pouvez suivre son avancement dans votre espace personnel.
                </p>

                <div className="space-y-3 pt-4">
                    <Link
                        href="/profile"
                        className="btn btn-primary w-full py-3 block"
                    >
                        📝 Voir mes commandes
                    </Link>
                    <Link
                        href="/"
                        className="btn btn-outline w-full py-3 block text-gray-600 border-gray-300 hover:border-gray-400"
                    >
                        ← Retour à l'accueil
                    </Link>
                </div>
            </div>
        </div>
    );
}
