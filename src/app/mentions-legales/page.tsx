'use client';

import { useTranslation } from '@/hooks/useTranslation';

export default function MentionsLegalesPage() {
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
                    {tr('legal_title')}
                </h1>

                <p className="text-gray-600 mb-8">
                    {tr('legal_updated')} : {currentDate}
                </p>

                <div className="prose prose-lg max-w-none">
                    {/* Section 1 */}
                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                            <span className="mr-3">1.</span>
                            {tr('legal_editor_title')}
                        </h2>
                        <div className="bg-purple-50 p-6 rounded-lg space-y-2">
                            <p className="text-gray-700"><strong>{tr('legal_site_name')} :</strong> Achrilik</p>
                            <p className="text-gray-700"><strong>URL :</strong> <a href="https://achrilik.com" className="text-purple-600 hover:underline">https://achrilik.com</a></p>
                            <p className="text-gray-700"><strong>Email :</strong> <a href="mailto:contact@achrilik.com" className="text-purple-600 hover:underline">contact@achrilik.com</a></p>
                            <p className="text-gray-700"><strong>{tr('legal_phone')} :</strong> +213 551 22 33 44</p>
                            <p className="text-gray-700"><strong>{tr('legal_hq')} :</strong> Oran, Algérie</p>
                        </div>
                    </section>

                    {/* Section 2 */}
                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                            <span className="mr-3">2.</span>
                            {tr('legal_director_title')}
                        </h2>
                        <p className="text-gray-700">{tr('legal_director_text')}</p>
                    </section>

                    {/* Section 3 */}
                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                            <span className="mr-3">3.</span>
                            {tr('legal_hosting_title')}
                        </h2>
                        <div className="bg-gray-50 p-6 rounded-lg space-y-2">
                            <p className="text-gray-700"><strong>{tr('legal_host')} :</strong> Vercel Inc.</p>
                            <p className="text-gray-700"><strong>{tr('legal_address')} :</strong> 340 S Lemon Ave #4133, Walnut, CA 91789, USA</p>
                            <p className="text-gray-700"><strong>{tr('legal_website')} :</strong> <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">vercel.com</a></p>
                        </div>
                    </section>

                    {/* Section 4 - LOI 18-07 */}
                    <section className="mb-8 border-l-4 border-purple-500 pl-6 bg-purple-50 p-6 rounded-r-lg">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                            <span className="mr-3">4.</span>
                            {tr('legal_data_title')}
                        </h2>
                        <p className="text-gray-700 mb-4">{tr('legal_data_intro')}</p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                            <li>{tr('legal_data_li1')}</li>
                            <li>{tr('legal_data_li2')}</li>
                            <li>{tr('legal_data_li3')}</li>
                            <li>{tr('legal_data_li4')}</li>
                        </ul>
                        <p className="text-gray-700 mt-4">
                            {tr('legal_data_more')} <a href="/politique-confidentialite" className="text-purple-600 hover:underline font-semibold">{tr('legal_privacy_link')}</a>.
                        </p>
                    </section>

                    {/* Section 5 */}
                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                            <span className="mr-3">5.</span>
                            {tr('legal_cookies_title')}
                        </h2>
                        <p className="text-gray-700 mb-4">{tr('legal_cookies_text1')}</p>
                        <p className="text-gray-700">{tr('legal_cookies_text2')}</p>
                    </section>

                    {/* Section 6 */}
                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                            <span className="mr-3">6.</span>
                            {tr('legal_ip_title')}
                        </h2>
                        <p className="text-gray-700 mb-4">{tr('legal_ip_text1')}</p>
                        <p className="text-gray-700">{tr('legal_ip_text2')}</p>
                    </section>

                    {/* Section 7 */}
                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                            <span className="mr-3">7.</span>
                            {tr('legal_liability_title')}
                        </h2>
                        <p className="text-gray-700 mb-4">{tr('legal_liability_intro')}</p>
                        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                            <li>{tr('legal_liability_li1')}</li>
                            <li>{tr('legal_liability_li2')}</li>
                            <li>{tr('legal_liability_li3')}</li>
                        </ul>
                    </section>

                    {/* Section 8 */}
                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                            <span className="mr-3">8.</span>
                            {tr('legal_jurisdiction_title')}
                        </h2>
                        <p className="text-gray-700">{tr('legal_jurisdiction_text')}</p>
                    </section>

                    {/* Section 9 */}
                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                            <span className="mr-3">9.</span>
                            {tr('legal_contact_title')}
                        </h2>
                        <p className="text-gray-700 mb-4">{tr('legal_contact_text')}</p>
                        <div className="bg-purple-50 p-6 rounded-lg space-y-2">
                            <p className="text-gray-700">📧 <strong>Email :</strong> <a href="mailto:contact@achrilik.com" className="text-purple-600 hover:underline">contact@achrilik.com</a></p>
                            <p className="text-gray-700">📱 <strong>WhatsApp :</strong> +213 551 22 33 44</p>
                            <p className="text-gray-700">🕐 <strong>{tr('legal_hours')} :</strong> {tr('legal_hours_value')}</p>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
