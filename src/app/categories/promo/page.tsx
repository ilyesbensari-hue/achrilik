"use client";

import { useState, useEffect } from 'react';
import ProductGrid from '@/components/ProductGrid';

export default function PromoPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/products')
            .then(res => res.json())
            .then(data => {
                // Filter products with discounts
                const promoProducts = data.filter((p: any) =>
                    p.discountPrice && p.discountPrice < p.price && p.status === 'APPROVED'
                );
                setProducts(promoProducts);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="container py-10">
                <div className="text-center">Chargement...</div>
            </div>
        );
    }

    return (
        <div className="container py-10">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">🔥 Promotions</h1>
                <p className="text-gray-600">
                    Profitez de nos meilleures offres avec des réductions allant jusqu'à -50%
                </p>
            </div>

            {products.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-xl">
                    <div className="text-4xl mb-4">📦</div>
                    <h3 className="text-xl font-bold mb-2">Aucune promotion pour le moment</h3>
                    <p className="text-gray-500">
                        Revenez bientôt pour découvrir nos nouvelles offres !
                    </p>
                </div>
            ) : (
                <ProductGrid products={products} />
            )}
        </div>
    );
}
