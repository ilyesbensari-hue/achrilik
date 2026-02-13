import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900 text-white mt-16">
            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Contact */}
                    <div>
                        <h3 className="text-lg font-bold mb-4 flex items-center">
                            📞 Contact
                        </h3>
                        <div className="space-y-3 text-sm">
                            <a
                                href="https://wa.me/213551223344"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center hover:text-pink-300 transition-colors"
                            >
                                📱 WhatsApp: +213 551 22 33 44
                            </a>
                            <a
                                href="mailto:contact@achrilik.com"
                                className="flex items-center hover:text-pink-300 transition-colors"
                            >
                                📧 contact@achrilik.com
                            </a>
                            <p className="flex items-center">
                                🕒 Horaires: 9h-18h, 7j/7
                            </p>
                            <p className="flex items-center">
                                📍 Oran, Algérie 🇩🇿
                            </p>
                        </div>
                    </div>

                    {/* Informations */}
                    <div>
                        <h3 className="text-lg font-bold mb-4 flex items-center">
                            ℹ️ Informations
                        </h3>
                        <div className="space-y-3 text-sm">
                            <Link href="/comment-ca-marche" className="block hover:text-pink-300 transition-colors">
                                Comment ça marche
                            </Link>
                            <Link href="/politique-confidentialite" className="block hover:text-pink-300 transition-colors">
                                Politique de confidentialité
                            </Link>
                            <Link href="/contact" className="block hover:text-pink-300 transition-colors">
                                Contact
                            </Link>
                            <Link href="/faq" className="block hover:text-pink-300 transition-colors">
                                FAQ
                            </Link>
                        </div>
                    </div>

                    {/* Réseaux Sociaux */}
                    <div>
                        <h3 className="text-lg font-bold mb-4 flex items-center">
                            🌐 Suivez-nous
                        </h3>
                        <div className="space-y-3 text-sm">
                            <a
                                href="https://instagram.com/achrilik"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center hover:text-pink-300 transition-colors"
                            >
                                📷 Instagram
                            </a>
                            <a
                                href="https://facebook.com/achrilik"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center hover:text-pink-300 transition-colors"
                            >
                                📘 Facebook
                            </a>
                            <a
                                href="https://tiktok.com/@achrilik"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center hover:text-pink-300 transition-colors"
                            >
                                🎵 TikTok
                            </a>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-12 pt-8 border-t border-purple-700 text-center text-sm">
                    <p className="mb-2">
                        © {new Date().getFullYear()} <strong>Achrilik</strong> - Shopping Mode en Ligne
                    </p>
                    <p className="text-purple-300">
                        Tous droits réservés | Conformité loi 18-07
                    </p>
                </div>
            </div>
        </footer>
    );
}
