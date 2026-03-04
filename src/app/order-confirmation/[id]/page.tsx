"use client";

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';

export default function OrderConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { tr } = useTranslation();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center space-y-6">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-4xl">🎉</span>
                </div>

                <h1 className="text-2xl font-black text-gray-900">{tr('order_confirmed_title')}</h1>

                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <p className="text-gray-500 text-sm mb-1">{tr('order_number')}</p>
                    <p className="font-mono font-bold text-lg text-indigo-600">#{id.slice(0, 8).toUpperCase()}</p>
                </div>

                <p className="text-gray-600">
                    {tr('order_confirmed_msg')}
                    <br />
                    <span className="font-semibold text-green-600">{tr('order_email_sent')}</span>
                </p>
                <p className="text-sm text-gray-500">
                    {tr('order_track_hint')}
                </p>

                <div className="space-y-3 pt-4">
                    <Link href="/profile" className="btn btn-primary w-full py-3 block">
                        📝 {tr('order_view_orders')}
                    </Link>
                    <Link
                        href="/"
                        className="btn btn-outline w-full py-3 block text-gray-600 border-gray-300 hover:border-gray-400"
                    >
                        ← {tr('order_back_home')}
                    </Link>
                </div>
            </div>
        </div>
    );
}
