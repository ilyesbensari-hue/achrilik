"use client";

import { useEffect, useState } from 'react';

interface EarningsData {
    totalEarnings: number;
    pendingCOD: number;
    paidOut: number;
    thisMonth: number;
    lastMonth: number;
    deliveryCount: number;
}

export default function EarningsPage() {
    const [earnings, setEarnings] = useState<EarningsData>({
        totalEarnings: 0,
        pendingCOD: 0,
        paidOut: 0,
        thisMonth: 0,
        lastMonth: 0,
        deliveryCount: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEarnings();
    }, []);

    const fetchEarnings = async () => {
        try {
            const res = await fetch('/api/delivery/earnings');
            if (res.ok) {
                const data = await res.json();
                setEarnings(data.earnings || earnings);
            }
        } catch (error) {
            console.error('Error fetching earnings:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="text-center py-12">Chargement...</div>;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Mes gains</h1>

            {/* Main Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium opacity-90">Gains totaux</h3>
                        <span className="text-3xl">💰</span>
                    </div>
                    <p className="text-4xl font-bold">{earnings.totalEarnings.toLocaleString()} DA</p>
                    <p className="text-sm opacity-75 mt-2">
                        {earnings.deliveryCount} livraisons effectuées
                    </p>
                </div>

                <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium opacity-90">COD en attente</h3>
                        <span className="text-3xl">⏳</span>
                    </div>
                    <p className="text-4xl font-bold">{earnings.pendingCOD.toLocaleString()} DA</p>
                    <p className="text-sm opacity-75 mt-2">
                        À remettre à l'admin
                    </p>
                </div>

                <div className="bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium opacity-90">Déjà versés</h3>
                        <span className="text-3xl">✅</span>
                    </div>
                    <p className="text-4xl font-bold">{earnings.paidOut.toLocaleString()} DA</p>
                    <p className="text-sm opacity-75 mt-2">
                        Historique des paiements
                    </p>
                </div>
            </div>

            {/* Monthly Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <h3 className="text-sm font-medium text-gray-600 mb-4">Ce mois-ci</h3>
                    <p className="text-3xl font-bold text-gray-900 mb-2">
                        {earnings.thisMonth.toLocaleString()} DA
                    </p>
                    <div className="flex items-center gap-2 text-sm">
                        {earnings.thisMonth > earnings.lastMonth ? (
                            <>
                                <span className="text-green-600">↗️ +{((earnings.thisMonth - earnings.lastMonth) / earnings.lastMonth * 100).toFixed(1)}%</span>
                                <span className="text-gray-500">vs mois dernier</span>
                            </>
                        ) : (
                            <>
                                <span className="text-red-600">↘️ {((earnings.thisMonth - earnings.lastMonth) / earnings.lastMonth * 100).toFixed(1)}%</span>
                                <span className="text-gray-500">vs mois dernier</span>
                            </>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <h3 className="text-sm font-medium text-gray-600 mb-4">Mois dernier</h3>
                    <p className="text-3xl font-bold text-gray-900 mb-2">
                        {earnings.lastMonth.toLocaleString()} DA
                    </p>
                    <p className="text-sm text-gray-500">Performance du mois précédent</p>
                </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                    <span className="text-2xl">ℹ️</span>
                    Comment ça marche ?
                </h3>
                <ul className="space-y-2 text-sm text-blue-800">
                    <li>• Vous recevez des frais de livraison pour chaque colis livré</li>
                    <li>• Le montant COD doit être remis à l'administrateur</li>
                    <li>• Vos gains sont calculés automatiquement</li>
                    <li>• Les paiements sont effectués mensuellement</li>
                </ul>
            </div>
        </div>
    );
}
