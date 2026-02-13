'use client';

import { Truck, CreditCard, ShieldCheck, Phone, Mail, HelpCircle, Facebook, Instagram } from 'lucide-react';
import Link from 'next/link';

// TikTok custom icon (lucide-react doesn't have TikTok, so we create a simple SVG)
const TikTokIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
    </svg>
);

export default function Footer() {
    return (
        <footer className="bg-gray-50 pt-8 pb-24 border-t border-gray-100 mt-8">
            <div className="container mx-auto px-4">

                {/* Reassurance Section (Moved from Top) */}
                <div className="grid grid-cols-1 gap-4 mb-8">
                    <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 text-blue-600">
                            <Truck className="h-5 w-5" strokeWidth={1.5} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 text-sm">Livraison Rapide</h3>
                            <p className="text-gray-500 text-xs">Oran et ses environs</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                        <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0 text-green-600">
                            <CreditCard className="h-5 w-5" strokeWidth={1.5} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 text-sm">Paiement Cash</h3>
                            <p className="text-gray-500 text-xs">À la livraison (Main à main)</p>
                        </div>
                    </div>
                </div>

                <hr className="border-gray-200 mb-8" />

                {/* Links Section */}
                <div className="grid grid-cols-2 gap-8 mb-8">
                    <div>
                        <h4 className="font-bold text-gray-900 mb-4">Aide & Info</h4>
                        <ul className="space-y-3">
                            <li>
                                <Link href="/how-it-works" className="text-sm text-gray-600 hover:text-rose-600 flex items-center gap-2">
                                    <HelpCircle className="h-4 w-4" />
                                    Comment ça marche
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="text-sm text-gray-600 hover:text-rose-600 flex items-center gap-2">
                                    <Mail className="h-4 w-4" />
                                    Contactez-nous
                                </Link>
                            </li>
                            <li>
                                <Link href="tel:+213123456789" className="text-sm text-gray-600 hover:text-rose-600 flex items-center gap-2">
                                    <Phone className="h-4 w-4" />
                                    Service Client
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-gray-900 mb-4">Suivez-nous</h4>
                        <div className="flex gap-4">
                            <a href="#" className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-blue-600 border border-gray-100 hover:bg-blue-50 transition-colors">
                                <Facebook className="h-5 w-5" />
                            </a>
                            <a href="#" className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-pink-600 border border-gray-100 hover:bg-pink-50 transition-colors">
                                <Instagram className="h-5 w-5" />
                            </a>
                            <a href="https://www.tiktok.com/@achrilik" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-gray-900 border border-gray-100 hover:bg-gray-50 transition-colors">
                                <TikTokIcon className="h-5 w-5" />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Copyright */}
                <div className="text-center pt-8 border-t border-gray-200">
                    <p className="text-xs text-gray-400">
                        © 2026 Achrilik. Tous droits réservés.
                    </p>
                    <p className="text-[10px] text-gray-300 mt-1">
                        Fait avec ❤️ à Oran
                    </p>
                </div>
            </div>
        </footer>
    );
}
