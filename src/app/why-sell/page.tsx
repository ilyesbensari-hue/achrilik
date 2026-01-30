"use client";

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function WhySellPage() {
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-green-600 via-green-700 to-green-900 text-white py-20 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                        Vendez vos produits sur <span className="text-yellow-300">Achrilik</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-green-100 mb-8">
                        La plateforme locale qui met vos produits en avant
                    </p>
                    <Link
                        href={user ? (user.role === 'BUYER' ? '/become-seller' : '/sell') : '/register'}
                        className="inline-block px-8 py-4 bg-white text-green-700 font-bold text-lg rounded-xl hover:bg-gray-100 transition-all shadow-2xl hover:-translate-y-1"
                    >
                        {user ? (user.role === 'BUYER' ? '🚀 Créer ma boutique' : '📊 Accéder au dashboard') : '✨ Créer mon compte'}
                    </Link>
                    <p className="text-sm text-green-200 mt-4">
                        Gratuit • Sans engagement • En 2 minutes
                    </p>
                </div>
            </div>

            {/* Commission Banner */}
            <div className="bg-yellow-400 text-gray-900 py-4">
                <div className="container text-center">
                    <p className="text-lg md:text-xl font-bold">
                        🎉 <span className="text-green-700">0% de commission</span> pendant la période d'essai !
                    </p>
                </div>
            </div>

            {/* Benefits Grid */}
            <div className="container py-20">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
                    Pourquoi vendre sur Achrilik ?
                </h2>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[
                        {
                            icon: '💰',
                            title: '0% de Commission',
                            subtitle: 'Phase d\'essai',
                            description: 'Gardez 100% de vos revenus pendant notre lancement. Aucune commission prélevée.',
                            color: 'green'
                        },
                        {
                            icon: '📍',
                            title: 'Visibilité Locale',
                            subtitle: 'Ciblage géographique',
                            description: 'Touchez directement les acheteurs de votre wilaya et de toute l\'Algérie.',
                            color: 'blue'
                        },
                        {
                            icon: '💳',
                            title: 'Paiement à la Livraison',
                            subtitle: 'Sécurité garantie',
                            description: 'Vos clients paient quand ils reçoivent. Simple et sécurisé.',
                            color: 'purple'
                        },
                        {
                            icon: '📊',
                            title: 'Statistiques en Temps Réel',
                            subtitle: 'Dashboard complet',
                            description: 'Suivez vos ventes, visiteurs et performances en un coup d\'œil.',
                            color: 'orange'
                        },
                        {
                            icon: '🚀',
                            title: 'Simple et Rapide',
                            subtitle: 'Configuration rapide',
                            description: 'Créez votre boutique en 2 minutes et commencez à vendre immédiatement.',
                            color: 'red'
                        },
                        {
                            icon: '🤝',
                            title: 'Support Dédié',
                            subtitle: 'Équipe locale',
                            description: 'Notre équipe algérienne est là pour vous accompagner à chaque étape.',
                            color: 'teal'
                        }
                    ].map((benefit, i) => (
                        <div
                            key={i}
                            className="bg-white p-8 rounded-2xl border-2 border-gray-100 hover:border-green-200 hover:shadow-xl transition-all group"
                        >
                            <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">{benefit.icon}</div>
                            <h3 className="text-xl font-bold text-gray-900 mb-1">{benefit.title}</h3>
                            <p className="text-sm text-green-600 font-medium mb-3">{benefit.subtitle}</p>
                            <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* How It Works */}
            <div className="bg-gray-50 py-20">
                <div className="container">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-gray-900">
                        Comment ça marche ?
                    </h2>
                    <p className="text-center text-gray-600 mb-16">
                        Trois étapes simples pour démarrer
                    </p>

                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {[
                            {
                                step: '1',
                                title: 'Créez votre compte',
                                description: 'Inscrivez-vous gratuitement en quelques secondes avec votre email.',
                                icon: '✍️'
                            },
                            {
                                step: '2',
                                title: 'Ajoutez vos produits',
                                description: 'Uploadez des photos, décrivez vos articles et fixez vos prix.',
                                icon: '📸'
                            },
                            {
                                step: '3',
                                title: 'Commencez à vendre',
                                description: 'Recevez des commandes et gérez votre boutique depuis votre dashboard.',
                                icon: '🎉'
                            }
                        ].map((step, i) => (
                            <div key={i} className="text-center">
                                <div className="w-20 h-20 bg-gradient-to-br from-green-600 to-green-700 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg">
                                    {step.step}
                                </div>
                                <div className="text-4xl mb-4">{step.icon}</div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                                <p className="text-gray-600">{step.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Stats Section (Optional - can add real stats later) */}
            <div className="bg-green-700 text-white py-16">
                <div className="container">
                    <div className="grid md:grid-cols-3 gap-8 text-center">
                        <div>
                            <div className="text-5xl font-bold mb-2">100+</div>
                            <div className="text-green-200">Vendeurs actifs</div>
                        </div>
                        <div>
                            <div className="text-5xl font-bold mb-2">1000+</div>
                            <div className="text-green-200">Produits en ligne</div>
                        </div>
                        <div>
                            <div className="text-5xl font-bold mb-2">5000+</div>
                            <div className="text-green-200">Acheteurs satisfaits</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="bg-white py-20">
                <div className="container text-center max-w-3xl mx-auto">
                    <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
                        Prêt à lancer votre boutique ?
                    </h2>
                    <p className="text-xl text-gray-600 mb-8">
                        Rejoignez des centaines de vendeurs qui font confiance à Achrilik
                    </p>
                    <Link
                        href={user ? (user.role === 'BUYER' ? '/become-seller' : '/sell') : '/register'}
                        className="inline-block px-10 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white text-lg font-bold rounded-xl hover:from-green-700 hover:to-green-800 transition-all shadow-xl hover:-translate-y-1"
                    >
                        {user ? (user.role === 'BUYER' ? 'Créer ma boutique maintenant →' : 'Accéder au dashboard →') : 'Commencer gratuitement →'}
                    </Link>
                    <p className="text-sm text-gray-500 mt-6">
                        Déjà vendeur ? {' '}
                        <Link href="/login" className="text-green-600 hover:underline font-medium">
                            Connectez-vous
                        </Link>
                    </p>
                </div>
            </div>

            {/* FAQ Section */}
            <div className="bg-gray-50 py-20">
                <div className="container max-w-3xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
                        Questions fréquentes
                    </h2>

                    <div className="space-y-6">
                        {[
                            {
                                q: 'Combien ça coûte ?',
                                a: 'C\'est totalement gratuit ! Nous offrons 0% de commission pendant notre période d\'essai. Aucun frais caché, aucun abonnement.'
                            },
                            {
                                q: 'Comment je reçois mes paiements ?',
                                a: 'Les clients paient à la livraison. Vous recevez l\'argent directement lorsque vous livrez le produit.'
                            },
                            {
                                q: 'Puis-je vendre n\'importe quoi ?',
                                a: 'Vous pouvez vendre tous types de produits légaux : vêtements, accessoires, high-tech, artisanat, etc.'
                            },
                            {
                                q: 'Combien de temps pour créer ma boutique ?',
                                a: 'Moins de 2 minutes ! Remplissez simplement vos informations et vous pouvez commencer à ajouter des produits immédiatement.'
                            },
                            {
                                q: 'Y a-t-il un engagement ?',
                                a: 'Aucun ! Vous pouvez arrêter quand vous voulez. Pas de contrat, pas d\'engagement.'
                            }
                        ].map((faq, i) => (
                            <div key={i} className="bg-white p-6 rounded-xl border border-gray-200">
                                <h3 className="font-bold text-lg text-gray-900 mb-2">{faq.q}</h3>
                                <p className="text-gray-600">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Final CTA */}
            <div className="bg-gradient-to-r from-green-600 to-green-800 text-white py-16">
                <div className="container text-center">
                    <h2 className="text-2xl md:text-4xl font-bold mb-4">
                        Qu'attendez-vous ?
                    </h2>
                    <p className="text-xl text-green-100 mb-8">
                        Des milliers d'acheteurs vous attendent
                    </p>
                    <Link
                        href={user ? (user.role === 'BUYER' ? '/become-seller' : '/sell') : '/register'}
                        className="inline-block px-10 py-4 bg-white text-green-700 text-lg font-bold rounded-xl hover:bg-gray-100 transition-all shadow-xl hover:-translate-y-1"
                    >
                        {user ? (user.role === 'BUYER' ? 'Créer ma boutique gratuitement' : 'Accéder au dashboard →') : 'Créer ma boutique gratuitement'}
                    </Link>
                </div>
            </div>
        </div>
    );
}
