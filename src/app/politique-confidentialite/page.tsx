'use client';

export default function PolitiqueConfidentialite() {
    const currentDate = new Date().toLocaleDateString('fr-DZ', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 py-12 px-4">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 md:p-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    Politique de Confidentialité
                </h1>

                <p className="text-gray-600 mb-8">
                    Dernière mise à jour : {currentDate}
                </p>

                <div className="prose prose-lg max-w-none">
                    {/* Section 1 */}
                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                            <span className="mr-3">1.</span>
                            Données collectées
                        </h2>
                        <p className="text-gray-700 mb-4">
                            Nous collectons les données suivantes lors de votre commande :
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                            <li>Nom et prénom</li>
                            <li>Numéro de téléphone</li>
                            <li>Adresse de livraison</li>
                            <li>Ville et wilaya</li>
                            <li>Coordonnées GPS (optionnel, pour faciliter la livraison)</li>
                        </ul>
                    </section>

                    {/* Section 2 */}
                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                            <span className="mr-3">2.</span>
                            Utilisation des données
                        </h2>
                        <p className="text-gray-700 mb-4">
                            Ces données servent uniquement à :
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                            <li>Traiter et livrer votre commande</li>
                            <li>Vous contacter pour confirmer la commande</li>
                            <li>Améliorer notre service client</li>
                            <li>Gérer les retours et réclamations éventuelles</li>
                        </ul>
                    </section>

                    {/* Section 3 */}
                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                            <span className="mr-3">3.</span>
                            Conservation des données
                        </h2>
                        <p className="text-gray-700">
                            Vos données personnelles sont conservées pendant :
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mt-4">
                            <li>1 an après votre dernière commande</li>
                            <li>Ou jusqu'à demande de suppression de votre part</li>
                        </ul>
                    </section>

                    {/* Section 4 - LOI 18-07 */}
                    <section className="mb-8 border-l-4 border-purple-500 pl-6 bg-purple-50 p-6 rounded-r-lg">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                            <span className="mr-3">4.</span>
                            Vos droits (Loi 18-07)
                        </h2>
                        <p className="text-gray-700 mb-4">
                            Conformément à la <strong>loi 18-07 relative à la protection des personnes physiques
                                dans le traitement des données à caractère personnel</strong>, vous disposez des droits suivants :
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                            <li><strong>Droit d'accès</strong> : consulter vos données personnelles</li>
                            <li><strong>Droit de rectification</strong> : corriger vos données inexactes</li>
                            <li><strong>Droit de suppression</strong> : demander l'effacement de vos données</li>
                            <li><strong>Droit d'opposition</strong> : vous opposer au traitement de vos données</li>
                        </ul>

                        <div className="mt-6 bg-white p-4 rounded-lg">
                            <p className="font-semibold text-gray-900 mb-2">Pour exercer vos droits :</p>
                            <div className="space-y-2 text-gray-700">
                                <p className="flex items-center">
                                    <span className="mr-2">📧</span>
                                    <a href="mailto:contact@achrilik.com" className="text-purple-600 hover:underline">
                                        contact@achrilik.com
                                    </a>
                                </p>
                                <p className="flex items-center">
                                    <span className="mr-2">📱</span>
                                    <span>WhatsApp : +213 551 22 33 44</span>
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Section 5 */}
                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                            <span className="mr-3">5.</span>
                            Sécurité des données
                        </h2>
                        <p className="text-gray-700 mb-4">
                            Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos données :
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                            <li><strong>Connexion HTTPS sécurisée</strong> pour toutes les transactions</li>
                            <li><strong>Accès restreint</strong> aux données personnelles</li>
                            <li><strong>Pas de partage avec des tiers</strong> sans votre consentement</li>
                            <li><strong>Stockage sécurisé</strong> dans des serveurs protégés</li>
                        </ul>
                    </section>

                    {/* Section 6 */}
                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                            <span className="mr-3">6.</span>
                            Cookies
                        </h2>
                        <p className="text-gray-700 mb-4">
                            Nous utilisons des cookies pour :
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                            <li><strong>Cookies fonctionnels</strong> : mémoriser votre panier d'achat</li>
                            <li><strong>Cookies analytiques</strong> : analyser le trafic via Google Analytics (optionnel)</li>
                        </ul>
                        <p className="text-gray-700 mt-4">
                            Vous pouvez refuser les cookies dans les paramètres de votre navigateur.
                            Cependant, cela peut affecter certaines fonctionnalités du site.
                        </p>
                    </section>

                    {/* Section 7 */}
                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                            <span className="mr-3">7.</span>
                            Modifications de la politique
                        </h2>
                        <p className="text-gray-700">
                            Nous nous réservons le droit de modifier cette politique de confidentialité à tout moment.
                            Toute modification sera publiée sur cette page avec une nouvelle date de mise à jour.
                        </p>
                    </section>

                    {/* Footer */}
                    <div className="mt-12 pt-8 border-t border-gray-200">
                        <div className="text-center space-y-2">
                            <p className="text-lg font-semibold text-gray-900">Achrilik</p>
                            <p className="text-gray-600">Shopping Mode en Ligne - Oran, Algérie 🇩🇿</p>
                            <div className="flex justify-center space-x-4 text-sm text-gray-600 mt-4">
                                <a href="mailto:contact@achrilik.com" className="hover:text-purple-600">
                                    📧 contact@achrilik.com
                                </a>
                                <span>|</span>
                                <span>📱 WhatsApp: +213 551 22 33 44</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
