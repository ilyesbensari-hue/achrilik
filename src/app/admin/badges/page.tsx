'use client';

import { useState, useEffect } from 'react';
import { requireAdmin } from '@/lib/server-auth';
import { logger } from '@/lib/logger';

interface Product {
    id: string;
    title: string;
    createdAt: string;
    isNew: boolean;
    isTrending: boolean;
    isBestSeller: boolean;
    promotionLabel: string | null;
    images: string;
}

export default function AdminBadgesPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);
    const [recalculating, setRecalculating] = useState(false);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await fetch('/api/products?showAll=true');
            const data = await res.json();
            setProducts(data);
        } catch (error) {
            logger.error('Failed to fetch products', { error });
        } finally {
            setLoading(false);
        }
    };

    const toggleBadge = async (productId: string, badge: 'isNew' | 'isTrending' | 'isBestSeller', currentValue: boolean) => {
        setUpdating(productId);
        try {
            const res = await fetch(`/api/admin/badges/${productId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    [badge]: !currentValue
                })
            });

            if (res.ok) {
                // Update local state
                setProducts(products.map(p =>
                    p.id === productId ? { ...p, [badge]: !currentValue } : p
                ));
            } else {
                alert('Erreur lors de la mise à jour');
            }
        } catch (error) {
            logger.error('Failed to update badge', { error, productId, badge });
            alert('Erreur technique');
        } finally {
            setUpdating(null);
        }
    };

    const recalculateAllBadges = async () => {
        if (!confirm('Recalculer les badges pour TOUS les produits ? Cette action affectera les overrides manuels.')) {
            return;
        }

        setRecalculating(true);
        try {
            const res = await fetch('/api/admin/badges/recalculate', {
                method: 'POST'
            });

            if (res.ok) {
                const data = await res.json();
                alert(`${data.updatedCount} produits mis à jour`);
                fetchProducts();
            } else {
                alert('Erreur lors du recalcul');
            }
        } catch (error) {
            logger.error('Failed to recalculate badges', { error });
            alert('Erreur technique');
        } finally {
            setRecalculating(false);
        }
    };

    const isProductOld = (createdAt: string) => {
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
        return new Date(createdAt) <= threeDaysAgo;
    };

    if (loading) {
        return (
            <div className="container py-10">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#006233] mx-auto"></div>
                    <p className="mt-4 text-gray-600">Chargement...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container py-10">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Gestion des Badges</h1>
                    <p className="text-gray-600 mt-2">Contrôle admin des badges produits</p>
                </div>
                <button
                    onClick={recalculateAllBadges}
                    disabled={recalculating}
                    className="btn btn-secondary"
                >
                    {recalculating ? 'Recalcul...' : '🔄 Recalculer Tous les Badges'}
                </button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="font-bold text-blue-900 mb-2">ℹ️ Règles Automatiques</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                    <li><strong>🆕 NEW:</strong> Produits créés il y a moins de 3 jours</li>
                    <li><strong>⭐ BEST SELLER:</strong> Top 10 produits les plus vendus</li>
                    <li><strong>🏷️ PROMO:</strong> Produits avec un promotionLabel</li>
                    <li><strong>🔥 TRENDING:</strong> Géré manuellement uniquement</li>
                </ul>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full bg-white rounded-lg shadow">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-3 text-left">Produit</th>
                            <th className="p-3 text-center">Âge</th>
                            <th className="p-3 text-center">🆕 NEW</th>
                            <th className="p-3 text-center">🔥 TRENDING</th>
                            <th className="p-3 text-center">⭐ BEST SELLER</th>
                            <th className="p-3 text-center">🏷️ PROMO</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(product => {
                            const productAge = Math.floor((new Date().getTime() - new Date(product.createdAt).getTime()) / (1000 * 60 * 60 * 24));
                            const isOld = isProductOld(product.createdAt);
                            const hasPromo = product.promotionLabel !== null && product.promotionLabel.trim() !== '';

                            return (
                                <tr key={product.id} className="border-b hover:bg-gray-50">
                                    <td className="p-3">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={product.images.split(',')[0]}
                                                alt={product.title}
                                                className="w-12 h-12 object-cover rounded"
                                            />
                                            <div>
                                                <p className="font-medium">{product.title}</p>
                                                <p className="text-xs text-gray-500">{product.id.slice(0, 8)}...</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-3 text-center text-sm">
                                        <span className={`px-2 py-1 rounded ${isOld ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-800'}`}>
                                            {productAge} jour{productAge !== 1 ? 's' : ''}
                                        </span>
                                    </td>
                                    <td className="p-3 text-center">
                                        <button
                                            onClick={() => toggleBadge(product.id, 'isNew', product.isNew)}
                                            disabled={updating === product.id}
                                            className={`w-16 h-8 rounded-full transition-colors ${product.isNew
                                                ? 'bg-green-500'
                                                : 'bg-gray-300'
                                                } relative`}
                                        >
                                            <div
                                                className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow transition-transform ${product.isNew ? 'translate-x-8' : ''
                                                    }`}
                                            />
                                        </button>
                                        {isOld && product.isNew && (
                                            <p className="text-xs text-orange-600 mt-1">⚠️ Override</p>
                                        )}
                                    </td>
                                    <td className="p-3 text-center">
                                        <button
                                            onClick={() => toggleBadge(product.id, 'isTrending', product.isTrending)}
                                            disabled={updating === product.id}
                                            className={`w-16 h-8 rounded-full transition-colors ${product.isTrending
                                                ? 'bg-orange-500'
                                                : 'bg-gray-300'
                                                } relative`}
                                        >
                                            <div
                                                className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow transition-transform ${product.isTrending ? 'translate-x-8' : ''
                                                    }`}
                                            />
                                        </button>
                                    </td>
                                    <td className="p-3 text-center">
                                        <button
                                            onClick={() => toggleBadge(product.id, 'isBestSeller', product.isBestSeller)}
                                            disabled={updating === product.id}
                                            className={`w-16 h-8 rounded-full transition-colors ${product.isBestSeller
                                                ? 'bg-yellow-500'
                                                : 'bg-gray-300'
                                                } relative`}
                                        >
                                            <div
                                                className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow transition-transform ${product.isBestSeller ? 'translate-x-8' : ''
                                                    }`}
                                            />
                                        </button>
                                    </td>
                                    <td className="p-3 text-center">
                                        {hasPromo ? (
                                            <span className="inline-block bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                                                {product.promotionLabel}
                                            </span>
                                        ) : (
                                            <span className="text-gray-400 text-sm">—</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {products.length === 0 && (
                <div className="text-center py-10 text-gray-500">
                    Aucun produit trouvé
                </div>
            )}
        </div>
    );
}
