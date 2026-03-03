'use client';

import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';

export default function NotFound() {
    const { tr } = useTranslation();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md w-full">
                <div className="text-6xl mb-6">👻</div>
                <h2 className="text-3xl font-black text-gray-900 mb-4">{tr('not_found_title')}</h2>
                <p className="text-gray-600 mb-8">
                    {tr('not_found_sub')}
                </p>
                <Link href="/" className="btn btn-primary w-full block py-3">
                    {tr('not_found_back')}
                </Link>
            </div>
        </div>
    );
}
