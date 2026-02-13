'use client';

export default function CGVPage() {
    const currentDate = new Date().toLocaleDateString('fr-DZ', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 py-12 px-4">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 md:p-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    Conditions Générales de Vente
                </h1>

                <p className="text-gray-600 mb-8">
                    Dernière mise à jour : {currentDate}
                </p>

                <div className="prose prose-lg max-w-none">
                    {/* Section 1 */}
                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                            <span className="mr-3">1.</span>
                            Objet
                        </h2>
                        <p className="text-gray-700">
                            Les présentes Conditions Générales de Vente (CGV) régissent les ventes de produits effectuées par Achrilik sur le site <strong>achrilik.com</strong>. Toute commande implique l'acceptation sans réserve des présentes CGV.
                        </p>
                    </section>

                    {/* Section 2 */}
                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                            <span className="mr-3">2.</span>
                            Produits
                        </h2>
                        <p className="text-gray-700 mb-4">
                            Les produits proposés sont ceux qui figurent sur le site achrilik.com. Chaque produit est accompagné d'un descriptif détaillé et de photos.
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                            <li>Les photos sont aussi fidèles que possible mais peuvent présenter de légères différences avec le produit réel</li>
                            <li>Les stocks sont limités et mis à jour régulièrement</li>
                            <li>Achrilik se réserve le droit de retirer un produit du catalogue à tout moment</li>
                        </ul>
                    </section>

                    {/* Section 3 */}
                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                            <span className="mr-3">3.</span>
                            Commande
                        </h2>
                        <p className="text-gray-700 mb-4">
                            Pour passer commande, vous devez :
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                            <li>Sélectionner les produits souhaités</li>
                            <li>Les ajouter à votre panier</li>
                            <li>Renseigner vos informations de livraison (nom, téléphone, adresse)</li>
                            <li>Confirmer votre commande</li>
                        </ul>
                        <p className="text-gray-700 mt-4">
                            Une fois confirmée, vous recevrez un email de confirmation avec le récapitulatif de votre commande.
                        </p>
                    </section>

                    {/* Section 4 - Prix */}
                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                            <span className="mr-3">4.</span>
                            Prix
                        </h2>
                        <p className="text-gray-700 mb-4">
                            Les prix affichés sur le site sont en <strong>Dinars Algériens (DA)</strong> et incluent toutes taxes.
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                            <li>Les prix sont valables au moment de la commande</li>
                            <li>Les frais de livraison sont affichés avant la validation de la commande</li>
                            <li>Achrilik se réserve le droit de modifier ses prix à tout moment</li>
                        </ul>
                    </section>

                    {/* Section 5 - Livraison */}
                    <section className="mb-8 border-l-4 border-purple-500 pl-6 bg-purple-50 p-6 rounded-r-lg">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                            <span className="mr-3">5.</span>
                            Livraison
                        </h2>

                        <h3 className="text-xl font-semibold text-gray-800 mb-3">Zones de livraison</h3>
                        <p className="text-gray-700 mb-4">
                            Achrilik livre dans toute l'Algérie (58 wilayas).
                        </p>

                        <h3 className="text-xl font-semibold text-gray-800 mb-3">Délais de livraison</h3>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
                            <li><strong>Oran</strong> : 24-48h ouvrables</li>
                            <li><strong>Alger, Blida, Tizi Ouzou</strong> : 48-72h ouvrables</li>
                            <li><strong>Autres wilayas</strong> : 3-7 jours ouvrables</li>
                        </ul>

                        <h3 className="text-xl font-semibold text-gray-800 mb-3">Frais de livraison</h3>
                        <p className="text-gray-700 mb-4">
                            Les frais de livraison sont calculés automatiquement en fonction de votre wilaya et affichés avant la validation de la commande.
                        </p>
                        <div className="bg-white p-4 rounded-lg">
                            <p className="text-sm text-gray-700">
                                <strong>💡 Livraison gratuite :</strong> Certaines boutiques offrent la livraison gratuite à partir d'un montant minimum d'achat. Cette information est affichée sur la fiche produit.
                            </p>
                        </div>
                    </section>

                    {/* Section 6 - Paiement */}
                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                            <span className="mr-3">6.</span>
                            Paiement
                        </h2>
                        <p className="text-gray-700 mb-4">
                            Le paiement s'effectue <strong>en espèces à la livraison</strong> auprès du livreur.
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                            <li>Vous payez uniquement lorsque vous recevez votre commande</li>
                            <li>Vous pouvez inspecter le colis avant de payer</li>
                            <li>Prévoyez le montant exact si possible</li>
                        </ul>
                    </section>

                    {/* Section 7 - Retours */}
                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                            <span className="mr-3">7.</span>
                            Droit de rétractation et retours
                        </h2>
                        <h3 className="text-xl font-semibold text-gray-800 mb-3">À la livraison</h3>
                        <p className="text-gray-700 mb-4">
                            Vous pouvez <strong>refuser le colis</strong> à la livraison si :
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
                            <li>Le produit ne correspond pas à votre commande</li>
                            <li>Le produit est endommagé ou défectueux</li>
                            <li>L'emballage est abîmé</li>
                        </ul>

                        <h3 className="text-xl font-semibold text-gray-800 mb-3">Après livraison</h3>
                        <p className="text-gray-700 mb-4">
                            Vous disposez de <strong>7 jours</strong> à compter de la réception pour nous contacter si :
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
                            <li>Le produit est défectueux</li>
                            <li>Le produit ne correspond pas à la description</li>
                            <li>Vous avez changé d'avis (produit non porté, avec étiquettes)</li>
                        </ul>

                        <div className="bg-purple-50 p-4 rounded-xl border-l-4 border-purple-500 mt-4">
                            <p className="text-sm text-gray-700">
                                <strong>Contact :</strong> Pour tout retour, contactez-nous via WhatsApp au +213 551 22 33 44 ou par email à contact@achrilik.com
                            </p>
                        </div>
                    </section>

                    {/* Section 8 - Garantie */}
                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                            <span className="mr-3">8.</span>
                            Garantie
                        </h2>
                        <p className="text-gray-700 mb-4">
                            Tous nos produits bénéficient de la garantie légale de conformité :
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                            <li>Le produit doit être conforme à la description</li>
                            <li>Le produit doit être exempt de défauts de fabrication</li>
                            <li>En cas de défaut, vous pouvez demander un échange ou un remboursement</li>
                        </ul>
                    </section>

                    {/* Section 9 - Responsabilité */}
                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                            <span className="mr-3">9.</span>
                            Responsabilité
                        </h2>
                        <p className="text-gray-700">
                            Achrilik s'engage à fournir des produits de qualité et à assurer une livraison dans les meilleurs délais. Toutefois, nous ne pouvons être tenus responsables en cas de :
                        </p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mt-4">
                            <li>Retard de livraison dû à des circonstances exceptionnelles (intempéries, grèves, etc.)</li>
                            <li>Informations de livraison incorrectes fournies par le client</li>
                            <li>Impossibilité de joindre le client au moment de la livraison</li>
                        </ul>
                    </section>

                    {/* Section 10 - Litiges */}
                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                            <span className="mr-3">10.</span>
                            Litiges et juridiction
                        </h2>
                        <p className="text-gray-700">
                            Les présentes CGV sont soumises au droit algérien. En cas de litige, une solution amiable sera recherchée en priorité. À défaut, les tribunaux algériens seront seuls compétents.
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
