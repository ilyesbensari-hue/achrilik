'use client';

import Link from 'next/link';
import { Package, Truck, CreditCard, RefreshCw, HelpCircle, Phone } from 'lucide-react';

export default function FAQPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 py-12 px-4">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        Foire Aux Questions (FAQ)
                    </h1>
                    <p className="text-xl text-gray-600">
                        Trouvez rapidement les réponses à vos questions
                    </p>
                </div>

                {/* Categories */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
                    <button className="bg-purple-500 text-white p-4 rounded-xl font-semibold hover:bg-purple-600 transition-colors">
                        <Package className="w-6 h-6 mx-auto mb-2" />
                        Commande
                    </button>
                    <button className="bg-pink-500 text-white p-4 rounded-xl font-semibold hover:bg-pink-600 transition-colors">
                        <Truck className="w-6 h-6 mx-auto mb-2" />
                        Livraison
                    </button>
                    <button className="bg-purple-600 text-white p-4 rounded-xl font-semibold hover:bg-purple-700 transition-colors">
                        <CreditCard className="w-6 h-6 mx-auto mb-2" />
                        Paiement
                    </button>
                </div>

                {/* Questions */}
                <div className="space-y-4">
                    {/* Commande Section */}
                    <div className="bg-white p-6 rounded-2xl shadow-md">
                        <h2 className="text-2xl font-bold text-purple-600 mb-6 flex items-center gap-2">
                            <Package className="w-6 h-6" />
                            Commande
                        </h2>
                        <div className="space-y-4">
                            <details className="group cursor-pointer">
                                <summary className="font-semibold text-gray-900 text-lg list-none flex justify-between items-center">
                                    <span>Comment passer une commande ?</span>
                                    <span className="text-purple-500 group-open:rotate-180 transition-transform">▼</span>
                                </summary>
                                <p className="text-gray-600 mt-3 leading-relaxed pl-4">
                                    1. Parcourez notre catalogue et sélectionnez les produits souhaités<br />
                                    2. Ajoutez-les à votre panier<br />
                                    3. Cliquez sur "Passer commande"<br />
                                    4. Remplissez vos informations de livraison<br />
                                    5. Confirmez votre commande
                                </p>
                            </details>

                            <hr className="border-gray-200" />

                            <details className="group cursor-pointer">
                                <summary className="font-semibold text-gray-900 text-lg list-none flex justify-between items-center">
                                    <span>Puis-je modifier ma commande après validation ?</span>
                                    <span className="text-purple-500 group-open:rotate-180 transition-transform">▼</span>
                                </summary>
                                <p className="text-gray-600 mt-3 leading-relaxed pl-4">
                                    Oui, mais uniquement si la commande n'a pas encore été expédiée. Contactez-nous immédiatement via WhatsApp (+213 551 22 33 44) ou email (contact@achrilik.com) pour effectuer la modification.
                                </p>
                            </details>

                            <hr className="border-gray-200" />

                            <details className="group cursor-pointer">
                                <summary className="font-semibold text-gray-900 text-lg list-none flex justify-between items-center">
                                    <span>Comment annuler ma commande ?</span>
                                    <span className="text-purple-500 group-open:rotate-180 transition-transform">▼</span>
                                </summary>
                                <p className="text-gray-600 mt-3 leading-relaxed pl-4">
                                    Vous pouvez annuler votre commande gratuitement tant qu'elle n'a pas été expédiée. Contactez notre service client au plus vite. Si le colis est déjà en route, vous pourrez le refuser à la livraison.
                                </p>
                            </details>

                            <hr className="border-gray-200" />

                            <details className="group cursor-pointer">
                                <summary className="font-semibold text-gray-900 text-lg list-none flex justify-between items-center">
                                    <span>Est-ce que je reçois une confirmation de commande ?</span>
                                    <span className="text-purple-500 group-open:rotate-180 transition-transform">▼</span>
                                </summary>
                                <p className="text-gray-600 mt-3 leading-relaxed pl-4">
                                    Oui ! Vous recevrez un email de confirmation immédiatement après avoir passé votre commande avec tous les détails (numéro de commande, produits, montant total, adresse de livraison).
                                </p>
                            </details>
                        </div>
                    </div>

                    {/* Livraison Section */}
                    <div className="bg-white p-6 rounded-2xl shadow-md">
                        <h2 className="text-2xl font-bold text-pink-600 mb-6 flex items-center gap-2">
                            <Truck className="w-6 h-6" />
                            Livraison
                        </h2>
                        <div className="space-y-4">
                            <details className="group cursor-pointer">
                                <summary className="font-semibold text-gray-900 text-lg list-none flex justify-between items-center">
                                    <span>Quels sont les délais de livraison ?</span>
                                    <span className="text-pink-500 group-open:rotate-180 transition-transform">▼</span>
                                </summary>
                                <p className="text-gray-600 mt-3 leading-relaxed pl-4">
                                    Nous livrons actuellement uniquement sur <strong>Oran</strong> dans un délai de 24-48h ouvrables.
                                </p>
                            </details>

                            <hr className="border-gray-200" />

                            <details className="group cursor-pointer">
                                <summary className="font-semibold text-gray-900 text-lg list-none flex justify-between items-center">
                                    <span>Livrez-vous partout en Algérie ?</span>
                                    <span className="text-pink-500 group-open:rotate-180 transition-transform">▼</span>
                                </summary>
                                <p className="text-gray-600 mt-3 leading-relaxed pl-4">
                                    Actuellement, nous livrons uniquement sur <strong>Oran</strong>. Nous prévoyons d'étendre notre zone de livraison prochainement.
                                </p>
                            </details>

                            <hr className="border-gray-200" />

                            <details className="group cursor-pointer">
                                <summary className="font-semibold text-gray-900 text-lg list-none flex justify-between items-center">
                                    <span>Quels sont les frais de livraison ?</span>
                                    <span className="text-pink-500 group-open:rotate-180 transition-transform">▼</span>
                                </summary>
                                <p className="text-gray-600 mt-3 leading-relaxed pl-4">
                                    Les frais de livraison sont affichés avant la validation de votre commande. Certaines boutiques offrent la livraison gratuite à partir d'un montant minimum d'achat (cette information est visible sur la fiche produit).
                                </p>
                            </details>

                            <hr className="border-gray-200" />

                            <details className="group cursor-pointer">
                                <summary className="font-semibold text-gray-900 text-lg list-none flex justify-between items-center">
                                    <span>Comment suivre ma commande ?</span>
                                    <span className="text-pink-500 group-open:rotate-180 transition-transform">▼</span>
                                </summary>
                                <p className="text-gray-600 mt-3 leading-relaxed pl-4">
                                    Connectez-vous à votre compte et accédez à la section "Mes Commandes". Vous y trouverez le statut en temps réel de toutes vos commandes (En attente, En préparation, Expédiée, Livrée).
                                </p>
                            </details>

                            <hr className="border-gray-200" />

                            <details className="group cursor-pointer">
                                <summary className="font-semibold text-gray-900 text-lg list-none flex justify-between items-center">
                                    <span>Que faire si je ne suis pas disponible à la livraison ?</span>
                                    <span className="text-pink-500 group-open:rotate-180 transition-transform">▼</span>
                                </summary>
                                <p className="text-gray-600 mt-3 leading-relaxed pl-4">
                                    Le livreur vous appellera avant de passer. Si vous n'êtes pas disponible, vous pouvez convenir d'un autre créneau horaire ou demander la livraison à une adresse alternative.
                                </p>
                            </details>
                        </div>
                    </div>

                    {/* Paiement Section */}
                    <div className="bg-white p-6 rounded-2xl shadow-md">
                        <h2 className="text-2xl font-bold text-purple-600 mb-6 flex items-center gap-2">
                            <CreditCard className="w-6 h-6" />
                            Paiement
                        </h2>
                        <div className="space-y-4">
                            <details className="group cursor-pointer">
                                <summary className="font-semibold text-gray-900 text-lg list-none flex justify-between items-center">
                                    <span>Quels modes de paiement acceptez-vous ?</span>
                                    <span className="text-purple-500 group-open:rotate-180 transition-transform">▼</span>
                                </summary>
                                <p className="text-gray-600 mt-3 leading-relaxed pl-4">
                                    Nous acceptons uniquement le <strong>paiement en espèces à la livraison</strong>. Vous payez directement au livreur lorsque vous recevez votre colis.
                                </p>
                            </details>

                            <hr className="border-gray-200" />

                            <details className="group cursor-pointer">
                                <summary className="font-semibold text-gray-900 text-lg list-none flex justify-between items-center">
                                    <span>Puis-je inspecter le colis avant de payer ?</span>
                                    <span className="text-purple-500 group-open:rotate-180 transition-transform">▼</span>
                                </summary>
                                <p className="text-gray-600 mt-3 leading-relaxed pl-4">
                                    Oui, absolument ! Vous pouvez ouvrir le colis et vérifier que le produit correspond bien à votre commande avant de payer le livreur.
                                </p>
                            </details>

                            <hr className="border-gray-200" />

                            <details className="group cursor-pointer">
                                <summary className="font-semibold text-gray-900 text-lg list-none flex justify-between items-center">
                                    <span>Dois-je payer en ligne pour commander ?</span>
                                    <span className="text-purple-500 group-open:rotate-180 transition-transform">▼</span>
                                </summary>
                                <p className="text-gray-600 mt-3 leading-relaxed pl-4">
                                    Non ! Aucun paiement en ligne n'est requis. Vous commandez gratuitement et vous ne payez qu'à la réception de votre colis.
                                </p>
                            </details>
                        </div>
                    </div>

                    {/* Garantie Section */}
                    <div className="bg-white p-6 rounded-2xl shadow-md">
                        <h2 className="text-2xl font-bold text-pink-600 mb-6 flex items-center gap-2">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            Garantie Vendeur
                        </h2>
                        <div className="space-y-4">
                            <details className="group cursor-pointer">
                                <summary className="font-semibold text-gray-900 text-lg list-none flex justify-between items-center">
                                    <span>Qu'est-ce que la garantie vendeur ?</span>
                                    <span className="text-pink-500 group-open:rotate-180 transition-transform">▼</span>
                                </summary>
                                <p className="text-gray-600 mt-3 leading-relaxed pl-4">
                                    Chaque vendeur propose sa propre garantie sur ses produits. La durée et les conditions de garantie sont affichées sur la fiche produit. <strong>Pour les produits électroniques, nous recommandons une garantie minimale de 6 mois.</strong>
                                </p>
                            </details>

                            <hr className="border-gray-200" />

                            <details className="group cursor-pointer">
                                <summary className="font-semibold text-gray-900 text-lg list-none flex justify-between items-center">
                                    <span>Comment voir la garantie d'un produit ?</span>
                                    <span className="text-pink-500 group-open:rotate-180 transition-transform">▼</span>
                                </summary>
                                <p className="text-gray-600 mt-3 leading-relaxed pl-4">
                                    La garantie est clairement affichée sur chaque fiche produit avec un badge vert 🛡️. Vous verrez la durée de garantie (exemple : "Garantie: 6 mois") avant de passer commande.
                                </p>
                            </details>

                            <hr className="border-gray-200" />

                            <details className="group cursor-pointer">
                                <summary className="font-semibold text-gray-900 text-lg list-none flex justify-between items-center">
                                    <span>Que faire si mon produit est défectueux ?</span>
                                    <span className="text-pink-500 group-open:rotate-180 transition-transform">▼</span>
                                </summary>
                                <p className="text-gray-600 mt-3 leading-relaxed pl-4">
                                    <strong>À la livraison :</strong> Vous pouvez inspecter le produit et refuser le colis si vous constatez un défaut visible.<br /><br />
                                    <strong>Après livraison :</strong> Si vous découvrez un défaut pendant la période de garantie, contactez directement le vendeur via la page boutique. Le vendeur s'engage à réparer, remplacer ou rembourser le produit défectueux selon les termes de sa garantie.
                                </p>
                            </details>

                            <hr className="border-gray-200" />

                            <details className="group cursor-pointer">
                                <summary className="font-semibold text-gray-900 text-lg list-none flex justify-between items-center">
                                    <span>Puis-je retourner un produit si je change d'avis ?</span>
                                    <span className="text-pink-500 group-open:rotate-180 transition-transform">▼</span>
                                </summary>
                                <p className="text-gray-600 mt-3 leading-relaxed pl-4">
                                    Non, nous n'acceptons pas les retours pour changement d'avis. C'est pourquoi nous vous recommandons fortement d'<strong>inspecter le produit à la livraison</strong> avant de payer le livreur. Vous avez le droit d'ouvrir le colis et de vérifier que le produit correspond bien à votre commande.
                                </p>
                            </details>

                            <hr className="border-gray-200" />

                            <details className="group cursor-pointer">
                                <summary className="font-semibold text-gray-900 text-lg list-none flex justify-between items-center">
                                    <span>Comment contacter le vendeur pour la garantie ?</span>
                                    <span className="text-pink-500 group-open:rotate-180 transition-transform">▼</span>
                                </summary>
                                <p className="text-gray-600 mt-3 leading-relaxed pl-4">
                                    Sur la fiche produit ou dans votre historique de commandes, cliquez sur le nom de la boutique pour accéder aux informations de contact du vendeur. Vous pourrez le contacter directement pour faire valoir votre garantie.
                                </p>
                            </details>
                        </div>
                    </div>

                    {/* Compte Section */}
                    <div className="bg-white p-6 rounded-2xl shadow-md">
                        <h2 className="text-2xl font-bold text-purple-600 mb-6 flex items-center gap-2">
                            <HelpCircle className="w-6 h-6" />
                            Compte & Autres
                        </h2>
                        <div className="space-y-4">
                            <details className="group cursor-pointer">
                                <summary className="font-semibold text-gray-900 text-lg list-none flex justify-between items-center">
                                    <span>Dois-je créer un compte pour commander ?</span>
                                    <span className="text-purple-500 group-open:rotate-180 transition-transform">▼</span>
                                </summary>
                                <p className="text-gray-600 mt-3 leading-relaxed pl-4">
                                    Non, vous pouvez commander en tant qu'invité. Cependant, créer un compte vous permet de suivre vos commandes facilement, sauvegarder vos adresses, et accéder à votre historique d'achats.
                                </p>
                            </details>

                            <hr className="border-gray-200" />

                            <details className="group cursor-pointer">
                                <summary className="font-semibold text-gray-900 text-lg list-none flex justify-between items-center">
                                    <span>Comment réinitialiser mon mot de passe ?</span>
                                    <span className="text-purple-500 group-open:rotate-180 transition-transform">▼</span>
                                </summary>
                                <p className="text-gray-600 mt-3 leading-relaxed pl-4">
                                    Cliquez sur "Connexion" puis "Mot de passe oublié". Entrez votre email et vous recevrez un lien pour réinitialiser votre mot de passe.
                                </p>
                            </details>

                            <hr className="border-gray-200" />

                            <details className="group cursor-pointer">
                                <summary className="font-semibold text-gray-900 text-lg list-none flex justify-between items-center">
                                    <span>Comment contacter le service client ?</span>
                                    <span className="text-purple-500 group-open:rotate-180 transition-transform">▼</span>
                                </summary>
                                <p className="text-gray-600 mt-3 leading-relaxed pl-4">
                                    📱 <strong>WhatsApp :</strong> +213 551 22 33 44<br />
                                    📧 <strong>Email :</strong> contact@achrilik.com<br />
                                    🕐 <strong>Horaires :</strong> Lundi - Samedi, 9h - 18h
                                </p>
                            </details>
                        </div>
                    </div>
                </div>

                {/* CTA */}
                <div className="mt-12 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-8 rounded-2xl shadow-xl text-center">
                    <h3 className="text-2xl font-bold mb-4">Vous ne trouvez pas la réponse ?</h3>
                    <p className="text-lg mb-6 text-purple-100">
                        Notre équipe est là pour vous aider !
                    </p>
                    <Link
                        href="/contact"
                        className="inline-flex items-center gap-2 bg-white text-purple-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-purple-50 transition-all shadow-lg"
                    >
                        <Phone className="w-5 h-5" />
                        Contactez-nous
                    </Link>
                </div>
            </div>
        </div>
    );
}
