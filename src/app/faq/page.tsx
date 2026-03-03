'use client';

import Link from 'next/link';
import { Package, Truck, CreditCard, HelpCircle, Phone } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

export default function FAQPage() {
    const { tr } = useTranslation();

    const faqData = {
        orders: {
            icon: <Package className="w-6 h-6" />,
            color: 'text-purple-600',
            btnColor: 'bg-purple-500 hover:bg-purple-600',
            arrowColor: 'text-purple-500',
            items: [
                {
                    q: tr('faq_q_how_order'),
                    a: tr('faq_a_how_order'),
                },
                {
                    q: tr('faq_q_modify_order'),
                    a: tr('faq_a_modify_order'),
                },
                {
                    q: tr('faq_q_cancel_order'),
                    a: tr('faq_a_cancel_order'),
                },
                {
                    q: tr('faq_q_order_confirm'),
                    a: tr('faq_a_order_confirm'),
                },
            ],
        },
        delivery: {
            icon: <Truck className="w-6 h-6" />,
            color: 'text-pink-600',
            btnColor: 'bg-pink-500 hover:bg-pink-600',
            arrowColor: 'text-pink-500',
            items: [
                { q: tr('faq_q_delivery_time'), a: tr('faq_a_delivery_time') },
                { q: tr('faq_q_delivery_zones'), a: tr('faq_a_delivery_zones') },
                { q: tr('faq_q_delivery_fees'), a: tr('faq_a_delivery_fees') },
                { q: tr('faq_q_track_order'), a: tr('faq_a_track_order') },
                { q: tr('faq_q_not_available'), a: tr('faq_a_not_available') },
            ],
        },
        payment: {
            icon: <CreditCard className="w-6 h-6" />,
            color: 'text-purple-600',
            btnColor: 'bg-purple-600 hover:bg-purple-700',
            arrowColor: 'text-purple-500',
            items: [
                { q: tr('faq_q_payment_methods'), a: tr('faq_a_payment_methods') },
                { q: tr('faq_q_inspect_package'), a: tr('faq_a_inspect_package') },
                { q: tr('faq_q_pay_online'), a: tr('faq_a_pay_online') },
            ],
        },
        account: {
            icon: <HelpCircle className="w-6 h-6" />,
            color: 'text-purple-600',
            arrowColor: 'text-purple-500',
            items: [
                { q: tr('faq_q_need_account'), a: tr('faq_a_need_account') },
                { q: tr('faq_q_reset_password'), a: tr('faq_a_reset_password') },
                { q: tr('faq_q_contact_support'), a: tr('faq_a_contact_support') },
            ],
        },
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 py-12 px-4">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        {tr('faq_title')}
                    </h1>
                    <p className="text-xl text-gray-600">
                        {tr('faq_subtitle')}
                    </p>
                </div>

                <div className="space-y-4">
                    {/* Orders */}
                    <div className="bg-white p-6 rounded-2xl shadow-md">
                        <h2 className={`text-2xl font-bold ${faqData.orders.color} mb-6 flex items-center gap-2`}>
                            {faqData.orders.icon} {tr('faq_orders')}
                        </h2>
                        <div className="space-y-4">
                            {faqData.orders.items.map((item, i) => (
                                <div key={i}>
                                    {i > 0 && <hr className="border-gray-200 mb-4" />}
                                    <details className="group cursor-pointer">
                                        <summary className="font-semibold text-gray-900 text-lg list-none flex justify-between items-center">
                                            <span>{item.q}</span>
                                            <span className={`${faqData.orders.arrowColor} group-open:rotate-180 transition-transform`}>▼</span>
                                        </summary>
                                        <p className="text-gray-600 mt-3 leading-relaxed pl-4 whitespace-pre-line">{item.a}</p>
                                    </details>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Delivery */}
                    <div className="bg-white p-6 rounded-2xl shadow-md">
                        <h2 className={`text-2xl font-bold ${faqData.delivery.color} mb-6 flex items-center gap-2`}>
                            {faqData.delivery.icon} {tr('faq_delivery')}
                        </h2>
                        <div className="space-y-4">
                            {faqData.delivery.items.map((item, i) => (
                                <div key={i}>
                                    {i > 0 && <hr className="border-gray-200 mb-4" />}
                                    <details className="group cursor-pointer">
                                        <summary className="font-semibold text-gray-900 text-lg list-none flex justify-between items-center">
                                            <span>{item.q}</span>
                                            <span className={`${faqData.delivery.arrowColor} group-open:rotate-180 transition-transform`}>▼</span>
                                        </summary>
                                        <p className="text-gray-600 mt-3 leading-relaxed pl-4">{item.a}</p>
                                    </details>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Payment */}
                    <div className="bg-white p-6 rounded-2xl shadow-md">
                        <h2 className={`text-2xl font-bold ${faqData.payment.color} mb-6 flex items-center gap-2`}>
                            {faqData.payment.icon} {tr('faq_payment')}
                        </h2>
                        <div className="space-y-4">
                            {faqData.payment.items.map((item, i) => (
                                <div key={i}>
                                    {i > 0 && <hr className="border-gray-200 mb-4" />}
                                    <details className="group cursor-pointer">
                                        <summary className="font-semibold text-gray-900 text-lg list-none flex justify-between items-center">
                                            <span>{item.q}</span>
                                            <span className={`${faqData.payment.arrowColor} group-open:rotate-180 transition-transform`}>▼</span>
                                        </summary>
                                        <p className="text-gray-600 mt-3 leading-relaxed pl-4">{item.a}</p>
                                    </details>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Account */}
                    <div className="bg-white p-6 rounded-2xl shadow-md">
                        <h2 className={`text-2xl font-bold ${faqData.account.color} mb-6 flex items-center gap-2`}>
                            {faqData.account.icon} {tr('faq_account')}
                        </h2>
                        <div className="space-y-4">
                            {faqData.account.items.map((item, i) => (
                                <div key={i}>
                                    {i > 0 && <hr className="border-gray-200 mb-4" />}
                                    <details className="group cursor-pointer">
                                        <summary className="font-semibold text-gray-900 text-lg list-none flex justify-between items-center">
                                            <span>{item.q}</span>
                                            <span className={`${faqData.account.arrowColor} group-open:rotate-180 transition-transform`}>▼</span>
                                        </summary>
                                        <p className="text-gray-600 mt-3 leading-relaxed pl-4">{item.a}</p>
                                    </details>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* CTA */}
                <div className="mt-12 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-8 rounded-2xl shadow-xl text-center">
                    <h3 className="text-2xl font-bold mb-4">{tr('faq_cta_title')}</h3>
                    <p className="text-lg mb-6 text-purple-100">{tr('faq_cta_sub')}</p>
                    <Link
                        href="/contact"
                        className="inline-flex items-center gap-2 bg-white text-purple-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-purple-50 transition-all shadow-lg"
                    >
                        <Phone className="w-5 h-5" />
                        {tr('contact_title')}
                    </Link>
                </div>
            </div>
        </div>
    );
}
