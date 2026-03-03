'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';

export default function ContactPage() {
    const { tr } = useTranslation();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        setErrorMessage('');

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (!response.ok) throw new Error('Error');
            setStatus('success');
            setFormData({ name: '', email: '', subject: '', message: '' });
        } catch (error) {
            setStatus('error');
            setErrorMessage(tr('error_generic'));
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-rose-500 to-pink-600 text-white py-16">
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-black mb-4">{tr('contact_title')}</h1>
                    <p className="text-xl md:text-2xl font-light opacity-95">
                        {tr('contact_subtitle')} 💬
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-12">
                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Contact Info */}
                    <div className="space-y-6">
                        <h2 className="text-3xl font-black text-gray-900 mb-6">{tr('contact_info_title')}</h2>

                        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center flex-shrink-0">
                                    <Mail className="h-6 w-6 text-rose-500" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-1">{tr('contact_email_label')}</h3>
                                    <a href="mailto:achrilik@gmail.com" className="text-rose-600 hover:text-rose-700 font-medium">
                                        achrilik@gmail.com
                                    </a>
                                    <p className="text-sm text-gray-500 mt-1">{tr('contact_response_time')}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                                    <Phone className="h-6 w-6 text-blue-500" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-1">{tr('contact_phone_label')}</h3>
                                    <a href="tel:+213123456789" className="text-blue-600 hover:text-blue-700 font-medium">
                                        +213 (0)5 XX XX XX XX
                                    </a>
                                    <p className="text-sm text-gray-500 mt-1">{tr('contact_hours')}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center flex-shrink-0">
                                    <MapPin className="h-6 w-6 text-green-500" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-1">{tr('contact_address_label')}</h3>
                                    <p className="text-gray-700 font-medium">Oran, {tr('faq_a_delivery_zones').split('Oran')[0].length > 0 ? 'Algérie' : 'الجزائر'}</p>
                                    <p className="text-sm text-gray-500 mt-1">{tr('contact_delivery_zone')}</p>
                                </div>
                            </div>
                        </div>

                        {/* FAQ Link */}
                        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-2xl border border-indigo-100">
                            <h3 className="font-bold text-gray-900 mb-2">{tr('faq_title')} ?</h3>
                            <p className="text-gray-600 text-sm mb-4">{tr('contact_faq_hint')}</p>
                            <Link href="/how-it-works" className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-semibold text-sm">
                                {tr('contact_help_link')} →
                            </Link>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 mb-6">{tr('contact_form_title')}</h2>

                        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 space-y-6">

                            {status === 'success' && (
                                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
                                    <p className="text-green-700 font-semibold">✅ {tr('contact_success')}</p>
                                </div>
                            )}

                            {status === 'error' && (
                                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                                    <p className="text-red-700 font-semibold">
                                        ❌ {errorMessage}
                                    </p>
                                </div>
                            )}

                            <div>
                                <label htmlFor="name" className="block text-sm font-bold text-gray-700 mb-2">
                                    {tr('checkout_fullname')} <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text" id="name" required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                                    placeholder={tr('checkout_fullname')}
                                />
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2">
                                    {tr('login_email')} <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="email" id="email" required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                                    placeholder="votre.email@exemple.com"
                                />
                            </div>

                            <div>
                                <label htmlFor="subject" className="block text-sm font-bold text-gray-700 mb-2">
                                    {tr('contact_subject')} <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text" id="subject" required
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                                    placeholder={tr('contact_subject_placeholder')}
                                />
                            </div>

                            <div>
                                <label htmlFor="message" className="block text-sm font-bold text-gray-700 mb-2">
                                    {tr('contact_message')} <span className="text-rose-500">*</span>
                                </label>
                                <textarea
                                    id="message" required rows={6}
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all resize-none"
                                    placeholder={tr('contact_message_placeholder')}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={status === 'loading'}
                                className="w-full bg-gradient-to-r from-rose-500 to-pink-600 text-white py-4 px-6 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {status === 'loading' ? (
                                    <>
                                        <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                                        {tr('loading')}
                                    </>
                                ) : (
                                    <>
                                        <Send className="h-5 w-5" />
                                        {tr('contact_send')}
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                </div>
            </div>
        </div>
    );
}
