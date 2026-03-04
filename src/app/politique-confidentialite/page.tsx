'use client';

import { useTranslation } from '@/hooks/useTranslation';

export default function PolitiqueConfidentialite() {
    const { tr } = useTranslation();
    const currentDate = new Date().toLocaleDateString('fr-DZ', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 py-12 px-4">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 md:p-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    {tr('privacy_title')}
                </h1>

                <p className="text-gray-600 mb-8">
                    {tr('legal_updated')} : {currentDate}
                </p>

                <div className="prose prose-lg max-w-none">
                    {/* Section 1 */}
                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                            <span className="mr-3">1.</span>
                            {tr('privacy_collected_title')}
                        </h2>
                        <p className="text-gray-700 mb-4">{tr('privacy_collected_intro')}</p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                            <li>{tr('privacy_data_name')}</li>
                            <li>{tr('privacy_data_phone')}</li>
                            <li>{tr('privacy_data_address')}</li>
                            <li>{tr('privacy_data_city')}</li>
                            <li>{tr('privacy_data_gps')}</li>
                        </ul>
                    </section>

                    {/* Section 2 */}
                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                            <span className="mr-3">2.</span>
                            {tr('privacy_use_title')}
                        </h2>
                        <p className="text-gray-700 mb-4">{tr('privacy_use_intro')}</p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                            <li>{tr('privacy_use_li1')}</li>
                            <li>{tr('privacy_use_li2')}</li>
                            <li>{tr('privacy_use_li3')}</li>
                            <li>{tr('privacy_use_li4')}</li>
                        </ul>
                    </section>

                    {/* Section 3 */}
                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                            <span className="mr-3">3.</span>
                            {tr('privacy_retention_title')}
                        </h2>
                        <p className="text-gray-700">{tr('privacy_retention_intro')}</p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mt-4">
                            <li>{tr('privacy_retention_li1')}</li>
                            <li>{tr('privacy_retention_li2')}</li>
                        </ul>
                    </section>

                    {/* Section 4 - LOI 18-07 */}
                    <section className="mb-8 border-l-4 border-purple-500 pl-6 bg-purple-50 p-6 rounded-r-lg">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                            <span className="mr-3">4.</span>
                            {tr('privacy_rights_title')}
                        </h2>
                        <p className="text-gray-700 mb-4">{tr('privacy_rights_intro')}</p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                            <li><strong>{tr('privacy_right_access')}</strong> : {tr('privacy_right_access_desc')}</li>
                            <li><strong>{tr('privacy_right_rectify')}</strong> : {tr('privacy_right_rectify_desc')}</li>
                            <li><strong>{tr('privacy_right_delete')}</strong> : {tr('privacy_right_delete_desc')}</li>
                            <li><strong>{tr('privacy_right_oppose')}</strong> : {tr('privacy_right_oppose_desc')}</li>
                        </ul>

                        <div className="mt-6 bg-white p-4 rounded-lg">
                            <p className="font-semibold text-gray-900 mb-2">{tr('privacy_exercise_rights')}</p>
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
                            {tr('privacy_security_title')}
                        </h2>
                        <p className="text-gray-700 mb-4">{tr('privacy_security_intro')}</p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                            <li><strong>{tr('privacy_sec_https')}</strong> {tr('privacy_sec_https_desc')}</li>
                            <li><strong>{tr('privacy_sec_access')}</strong> {tr('privacy_sec_access_desc')}</li>
                            <li><strong>{tr('privacy_sec_no_share')}</strong> {tr('privacy_sec_no_share_desc')}</li>
                            <li><strong>{tr('privacy_sec_storage')}</strong> {tr('privacy_sec_storage_desc')}</li>
                        </ul>
                    </section>

                    {/* Section 6 */}
                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                            <span className="mr-3">6.</span>
                            {tr('legal_cookies_title')}
                        </h2>
                        <p className="text-gray-700 mb-4">{tr('privacy_cookies_intro')}</p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                            <li><strong>{tr('privacy_functional_cookies')}</strong> : {tr('privacy_functional_cookies_desc')}</li>
                        </ul>
                        <p className="text-gray-700 mt-4">{tr('legal_cookies_text2')}</p>
                    </section>

                    {/* Section 7 */}
                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                            <span className="mr-3">7.</span>
                            {tr('privacy_changes_title')}
                        </h2>
                        <p className="text-gray-700">{tr('privacy_changes_text')}</p>
                    </section>

                    {/* Footer */}
                    <div className="mt-12 pt-8 border-t border-gray-200">
                        <div className="text-center space-y-2">
                            <p className="text-lg font-semibold text-gray-900">Achrilik</p>
                            <p className="text-gray-600">{tr('privacy_footer_tagline')}</p>
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
