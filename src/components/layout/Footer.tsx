'use client';

import { Phone, Mail, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';

const TikTokIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
    </svg>
);

export default function Footer() {
    const { tr } = useTranslation();

    return (
        <footer className="bg-[#1A1A1A] pt-8 pb-24 mt-8">
            <div className="container mx-auto px-4">

                {/* Links Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                    <div>
                        <h4 className="font-bold text-white mb-4">{tr('faq_general')} & Info</h4>
                        <ul className="space-y-3">
                            <li>
                                <Link href="/how-it-works" className="text-sm text-gray-400 hover:text-white flex items-center gap-2 transition-colors">
                                    <HelpCircle className="h-4 w-4" />
                                    {tr('footer_how_it_works')}
                                </Link>
                            </li>
                            <li>
                                <Link href="/faq" className="text-sm text-gray-400 hover:text-white transition-colors">
                                    {tr('footer_faq')}
                                </Link>
                            </li>
                            <li>
                                <Link href="/about" className="text-sm text-gray-400 hover:text-white transition-colors">
                                    {tr('footer_about')}
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="text-sm text-gray-400 hover:text-white flex items-center gap-2 transition-colors">
                                    <Mail className="h-4 w-4" />
                                    {tr('footer_contact')}
                                </Link>
                            </li>
                            <li>
                                <a href="tel:+213551223344" className="text-sm text-gray-400 hover:text-white flex items-center gap-2 transition-colors">
                                    <Phone className="h-4 w-4" />
                                    {tr('contact_phone_label')}
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-white mb-4">{tr('legal_title')}</h4>
                        <ul className="space-y-3">
                            <li>
                                <Link href="/cgv" className="text-sm text-gray-400 hover:text-white transition-colors">
                                    {tr('footer_cgv')}
                                </Link>
                            </li>
                            <li>
                                <Link href="/mentions-legales" className="text-sm text-gray-400 hover:text-white transition-colors">
                                    {tr('footer_legal')}
                                </Link>
                            </li>
                            <li>
                                <Link href="/politique-confidentialite" className="text-sm text-gray-400 hover:text-white transition-colors">
                                    {tr('footer_privacy')}
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-white mb-4">{tr('footer_social')}</h4>
                        <div className="flex gap-4">
                            <a href="https://www.tiktok.com/@achrilik" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-[#2A2A2A] rounded-full flex items-center justify-center shadow-sm text-white border border-[#333333] hover:bg-[#333333] transition-colors">
                                <TikTokIcon className="h-5 w-5" />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Copyright */}
                <div className="text-center pt-8 border-t border-[#333333]">
                    <p className="text-xs text-gray-500">
                        {tr('footer_rights')}
                    </p>
                    <p className="text-[10px] text-gray-600 mt-1">
                        Fait avec ❤️ à Oran
                    </p>
                </div>
            </div>
        </footer>
    );
}
