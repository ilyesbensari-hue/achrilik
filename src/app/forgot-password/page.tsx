"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            if (res.ok) {
                setSuccess(true);
            } else {
                const data = await res.json();
                setError(data.error || 'Erreur lors de l\'envoi');
            }
        } catch (err) {
            setError('Erreur de connexion');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">✅</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                        Email envoyé !
                    </h1>
                    <p className="text-gray-600 mb-6">
                        Si un compte existe avec cet email, vous recevrez un lien de réinitialisation dans quelques instants.
                    </p>
                    <p className="text-sm text-gray-500 mb-6">
                        Vérifiez également vos spams si vous ne voyez pas l'email.
                    </p>
                    <Link
                        href="/login"
                        className="inline-block px-6 py-3 bg-[#006233] text-white rounded-lg hover:bg-[#004d28] transition-colors"
                    >
                        Retour à la connexion
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Mot de passe oublié ?
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Entrez votre email pour recevoir un lien de réinitialisation
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006233] focus:border-[#006233] outline-none transition-all"
                            placeholder="votre@email.com"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full px-6 py-3 bg-[#006233] text-white rounded-lg hover:bg-[#004d28] transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Envoi...' : 'Envoyer le lien'}
                    </button>

                    <div className="text-center">
                        <Link
                            href="/login"
                            className="text-[#006233] hover:underline font-medium"
                        >
                            ← Retour à la connexion
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
