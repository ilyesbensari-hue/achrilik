"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'BUYER' | 'SELLER'>('BUYER');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                body: JSON.stringify({
                    email,
                    password,
                    userType: role,
                    isRegister: true,
                    name // Pass name if backend updates to accept it, or rely on email split
                }),
                headers: { 'Content-Type': 'application/json' }
            });

            const data = await res.json();

            if (data.id) {
                // Store user session
                const user = {
                    id: data.id,
                    email: data.email,
                    name: data.name,
                    role: role // Trust local state or use data.role
                };
                localStorage.setItem('user', JSON.stringify(user));

                // Clear old keys
                localStorage.removeItem('userId');
                localStorage.removeItem('userRole');
                localStorage.removeItem('userName');

                // Trigger storage event
                window.dispatchEvent(new Event('storage'));

                // Redirect based on role
                if (role === 'SELLER') {
                    router.push('/sell');
                } else {
                    router.push('/');
                }
            } else {
                alert(data.error || 'Erreur lors de l\'inscription');
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
                        {/* Placeholder for illustration if needed, or just text */}
                        <div className="absolute inset-0 flex items-center justify-center text-green-200 opacity-20 text-9xl">
                            🛍️
                        </div>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="w-full lg:w-1/2 p-8 md:p-12">
                    <div className="text-center md:text-left mb-8">
                        <h2 className="text-2xl font-bold text-gray-800">Créer un compte</h2>
                        <p className="text-gray-500 mt-2 text-sm">Choisissez votre type de compte pour commencer.</p>
                    </div>

                    {/* Role Selection Tabs */}
                    <div className="flex p-1 bg-gray-100 rounded-lg mb-8">
                        <button
                            type="button"
                            onClick={() => setRole('BUYER')}
                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${role === 'BUYER'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <span className="mr-2">👤</span>
                            Client
                        </button>
                        <button
                            type="button"
                            onClick={() => setRole('SELLER')}
                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${role === 'SELLER'
                                ? 'bg-white text-[#006233] shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <span className="mr-2">🏪</span>
                            Vendeur
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {role === 'SELLER' && (
                            <div className="bg-green-50 p-4 rounded-lg border border-green-100 mb-4">
                                <p className="text-sm text-green-800">
                                    🚀 En tant que vendeur, vous pourrez créer votre boutique, ajouter des produits et gérer vos commandes.
                                </p>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006233] focus:border-[#006233] outline-none transition-all"
                                placeholder="votre@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
                            <input
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
                            className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-colors shadow-sm mt-6 ${loading
                                ? 'bg-gray-400 cursor-not-allowed'
                                : role === 'SELLER' ? 'bg-[#006233] hover:bg-[#004d28]' : 'bg-blue-600 hover:bg-blue-700'
                                }`}
                        >
                            {loading ? 'Création...' : (role === 'SELLER' ? 'Créer ma boutique' : 'Créer mon compte')}
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
