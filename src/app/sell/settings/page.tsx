'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Truck, Save, Settings as SettingsIcon } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

export default function SellerSettingsPage() {
    const router = useRouter();
    const { tr } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [offersFreeDelivery, setOffersFreeDelivery] = useState(false);
    const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState<number>(8000);

    useEffect(() => {
        async function loadSettings() {
            try {
                const res = await fetch('/api/seller/delivery-settings');
                if (res.ok) {
                    const data = await res.json();
                    setOffersFreeDelivery(data.offersFreeDelivery || false);
                    setFreeDeliveryThreshold(data.freeDeliveryThreshold || 8000);
                }
            } catch (error) {
                console.error('Failed to load settings:', error);
            } finally {
                setLoading(false);
            }
        }
        loadSettings();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);
        try {
            const res = await fetch('/api/seller/delivery-settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ offersFreeDelivery, freeDeliveryThreshold: offersFreeDelivery ? freeDeliveryThreshold : null }),
            });
            if (res.ok) {
                setMessage({ type: 'success', text: tr('settings_saved') });
                setTimeout(() => setMessage(null), 3000);
            } else {
                const error = await res.json();
                setMessage({ type: 'error', text: error.error || tr('settings_save_error') });
            }
        } catch (error) {
            setMessage({ type: 'error', text: tr('settings_conn_error') });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="mb-6">
                    <button onClick={() => router.push('/sell')} className="text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-2">
                        {tr('settings_back')}
                    </button>
                    <div className="flex items-center gap-3">
                        <SettingsIcon className="h-8 w-8 text-gray-700" />
                        <h1 className="text-3xl font-bold text-gray-900">{tr('settings_title')}</h1>
                    </div>
                    <p className="text-gray-600 mt-2">{tr('settings_subtitle')}</p>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-start gap-3 mb-6">
                        <Truck className="h-6 w-6 text-green-500 mt-1" />
                        <div className="flex-1">
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">{tr('settings_free_delivery_title')}</h2>
                            <p className="text-gray-600 text-sm">{tr('settings_free_delivery_desc')}</p>
                        </div>
                    </div>

                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" checked={offersFreeDelivery} onChange={(e) => setOffersFreeDelivery(e.target.checked)}
                                className="w-5 h-5 text-green-500 rounded focus:ring-green-500" />
                            <span className="text-base font-medium text-gray-900">{tr('settings_enable')}</span>
                        </label>
                    </div>

                    {offersFreeDelivery && (
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">{tr('settings_threshold')}</label>
                            <div className="relative">
                                <input type="number" min="1000" max="50000" step="500" value={freeDeliveryThreshold}
                                    onChange={(e) => setFreeDeliveryThreshold(parseInt(e.target.value) || 0)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">DA</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">{tr('settings_threshold_hint')}</p>
                        </div>
                    )}

                    {offersFreeDelivery && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                            <h3 className="text-sm font-semibold text-blue-900 mb-2">{tr('settings_how_title')}</h3>
                            <ul className="text-sm text-blue-800 space-y-1">
                                <li>{tr('settings_how_li1')}</li>
                                <li>{tr('settings_how_li2')}</li>
                                <li>{tr('settings_how_li3')}</li>
                                <li>{tr('settings_how_li4')}</li>
                            </ul>
                        </div>
                    )}

                    {offersFreeDelivery && (
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-500 rounded-lg p-4 mb-6">
                            <div className="flex items-start gap-3">
                                <Truck className="h-6 w-6 text-green-600 mt-1" />
                                <div>
                                    <h3 className="font-bold text-green-900">{tr('settings_preview_title')}</h3>
                                    <p className="text-sm text-green-800">
                                        {tr('settings_preview_sub').replace('{amount}', freeDeliveryThreshold.toLocaleString())}
                                    </p>
                                    <p className="text-xs text-green-700 mt-1">{tr('settings_preview_hint')}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {message && (
                        <div className={`p-4 rounded-lg mb-4 ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                            {message.text}
                        </div>
                    )}

                    <button onClick={handleSave}
                        disabled={saving || (offersFreeDelivery && (freeDeliveryThreshold < 1000 || freeDeliveryThreshold > 50000))}
                        className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors">
                        {saving ? (
                            <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>{tr('settings_saving')}</>
                        ) : (
                            <><Save className="h-5 w-5" />{tr('settings_save')}</>
                        )}
                    </button>
                </div>

                <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="font-semibold text-gray-900 mb-3">{tr('settings_tips_title')}</h3>
                    <ul className="text-sm text-gray-700 space-y-2">
                        <li>• <strong>{tr('settings_tip1_label')}</strong> {tr('settings_tip1')}</li>
                        <li>• <strong>{tr('settings_tip2_label')}</strong> {tr('settings_tip2')}</li>
                        <li>• <strong>{tr('settings_tip3_label')}</strong> {tr('settings_tip3')}</li>
                        <li>• <strong>{tr('settings_tip4_label')}</strong> {tr('settings_tip4')}</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
