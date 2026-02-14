"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface StoreCommission {
    storeId: string;
    storeName: string;
    orderCount: number;
    totalSales: number;
    commissionDue: number;
    commissionPaid: number;
    commissionUnpaid: number;
}

export default function CommissionDashboardPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    const [totalDue, setTotalDue] = useState(0);
    const [totalPaid, setTotalPaid] = useState(0);
    const [totalUnpaid, setTotalUnpaid] = useState(0);
    const [stores, setStores] = useState<StoreCommission[]>([]);

    useEffect(() => {
        fetchCommissionData();
    }, []);

    const fetchCommissionData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/commissions/summary');
            const data = await res.json();

            if (data.success) {
                setTotalDue(data.summary.totalCommissionDue);
                setTotalPaid(data.summary.totalCommissionPaid);
                setTotalUnpaid(data.summary.totalCommissionUnpaid);
                setStores(data.summary.byStore);
            }
        } catch (error) {
            console.error('Error fetching commission data:', error);
            toast.error('❌ Erreur lors du chargement');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkPaid = async (storeId: string, storeName: string) => {
        if (!confirm(`Marquer toutes les commissions de "${storeName}" comme payées ?`)) {
            return;
        }

        const paymentNote = prompt('Note de paiement (optionnel):');

        const toastId = toast.loading('Traitement...');
        try {
            const res = await fetch('/api/admin/commissions/mark-paid', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    storeId,
                    paymentNote
                })
            });

            const data = await res.json();

            if (data.success) {
                toast.success(`✅ ${data.updatedCount} commandes marquées comme payées`, { id: toastId });
                setTimeout(() => fetchCommissionData(), 500);
            } else {
                toast.error(`❌ ${data.error}`, { id: toastId });
            }
        } catch (error) {
            console.error('Error marking as paid:', error);
            toast.error('❌ Erreur technique', { id: toastId });
        }
    };

    if (loading) {
        return (
            <div className="container py-10">
                <div className="card p-8">
                    <p>Chargement...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container py-10">
            <div className="card p-8">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold">Dashboard Commissions Plateforme</h1>
                    <button
                        onClick={() => router.push('/admin/settings/commission')}
                        className="btn btn-outline"
                    >
                        ⚙️ Configurer Taux
                    </button>
                </div>

                {/* Global Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-blue-200">
                        <p className="text-sm font-semibold text-gray-600 mb-1">Total Commissions Dues</p>
                        <p className="text-3xl font-bold text-blue-600">
                            {totalDue.toLocaleString()} DA
                        </p>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border-2 border-green-200">
                        <p className="text-sm font-semibold text-gray-600 mb-1">Commissions Payées</p>
                        <p className="text-3xl font-bold text-green-600">
                            {totalPaid.toLocaleString()} DA
                        </p>
                    </div>

                    <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-xl border-2 border-orange-200">
                        <p className="text-sm font-semibold text-gray-600 mb-1">Commissions Impayées</p>
                        <p className="text-3xl font-bold text-orange-600">
                            {totalUnpaid.toLocaleString()} DA
                        </p>
                    </div>
                </div>

                {/* By Store Table */}
                <h2 className="text-xl font-bold mb-4">Par Vendeur</h2>

                {stores.length === 0 ? (
                    <div className="bg-gray-50 p-8 rounded-xl text-center">
                        <p className="text-gray-600">
                            Aucune commission à afficher pour le moment.
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                            Les commissions apparaîtront une fois que le taux sera configuré et que les commandes seront livrées.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white border rounded-lg">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-bold">Vendeur</th>
                                    <th className="px-4 py-3 text-right text-sm font-bold">Commandes</th>
                                    <th className="px-4 py-3 text-right text-sm font-bold">Total Ventes</th>
                                    <th className="px-4 py-3 text-right text-sm font-bold">Commission Due</th>
                                    <th className="px-4 py-3 text-right text-sm font-bold">Payé</th>
                                    <th className="px-4 py-3 text-right text-sm font-bold">Impayé</th>
                                    <th className="px-4 py-3 text-center text-sm font-bold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stores.map((store) => (
                                    <tr key={store.storeId} className="border-t hover:bg-gray-50">
                                        <td className="px-4 py-3 font-medium">{store.storeName}</td>
                                        <td className="px-4 py-3 text-right">{store.orderCount}</td>
                                        <td className="px-4 py-3 text-right font-medium">
                                            {store.totalSales.toLocaleString()} DA
                                        </td>
                                        <td className="px-4 py-3 text-right font-bold text-blue-600">
                                            {store.commissionDue.toLocaleString()} DA
                                        </td>
                                        <td className="px-4 py-3 text-right text-green-600">
                                            {store.commissionPaid.toLocaleString()} DA
                                        </td>
                                        <td className="px-4 py-3 text-right font-bold text-orange-600">
                                            {store.commissionUnpaid.toLocaleString()} DA
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {store.commissionUnpaid > 0 ? (
                                                <button
                                                    onClick={() => handleMarkPaid(store.storeId, store.storeName)}
                                                    className="btn btn-sm btn-primary"
                                                >
                                                    ✅ Marquer Payé
                                                </button>
                                            ) : (
                                                <span className="text-xs text-gray-400">Tout payé</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
