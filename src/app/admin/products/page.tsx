"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Product {
    id: string;
    title: string;
    description: string;
    price: number;
    images: string;
    status: string;
    rejectionReason: string | null;
    createdAt: string;
    category: {
        name: string;
    } | null;
    Store: {
        name: string;
        User: {
            name: string;
            email: string;
        };
    };
    Variant: Array<{
        stock: number;
    }>;
}

import Toast from '@/components/Toast';

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
    const [search, setSearch] = useState('');
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');

    useEffect(() => {
        fetchProducts();
    }, [filter]);

    const showToastNotification = (message: string, type: 'success' | 'error') => {
        setToastMessage(message);
        setToastType(type);
        setShowToast(true);
    };

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/admin/products?status=${filter}`);
            const data = await res.json();
            setProducts(data.products || []);
        } catch (error) {
            console.error('Error fetching products:', error);
            showToastNotification('Erreur lors du chargement des produits', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: string) => {
        if (!confirm('Approuver ce produit ?')) return;

        try {
            const res = await fetch(`/api/admin/products/${id}/approve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            if (res.ok) {
                showToastNotification('Produit approuvé', 'success');
                fetchProducts();
            } else {
                const err = await res.json();
                showToastNotification(err.error || 'Erreur', 'error');
            }
        } catch (error) {
            console.error(error);
            showToastNotification('Erreur technique', 'error');
        }
    };

    const handleReject = async (id: string, currentStatus: string) => {
        if (currentStatus === 'REJECTED') return;
        const reason = prompt('Raison du rejet:');
        if (!reason) return;

        try {
            const res = await fetch(`/api/admin/products/${id}/reject`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason })
            });

            if (res.ok) {
                showToastNotification('Produit rejeté', 'success');
                fetchProducts();
            } else {
                const err = await res.json();
                showToastNotification(err.error || 'Erreur', 'error');
            }
        } catch (error) {
            console.error(error);
            showToastNotification('Erreur technique', 'error');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Voulez-vous vraiment supprimer ce produit ? Cette action est irréversible.')) return;

        try {
            const res = await fetch(`/api/admin/products/${id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                showToastNotification('Produit supprimé', 'success');
                fetchProducts();
            } else {
                showToastNotification('Erreur lors de la suppression', 'error');
            }
        } catch (error) {
            console.error(error);
            showToastNotification('Erreur technique', 'error');
        }
    };

    const filteredProducts = products.filter(p => {
        if (!search) return true;
        const low = search.toLowerCase();
        return p.title.toLowerCase().includes(low) ||
            p.Store.name.toLowerCase().includes(low);
    });

    return (
        <div>
            {showToast && (
                <Toast
                    message={toastMessage}
                    type={toastType}
                    onClose={() => setShowToast(false)}
                />
            )}
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Gestion des Produits</h1>
                <Link
                    href="/admin"
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                >
                    ← Retour
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    <input
                        placeholder="Rechercher..."
                        className="flex-1 px-4 py-2 border rounded-lg"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    <div className="flex gap-2">
                        {(['all', 'pending', 'approved', 'rejected'] as const).map(s => (
                            <button
                                key={s}
                                onClick={() => setFilter(s)}
                                className={`px-4 py-2 rounded-lg capitalize ${filter === s ? 'bg-indigo-600 text-white' : 'bg-gray-100'}`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produit</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prix</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendeur</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredProducts.map(product => (
                            <tr key={product.id}>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <Image src={product.images.split(',')[0]} width={48} height={48} alt={product.title} className="object-cover rounded" />
                                        <div>
                                            <p className="font-medium text-gray-900">{product.title}</p>
                                            <p className="text-sm text-gray-500">{product.category?.name || 'Sans catégorie'}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 font-medium">{product.price.toLocaleString()} DA</td>
                                <td className="px-6 py-4 text-sm">
                                    <p className="font-medium">{product.Store.name}</p>
                                    <p className="text-gray-500">{product.Store.User.name}</p>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs rounded-full font-semibold
                                        ${product.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                            product.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                                                'bg-yellow-100 text-yellow-800'}`}>
                                        {product.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex gap-2">
                                        {product.status !== 'APPROVED' && (
                                            <button
                                                onClick={() => handleApprove(product.id)}
                                                className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                                            >
                                                Approuver
                                            </button>
                                        )}
                                        {product.status !== 'REJECTED' && (
                                            <button
                                                onClick={() => handleReject(product.id, product.status)}
                                                className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                                            >
                                                Rejeter
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(product.id)}
                                            className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                                        >
                                            Supprimer
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
