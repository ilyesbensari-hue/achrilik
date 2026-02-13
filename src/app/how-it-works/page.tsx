import Link from 'next/link';
import { ShoppingBag, Truck, CreditCard, Package, Phone, HelpCircle } from 'lucide-react';

export default function HowItWorksPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-rose-500 to-pink-600 text-white py-16">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-black mb-4">Comment ça marche ?</h1>
                    <p className="text-xl md:text-2xl font-light opacity-95">
                        Acheter sur Achrilik, c'est simple et rapide ! 🚀
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-12">

                {/* Steps Section */}
                <div className="max-w-4xl mx-auto space-y-12">

                    {/* Step 1 */}
                    <div className="flex gap-6 items-start">
                        <div className="flex-shrink-0 w-16 h-16 bg-rose-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                            1
                        </div>
                        <div className="flex-1 bg-white p-6 rounded-2xl shadow-md border border-gray-100">
                            <div className="flex items-center gap-3 mb-3">
                                <ShoppingBag className="h-6 w-6 text-rose-500" />
                                <h3 className="text-2xl font-bold text-gray-900">Parcourez nos produits</h3>
                            </div>
                            <p className="text-gray-600 leading-relaxed">
                                Explorez notre catalogue de produits tendance : robes, accessoires, maroquinerie et plus encore.
                                Utilisez les filtres par catégorie pour trouver exactement ce que vous cherchez.
                            </p>
                        </div>
                    </div>

                    {/* Step 2 */}
                    <div className="flex gap-6 items-start">
                        <div className="flex-shrink-0 w-16 h-16 bg-pink-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                            2
                        </div>
                        <div className="flex-1 bg-white p-6 rounded-2xl shadow-md border border-gray-100">
                            <div className="flex items-center gap-3 mb-3">
                                <Package className="h-6 w-6 text-pink-500" />
                                <h3 className="text-2xl font-bold text-gray-900">Ajoutez au panier</h3>
                            </div>
                            <p className="text-gray-600 leading-relaxed">
                                Sélectionnez la taille et la couleur de votre produit, puis ajoutez-le à votre panier.
                                Vous pouvez continuer vos achats ou passer directement à la commande.
                            </p>
                            <div className="mt-4 bg-rose-50 p-4 rounded-xl border-l-4 border-rose-500">
                                <p className="text-sm text-gray-700">
                                    <strong>💡 Astuce :</strong> Les quantités sont limitées au stock disponible pour éviter les déceptions !
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Step 3 */}
                    <div className="flex gap-6 items-start">
                        <div className="flex-shrink-0 w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                            3
                        </div>
                        <div className="flex-1 bg-white p-6 rounded-2xl shadow-md border border-gray-100">
                            <div className="flex items-center gap-3 mb-3">
                                <HelpCircle className="h-6 w-6 text-purple-500" />
                                <h3 className="text-2xl font-bold text-gray-900">Finalisez votre commande</h3>
                            </div>
                            <p className="text-gray-600 leading-relaxed mb-4">
                                Remplissez vos informations de livraison : nom complet, téléphone et adresse de livraison.
                                Si c'est votre première commande, nous vous demanderons ces informations obligatoires.
                            </p>
                            <ul className="space-y-2 text-gray-700">
                                <li className="flex items-start gap-2">
                                    <span className="text-rose-500 font-bold">✓</span>
                                    <span><strong>Nom complet :</strong> Pour identifier le destinataire</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-rose-500 font-bold">✓</span>
                                    <span><strong>Téléphone :</strong> Pour vous contacter lors de la livraison</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-rose-500 font-bold">✓</span>
                                    <span><strong>Adresse :</strong> Utilisez la carte interactive pour préciser votre localisation</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Step 4 */}
                    <div className="flex gap-6 items-start">
                        <div className="flex-shrink-0 w-16 h-16 bg-indigo-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                            4
                        </div>
                        <div className="flex-1 bg-white p-6 rounded-2xl shadow-md border border-gray-100">
                            <div className="flex items-center gap-3 mb-3">
                                <Truck className="h-6 w-6 text-indigo-500" />
                                <h3 className="text-2xl font-bold text-gray-900">Livraison rapide</h3>
                            </div>
                            <p className="text-gray-600 leading-relaxed mb-4">
                                Nous livrons à <strong>Oran et ses environs</strong> dans les plus brefs délais.
                                Les frais de livraison sont calculés automatiquement en fonction de votre adresse.
                            </p>
                            <div className="bg-indigo-50 p-4 rounded-xl">
                                <p className="text-sm text-indigo-900 font-semibold">
                                    📍 Zone de livraison : Oran (Ville) et environs
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Step 5 */}
                    <div className="flex gap-6 items-start">
                        <div className="flex-shrink-0 w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                            5
                        </div>
                        <div className="flex-1 bg-white p-6 rounded-2xl shadow-md border border-gray-100">
                            <div className="flex items-center gap-3 mb-3">
                                <CreditCard className="h-6 w-6 text-green-500" />
                                <h3 className="text-2xl font-bold text-gray-900">Paiement à la livraison</h3>
                            </div>
                            <p className="text-gray-600 leading-relaxed">
                                Payez en espèces lors de la réception de votre commande. C'est simple, sécurisé et sans engagement !
                                Vous pouvez inspecter votre colis avant de payer.
                            </p>
                        </div>
                    </div>

                </div>

                {/* FAQ Section */}
                <div className="max-w-4xl mx-auto mt-16">
                    <h2 className="text-3xl font-black text-gray-900 mb-8 text-center">Questions Fréquentes</h2>
                    <div className="space-y-4">

                        <details className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 cursor-pointer group">
                            <summary className="font-bold text-gray-900 text-lg list-none flex justify-between items-center">
                                <span>Puis-je modifier ma commande après validation ?</span>
                                <span className="text-rose-500 group-open:rotate-180 transition-transform">▼</span>
                            </summary>
                            <p className="text-gray-600 mt-4 leading-relaxed">
                                Contactez-nous immédiatement via notre service client au <strong>+213 XX XX XX XX</strong> ou par email.
                                Si la commande n'a pas encore été expédiée, nous pourrons la modifier.
                            </p>
                        </details>

                        <details className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 cursor-pointer group">
                            <summary className="font-bold text-gray-900 text-lg list-none flex justify-between items-center">
                                <span>Quels sont les délais de livraison ?</span>
                                <span className="text-rose-500 group-open:rotate-180 transition-transform">▼</span>
                            </summary>
                            <p className="text-gray-600 mt-4 leading-relaxed">
                                Les commandes à Oran sont généralement livrées sous <strong>24 à 48 heures</strong> ouvrables.
                                Vous recevrez une confirmation par SMS ou email avec les détails de votre livraison.
                            </p>
                        </details>

                        <details className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 cursor-pointer group">
                            <summary className="font-bold text-gray-900 text-lg list-none flex justify-between items-center">
                                <span>Comment suivre ma commande ?</span>
                                <span className="text-rose-500 group-open:rotate-180 transition-transform">▼</span>
                            </summary>
                            <p className="text-gray-600 mt-4 leading-relaxed">
                                Connectez-vous à votre compte et accédez à la section <strong>"Mes Commandes"</strong>.
                                Vous y trouverez le statut en temps réel de toutes vos commandes.
                            </p>
                        </details>

                        <details className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 cursor-pointer group">
                            <summary className="font-bold text-gray-900 text-lg list-none flex justify-between items-center">
                                <span>Que faire si un produit est défectueux ou ne correspond pas ?</span>
                                <span className="text-rose-500 group-open:rotate-180 transition-transform">▼</span>
                            </summary>
                            <p className="text-gray-600 mt-4 leading-relaxed">
                                Vous pouvez refuser le colis au moment de la livraison si le produit ne correspond pas à votre commande.
                                Pour tout retour après livraison, contactez notre service client dans les <strong>48 heures</strong>.
                            </p>
                        </details>

                    </div>
                </div>

                {/* CTA Section */}
                <div className="max-w-2xl mx-auto mt-16 text-center bg-gradient-to-br from-rose-500 to-pink-600 p-10 rounded-3xl shadow-2xl text-white">
                    <h2 className="text-3xl font-black mb-4">Prêt à commencer ?</h2>
                    <p className="text-lg mb-6 opacity-95">
                        Découvrez nos produits et profitez de la livraison rapide à Oran !
                    </p>
                    <div className="flex gap-4 justify-center flex-wrap">
                        <Link
                            href="/"
                            className="bg-white text-rose-600 px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
                        >
                            🛍️ Voir les produits
                        </Link>
                        <Link
                            href="/contact"
                            className="bg-rose-800 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all border-2 border-white/30"
                        >
                            <Phone className="inline-block h-5 w-5 mr-2" />
                            Nous contacter
                        </Link>
                    </div>
                </div>

            </div>
        </div>
    );
}
