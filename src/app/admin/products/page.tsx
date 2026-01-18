"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface Product {
    id: string;
    title: string;
    description: string;
    price: number;
    images: string;
    status: string;
    rejectionReason?: string;
    createdAt: string;
    store: {
        name: string;
        owner: {
            name: string;
            email: string;
        };
    };
    category?: {
        name: string;
    };
}

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [adminId, setAdminId] = useState('');

    useEffect(() => {
        // Get admin ID from session/localStorage
        const storedAdminId = localStorage.getItem('userId');
        if (storedAdminId) {
            setAdminId(storedAdminId);
        }
        fetchProducts();
    }, [filter, search]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (filter !== 'all') params.append('status', filter);
            if (search) params.append('search', search);

            const res = await fetch(`/api/admin/products?${params}`);
            const data = await res.json();
            setProducts(data.products || []);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (productId: string) => {
        if (!adminId) {
            alert('Admin ID non trouvé. Veuillez vous reconnecter.');
            return;
        }

        try {
            const res = await fetch(`/api/admin/products/${productId}/approve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ adminId })
            });

            if (res.ok) {
                alert('Produit approuvé avec succès!');
                fetchProducts();
            } else {
                alert('Erreur lors de l\'approbation');
            }
        } catch (error) {
            console.error('Error approving product:', error);
            alert('Erreur lors de l\'approbation');
        }
    };

    const handleReject = async (productId: string) => {
        if (!adminId) {
            alert('Admin ID non trouvé. Veuillez vous reconnecter.');
            return;
        }

        const reason = prompt('Raison du rejet:');
        if (!reason) return;

        try {
            const res = await fetch(`/api/admin/products/${productId}/reject`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ adminId, reason })
            });

            if (res.ok) {
                alert('Produit rejeté avec succès!');
                fetchProducts();
            } else {
                alert('Erreur lors du rejet');
            }
        } catch (error) {
            console.error('Error rejecting product:', error);
            alert('Erreur lors du rejet');
        }
    };

    const getStatusBadge = (status: string) => {
        const styles = {
            PENDING: 'bg-yellow-100 text-yellow-800',
            APPROVED: 'bg-green-100 text-green-800',
            REJECTED: 'bg-red-100 text-red-800'
        };
        const labels = {
            PENDING: 'En attente',
            APPROVED: 'Approuvé',
            REJECTED: 'Rejeté'
        };
        return (
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status as keyof typeof styles]}`}>
                {labels[status as keyof typeof labels]}
            </span>
        );
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Modération des Produits</h1>
                <div className="flex gap-2">
                    <a
                        href="/api/admin/export/products?format=csv"
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
                    >
                        📊 Export CSV
                    </a>
                    <a
                        href="/api/admin/export/products?format=pdf"
                        target="_blank"
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
                    >
                        📄 Export PDF
                    </a>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="Rechercher un produit..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                    </div>
                    <div className="flex gap-2">
                        {['all', 'pending', 'approved', 'rejected'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === status
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {status === 'all' ? 'Tous' : status === 'pending' ? 'En attente' : status === 'approved' ? 'Approuvés' : 'Rejetés'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Products List */}
            {loading ? (
                <div className="text-center py-12">Chargement...</div>
            ) : products.length === 0 ? (
                <div className="text-center py-12 text-gray-500">Aucun produit trouvé</div>
            ) : (
                <div className="grid gap-6">
                    {products.map((product) => {
                        const imageUrl = product.images.split(',')[0];
                        return (
                            <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <div className="flex gap-6">
                                    {/* Product Image */}
                                    <div className="w-32 h-32 relative flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                                        <Image
                                            src={imageUrl}
                                            alt={product.title}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>

                                    {/* Product Info */}
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 className="text-xl font-semibold text-gray-900">{product.title}</h3>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    Par {product.store.name} ({product.store.owner.name})
                                                </p>
                                            </div>
                                            {getStatusBadge(product.status)}
                                        </div>

                                        <p className="text-gray-600 mb-3 line-clamp-2">{product.description}</p>

                                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                                            <span className="font-bold text-indigo-600 text-lg">{product.price} DA</span>
                                            {product.category && <span>• {product.category.name}</span>}
                                            <span>• {new Date(product.createdAt).toLocaleDateString('fr-FR')}</span>
                                        </div>

                                        {product.rejectionReason && (
                                            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                                                <p className="text-sm text-red-800">
                                                    <strong>Raison du rejet:</strong> {product.rejectionReason}
                                                </p>
                                            </div>
                                        )}

                                        {/* Actions */}
                                        {product.status === 'PENDING' && (
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => handleApprove(product.id)}
                                                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                                                >
                                                    ✓ Approuver
                                                </button>
                                                <button
                                                    onClick={() => handleReject(product.id)}
                                                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                                                >
                                                    ✗ Rejeter
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
