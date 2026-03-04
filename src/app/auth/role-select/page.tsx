"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';

type UserRole = 'CLIENT' | 'SELLER' | 'DELIVERY';

export default function RoleSelectionPage() {
    const router = useRouter();
    const { tr } = useTranslation();

    const ROLE_CONFIG = {
        CLIENT: {
            icon: '👤',
            title: 'CLIENT',
            description: tr('role_client_desc'),
            color: 'blue',
            redirectAfterLogin: '/shop'
        },
        SELLER: {
            icon: '🏪',
            title: tr('sell_become_seller').toUpperCase(),
            description: tr('role_seller_desc'),
            color: 'green',
            redirectAfterLogin: '/seller/dashboard'
        },
        DELIVERY: {
            icon: '🚚',
            title: 'LIVREUR',
            description: tr('role_delivery_desc'),
            color: 'orange',
            redirectAfterLogin: '/delivery/dashboard'
        }
    };

    const handleRoleSelect = (role: UserRole) => {
        // Store selected role in sessionStorage for the login page
        sessionStorage.setItem('selectedRole', role);
        router.push(`/login?role=${role.toLowerCase()}`);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Achrilik</h1>
                    <p className="text-gray-600">{tr('role_connect_title')}</p>
                </div>

                {/* Role Selection Card */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
                        <h2 className="text-xl font-semibold text-white text-center">
                            {tr('role_connect_as')}
                        </h2>
                    </div>

                    <div className="p-6 space-y-4">
                        {/* Client Option */}
                        <button
                            onClick={() => handleRoleSelect('CLIENT')}
                            className="w-full group relative overflow-hidden bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border-2 border-blue-200 hover:border-blue-400 rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
                        >
                            <div className="flex items-center gap-4">
                                <div className="text-5xl group-hover:scale-110 transition-transform">
                                    {ROLE_CONFIG.CLIENT.icon}
                                </div>
                                <div className="text-left flex-1">
                                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                                        {ROLE_CONFIG.CLIENT.title}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        {ROLE_CONFIG.CLIENT.description}
                                    </p>
                                </div>
                                <div className="text-blue-600 text-2xl group-hover:translate-x-1 transition-transform">
                                    →
                                </div>
                            </div>
                        </button>

                        {/* Seller Option */}
                        <button
                            onClick={() => handleRoleSelect('SELLER')}
                            className="w-full group relative overflow-hidden bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 border-2 border-green-200 hover:border-green-400 rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
                        >
                            <div className="flex items-center gap-4">
                                <div className="text-5xl group-hover:scale-110 transition-transform">
                                    {ROLE_CONFIG.SELLER.icon}
                                </div>
                                <div className="text-left flex-1">
                                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                                        {ROLE_CONFIG.SELLER.title}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        {ROLE_CONFIG.SELLER.description}
                                    </p>
                                </div>
                                <div className="text-green-600 text-2xl group-hover:translate-x-1 transition-transform">
                                    →
                                </div>
                            </div>
                        </button>

                        {/* Delivery Option */}
                        <button
                            onClick={() => handleRoleSelect('DELIVERY')}
                            className="w-full group relative overflow-hidden bg-gradient-to-r from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 border-2 border-orange-200 hover:border-orange-400 rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
                        >
                            <div className="flex items-center gap-4">
                                <div className="text-5xl group-hover:scale-110 transition-transform">
                                    {ROLE_CONFIG.DELIVERY.icon}
                                </div>
                                <div className="text-left flex-1">
                                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                                        {ROLE_CONFIG.DELIVERY.title}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        {ROLE_CONFIG.DELIVERY.description}
                                    </p>
                                </div>
                                <div className="text-orange-600 text-2xl group-hover:translate-x-1 transition-transform">
                                    →
                                </div>
                            </div>
                        </button>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                        <p className="text-center text-sm text-gray-600">
                            {tr('role_no_account')}{' '}
                            <Link href="/register" className="text-indigo-600 hover:text-indigo-700 font-medium">
                                {tr('nav_register')}
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Back to Home */}
                <div className="text-center mt-6">
                    <Link
                        href="/"
                        className="text-gray-600 hover:text-gray-900 text-sm font-medium inline-flex items-center gap-2"
                    >
                        ← {tr('not_found_home')}
                    </Link>
                </div>
            </div>
        </div>
    );
}
