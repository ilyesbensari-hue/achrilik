"use client";

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function RegisterPage() {
    const router = useRouter();
    const { refresh } = useAuth();
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsLoading(true);
        setError('');

        const formData = new FormData(event.currentTarget);
        const email = formData.get('email');
        const password = formData.get('password');
        const name = formData.get('name');
        const phone = formData.get('phone');
        const address = formData.get('address');
        const wilaya = formData.get('wilaya');
        const city = formData.get('city');

        try {
            const response = await fetch('/api/auth/register-v2', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, name, phone, address, wilaya, city }),
            });

            if (response.ok) {
                await refresh();
                router.push('/profile');
                router.refresh();
            } else {
                const data = await response.json();
                setError(data.error || "Une erreur s'est produite lors de l'inscription.");
            }
        } catch (error) {
            setError("Erreur de connexion au serveur.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Créer un compte
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Rejoignez la communauté Achrilik
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div className="mb-4">
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                                placeholder="Votre Nom"
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Adresse Email</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                                placeholder="votre@email.com"
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Téléphone (05, 06, 07...)</label>
                            <input
                                id="phone"
                                name="phone"
                                type="tel"
                                pattern="0[567][0-9]{8}"
                                title="Format: 05, 06 ou 07 suivi de 8 chiffres (ex: 0550123456)"
                                required
                                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                                placeholder="0550123456"
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Adresse (Optionnel)</label>
                            <input
                                id="address"
                                name="address"
                                type="text"
                                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                                placeholder="Cité 123 logts, Rue..."
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label htmlFor="wilaya" className="block text-sm font-medium text-gray-700 mb-1">Wilaya (Optionnel)</label>
                                <input
                                    id="wilaya"
                                    name="wilaya"
                                    type="text"
                                    className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                                    placeholder="Oran"
                                />
                            </div>
                            <div>
                                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">Commune (Optionnel)</label>
                                <input
                                    id="city"
                                    name="city"
                                    type="text"
                                    className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                                    placeholder="Es Senia"
                                />
                            </div>
                        </div>
                        <div className="mb-4">
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Mot de passe (Min. 8 char)</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                minLength={8}
                                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">
                            {error}
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-[#006233] hover:bg-[#004d28] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors disabled:opacity-50"
                        >
                            {isLoading ? 'Création en cours...' : "S'inscrire"}
                        </button>
                    </div>

                    <div className="text-center mt-4">
                        <Link href="/login" className="text-sm text-green-600 hover:text-green-500 font-medium">
                            Déjà un compte ? Se connecter
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
