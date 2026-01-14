"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    // Redirect if already logged in
    useEffect(() => {
        const user = localStorage.getItem('user');
        if (user) {
            try {
                const userData = JSON.parse(user);
                if (userData.role === 'SELLER') {
                    router.push('/sell');
                } else {
                    router.push('/');
                }
            } catch (e) {
                // Invalid user data, clear it
                localStorage.removeItem('user');
            }
        }
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password }),
                headers: { 'Content-Type': 'application/json' }
            });

            const data = await res.json();

            if (data.id) {
                // Store as single user object
                const user = {
                    id: data.id,
                    email: data.email || email,
                    name: data.name,
                    role: data.role
                };
                localStorage.setItem('user', JSON.stringify(user));

                // Clear old keys if they exist
                localStorage.removeItem('userId');
                localStorage.removeItem('userRole');
                localStorage.removeItem('userName');

                // Trigger storage event for other components
                window.dispatchEvent(new Event('storage'));

                // Redirect based on role
                if (data.role === 'SELLER') {
                    router.push('/sell');
                } else {
                    router.push('/');
                }
            } else {
                alert(data.error || 'Erreur de connexion');
            }
        } catch (error) {
            console.error(error);
            alert('Erreur de connexion');
        } finally {
            setLoading(false);
        }
    };


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

                    <form className="space-y-5" onSubmit={handleSubmit}>
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
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
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
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-[#006233] hover:bg-[#004d28] w-full py-3 px-4 rounded-lg text-white font-medium transition-colors shadow-sm mt-4 disabled:opacity-50"
                        >
                            {loading ? 'Connexion...' : 'Se connecter'}
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
