"use client";

import { useActionState } from 'react';
import { register } from '@/app/lib/actions';
import Link from 'next/link';

export default function RegisterPage() {
    const [errorMessage, formAction, isPending] = useActionState(register, undefined);

    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
            <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col lg:flex-row">

                {/* Left Side - Visual */}
                <div className="hidden lg:flex w-1/2 relative bg-[#006233] p-12 text-white flex-col justify-between">
                    <div>
                        <Link href="/" className="inline-block mb-8">
                            <span className="text-3xl font-bold">Achrilik</span>
                        </Link>
                        <h2 className="text-3xl font-bold mb-4">Bienvenue !</h2>
                        <p className="text-green-100">
                            Rejoignez la plus grande communauté de vente et d'achat en ligne en Algérie.
                        </p>
                    </div>
                    <div className="relative h-64 w-full">
                        <div className="absolute inset-0 flex items-center justify-center text-green-200 opacity-20 text-9xl">
                            🛍️
                        </div>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="w-full lg:w-1/2 p-8 md:p-12">
                    <div className="text-center md:text-left mb-8">
                        <h2 className="text-2xl font-bold text-gray-800">Créer un compte</h2>
                        <p className="text-gray-500 mt-2 text-sm">Créez votre compte pour commencer à acheter.</p>
                        <p className="text-xs text-gray-400 mt-1">Vous voulez vendre ? <Link href="/why-sell" className="text-[#006233] hover:underline font-medium">En savoir plus</Link></p>
                    </div>

                    <form action={formAction} className="space-y-4">

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                name="email"
                                type="email"
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006233] focus:border-[#006233] outline-none transition-all"
                                placeholder="votre@email.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
                            <input
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
                            className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-colors shadow-sm mt-6 ${isPending
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-[#006233] hover:bg-[#004d28]'
                                }`}
                        >
                            {isPending ? 'Création...' : 'Créer mon compte'}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-sm text-gray-600">
                        Déjà un compte ?{' '}
                        <Link href="/login" className="font-medium text-[#006233] hover:underline">
                            Se connecter
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
