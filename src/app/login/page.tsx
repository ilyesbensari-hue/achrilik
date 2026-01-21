"use client";

import { useActionState } from 'react';
import { authenticate } from '@/app/lib/actions';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/';
    const [errorMessage, formAction, isPending] = useActionState(authenticate, undefined);

    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
            <div className="w-full max-w-md">
                <div className="card bg-white p-8 shadow-xl">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">
                            Connexion
                        </h2>
                        <p className="text-sm text-gray-600">
                            Connectez-vous pour accéder à votre compte
                        </p>
                    </div>

                    <form action={formAction} className="space-y-5">
                        <input type="hidden" name="redirectTo" value={callbackUrl} />
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Adresse Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006233] focus:border-[#006233] outline-none transition-all"
                                placeholder="votre@email.com"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                Mot de passe
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006233] focus:border-[#006233] outline-none transition-all"
                                placeholder="••••••••"
                            />
                        </div>

                        {errorMessage && (
                            <div className="flex bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                                <p>{errorMessage}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            aria-disabled={isPending}
                            className="bg-[#006233] hover:bg-[#004d28] w-full py-3 px-4 rounded-lg text-white font-medium transition-colors shadow-sm mt-4 disabled:opacity-50"
                        >
                            {isPending ? 'Connexion en cours...' : 'Se connecter'}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t text-center">
                        <p className="text-sm text-gray-600 mb-4">Pas encore de compte ?</p>
                        <Link
                            href="/register"
                            className="inline-block w-full py-2.5 px-4 rounded-lg border-2 border-[#006233] text-[#006233] font-medium hover:bg-green-50 transition-colors"
                        >
                            Créer un compte
                        </Link>
                    </div>

                    <div className="mt-6 text-center">
                        <Link href="/" className="text-sm text-gray-500 hover:text-gray-900">
                            ← Retour à l'accueil
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
