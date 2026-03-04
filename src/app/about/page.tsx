'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, Users, Package, TrendingUp, Heart, Shield } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

export default function AboutPage() {
    const { tr } = useTranslation();
    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 py-12 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header Section */}
                <div className="text-center mb-16">
                    <h1 className="text-5xl font-bold text-gray-900 mb-4">
                        {tr('about_title')}
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        {tr('about_subtitle')}
                    </p>
                </div>

                {/* Story Section */}
                <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6">{tr('about_story_title')}</h2>
                    <div className="prose prose-lg max-w-none text-gray-700">
                        <p className="mb-4">
                            <strong>Achrilik</strong> (اشري ليك) est née d'une vision simple : rendre la mode accessible à tous les Algériens,
                            où qu'ils se trouvent. Notre nom, qui signifie "achète pour toi" en darija, reflète notre mission de vous
                            permettre de trouver exactement ce que vous cherchez.
                        </p>
                        <p className="mb-4">
                            Basée à <strong>Oran</strong>, nous avons créé une plateforme où vendeurs locaux et acheteurs se rencontrent
                            dans un environnement sûr et pratique. Que vous recherchiez une robe kabyle traditionnelle, des vêtements
                            tendance ou des accessoires uniques, Achrilik vous connecte avec les meilleures boutiques d'Algérie.
                        </p>
                    </div>
                </div>

                {/* Values Grid */}
                <div className="grid md:grid-cols-3 gap-6 mb-12">
                    {/* Value 1 */}
                    <div className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
                        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ShoppingBag className="w-8 h-8 text-purple-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">{tr('about_v1_title')}</h3>
                        <p className="text-gray-600">{tr('about_v1_desc')}</p>
                    </div>

                    {/* Value 2 */}
                    <div className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
                        <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Shield className="w-8 h-8 text-pink-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">{tr('about_v2_title')}</h3>
                        <p className="text-gray-600">{tr('about_v2_desc')}</p>
                    </div>

                    {/* Value 3 */}
                    <div className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
                        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Users className="w-8 h-8 text-purple-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">{tr('about_v3_title')}</h3>
                        <p className="text-gray-600">{tr('about_v3_desc')}</p>
                    </div>
                </div>

                {/* Stats Section */}
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-xl p-8 md:p-12 mb-12">
                    <h2 className="text-3xl font-bold text-white text-center mb-8">{tr('about_stats_title')}</h2>
                    <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        <div>
                            <div className="text-4xl font-bold text-white mb-2">100+</div>
                            <div className="text-purple-100">{tr('about_sellers')}</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-white mb-2">1000+</div>
                            <div className="text-purple-100">{tr('about_products')}</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-white mb-2">24-48h</div>
                            <div className="text-purple-100">{tr('about_delivery')}</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-white mb-2">5000+</div>
                            <div className="text-purple-100">{tr('about_customers')}</div>
                        </div>
                    </div>
                </div>

                {/* Benefits Section */}
                <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8">{tr('about_why_title')}</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Package className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 mb-2">{tr('about_b1_title')}</h3>
                                <p className="text-gray-600">{tr('about_b1_desc')}</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Heart className="w-6 h-6 text-pink-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 mb-2">{tr('about_b2_title')}</h3>
                                <p className="text-gray-600">{tr('about_b2_desc')}</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <TrendingUp className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 mb-2">{tr('about_b3_title')}</h3>
                                <p className="text-gray-600">{tr('about_b3_desc')}</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <ShoppingBag className="w-6 h-6 text-pink-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 mb-2">{tr('about_b4_title')}</h3>
                                <p className="text-gray-600">{tr('about_b4_desc')}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CTA Section */}
                <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">{tr('about_join')}</h2>
                    <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">{tr('about_join_sub')}</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/categories"
                            className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105"
                        >
                            <ShoppingBag className="w-5 h-5 mr-2" />
                            {tr('about_start_shopping')}
                        </Link>
                        <Link
                            href="/sell"
                            className="inline-flex items-center justify-center px-8 py-4 bg-white text-purple-600 font-semibold rounded-xl border-2 border-purple-600 hover:bg-purple-50 transition-all"
                        >
                            <Package className="w-5 h-5 mr-2" />
                            {tr('about_become_seller')}
                        </Link>
                    </div>
                </div>

                {/* Contact Info */}
                <div className="mt-12 text-center space-y-4">
                    <h3 className="text-2xl font-bold text-gray-900">{tr('about_contact_us')}</h3>
                    <div className="flex flex-col sm:flex-row gap-6 justify-center items-center text-gray-700">
                        <a href="mailto:contact@achrilik.com" className="hover:text-purple-600 transition-colors">
                            📧 contact@achrilik.com
                        </a>
                        <span className="hidden sm:inline">|</span>
                        <span>📱 WhatsApp: +213 551 22 33 44</span>
                        <span className="hidden sm:inline">|</span>
                        <span>📍 Oran, Algérie</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
