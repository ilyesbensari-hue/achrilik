"use client";

import { useEffect, useState } from 'react';
import ProductGrid from '@/components/ProductGrid';

export default function CategoryShowcase() {
    const [hommeProducts, setHommeProducts] = useState<any[]>([]);
    const [femmeProducts, setFemmeProducts] = useState<any[]>([]);
    const [enfantProducts, setEnfantProducts] = useState<any[]>([]);

    useEffect(() => {
        // Fetch all products and filter by category
        fetch('/api/products')
            .then(res => res.json())
            .then((products) => {
                const approved = products.filter((p: any) => p.status === 'APPROVED');

                // Filter by parent category slugs
                const homme = approved.filter((p: any) =>
                    p.category?.slug?.includes('homme') ||
                    p.category?.parent?.slug?.includes('homme')
                ).slice(0, 4);

                const femme = approved.filter((p: any) =>
                    p.category?.slug?.includes('femme') ||
                    p.category?.parent?.slug?.includes('femme')
                ).slice(0, 4);

                const enfant = approved.filter((p: any) =>
                    p.category?.slug?.includes('enfant') ||
                    p.category?.parent?.slug?.includes('enfant')
                ).slice(0, 4);

                setHommeProducts(homme);
                setFemmeProducts(femme);
                setEnfantProducts(enfant);
            })
            .catch(console.error);
    }, []);

    return (
        <div className="space-y-12">
            {/* Articles Hommes */}
            {hommeProducts.length > 0 && (
                <div>
                    <h2 className="text-2xl font-bold mb-4">👔 Articles Hommes</h2>
                    <ProductGrid products={hommeProducts} />
                </div>
            )}

            {/* Articles Femmes */}
            {femmeProducts.length > 0 && (
                <div>
                    <h2 className="text-2xl font-bold mb-4">👗 Articles Femmes</h2>
                    <ProductGrid products={femmeProducts} />
                </div>
            )}

            {/* Articles Enfants */}
            {enfantProducts.length > 0 && (
                <div>
                    <h2 className="text-2xl font-bold mb-4">👶 Articles Enfants</h2>
                    <ProductGrid products={enfantProducts} />
                </div>
            )}
        </div>
    );
}
