'use client';

export default function MentionsLegalesPage() {
    const currentDate = new Date().toLocaleDateString('fr-DZ', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 py-12 px-4">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 md:p-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    Mentions Légales
                </h1>

                <p className="text-gray-600 mb-8">
                    Dernière mise à jour : {currentDate}
                </p>

                <div className="prose prose-lg max-w-none">
                    {/* Section 1 */}
                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                            <span className="mr-3">1.</span>
                            Éditeur du site
                        </h2>
                        <div className="bg-purple-50 p-6 rounded-lg space-y-2">
                            <p className="text-gray-700"><strong>Nom du site :</strong> Achrilik</p>
                            <p className="text-gray-700"><strong>URL :</strong> <a href="https://achrilik.com" className="text-purple-600 hover:underline">https://achrilik.com</a></p>
                            <p className="text-gray-700"><strong>Email :</strong> <a href="mailto:contact@achrilik.com" className="text-purple-600 hover:underline">contact@achrilik.com</a></p>
                            <p className="text-gray-700"><strong>Téléphone :</strong> +213 551 22 33 44</p>
                            <p className="text-gray-700"><strong>Siège social :</strong> Oran, Algérie</p>
                        </div>
                    </section>

                    {/* Section 2 */}
                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                            <span className="mr-3">2.</span>
                            Directeur de la publication
                        </h2>
                        <p className="text-gray-700">
                            Le directeur de la publication du site achrilik.com est le responsable légal de l'entreprise Achrilik.
                        </p>
                    </section>

                    {/* Section 3 */}
                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                            <span className="mr-3">3.</span>
                            Hébergement
                        </h2>
                        <div className="bg-gray-50 p-6 rounded-lg space-y-2">
                            <p className="text-gray-700"><strong>Hébergeur :</strong> Vercel Inc.</p>
                            <p className="text-gray-700"><strong>Adresse :</strong> 340 S Lemon Ave #4133, Walnut, CA 91789, USA</p>
                            <p className="text-gray-700"><strong>Site web :</strong> <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">vercel.com</a></p>
                        </div>
                    </section>

                    {/* Section 4 - LOI 18-07 */}
                    <section className="mb-8 border-l-4 border-purple-500 pl-6 bg-purple-50 p-6 rounded-r-lg">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                            <span className="mr-3">4.</span>
                            Protection des données personnelles (Loi 18-07)
                        </h2>
                        <p className="text-gray-700 mb-4">
                            Conformément à la <strong>loi 18-07 relative à la protection des personnes physiques dans le traitement des données à caractère personnel</strong>, Achrilik s'engage à :
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                            <li>Collecter uniquement les données nécessaires au traitement de vos commandes</li>
                            <li>Protéger vos données personnelles contre tout accès non autorisé</li>
                            <li>Ne pas partager vos données avec des tiers sans votre consentement</li>
                            <li>Respecter vos droits d'accès, de rectification et de suppression</li>
                        </ul>
                        <p className="text-gray-700 mt-4">
                            Pour plus d'informations, consultez notre <a href="/politique-confidentialite" className="text-purple-600 hover:underline font-semibold">Politique de confidentialité</a>.
                        </p>
                    </section>

                    {/* Section 5 */}
                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                            <span className="mr-3">5.</span>
                            Cookies
                        </h2>
                        <p className="text-gray-700 mb-4">
                            Le site achrilik.com utilise des cookies fonctionnels pour mémoriser votre panier d'achat et améliorer votre expérience utilisateur.
                        </p>
                        <p className="text-gray-700">
                            Vous pouvez à tout moment désactiver les cookies dans les paramètres de votre navigateur. Cependant, cela peut affecter certaines fonctionnalités du site.
                        </p>
                    </section>

                    {/* Section 6 */}
                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                            <span className="mr-3">6.</span>
                            Propriété intellectuelle
                        </h2>
                        <p className="text-gray-700 mb-4">
                            L'ensemble du contenu présent sur le site achrilik.com (textes, images, logos, graphismes, vidéos) est protégé par les droits de propriété intellectuelle.
                        </p>
                        <p className="text-gray-700">
                            Toute reproduction, représentation, modification ou exploitation, totale ou partielle, du site ou de son contenu, sans l'autorisation expresse d'Achrilik, est strictement interdite et constitue une contrefaçon sanctionnée par le Code pénal algérien.
                        </p>
                    </section>

                    {/* Section 7 */}
                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                            <span className="mr-3">7.</span>
                            Limitation de responsabilité
                        </h2>
                        <p className="text-gray-700 mb-4">
                            Achrilik s'efforce de fournir des informations aussi précises que possible sur le site. Toutefois :
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                            <li>Nous ne pouvons garantir l'exactitude absolue de toutes les informations</li>
                            <li>Les photos des produits sont fournies à titre indicatif</li>
                            <li>En cas d'erreur manifeste, nous nous réservons le droit d'annuler ou de rectifier toute commande</li>
                        </ul>
                    </section>

                    {/* Section 8 */}
                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                            <span className="mr-3">8.</span>
                            Droit applicable et juridiction
                        </h2>
                        <p className="text-gray-700">
                            Les présentes mentions légales sont soumises au droit algérien. En cas de litige, et après tentative de résolution amiable, les tribunaux algériens seront seuls compétents.
                        </p>
                    </section>

                    {/* Section 9 */}
                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                            <span className="mr-3">9.</span>
                            Contact
                        </h2>
                        <p className="text-gray-700 mb-4">
                            Pour toute question concernant les mentions légales ou le fonctionnement du site, vous pouvez nous contacter :
                        </p>
                        <div className="bg-purple-50 p-6 rounded-lg space-y-2">
                            <p className="text-gray-700">📧 <strong>Email :</strong> <a href="mailto:contact@achrilik.com" className="text-purple-600 hover:underline">contact@achrilik.com</a></p>
                            <p className="text-gray-700">📱 <strong>WhatsApp :</strong> +213 551 22 33 44</p>
                            <p className="text-gray-700">🕐 <strong>Horaires :</strong> Lundi - Samedi, 9h - 18h</p>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
