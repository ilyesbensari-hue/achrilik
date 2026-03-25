"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

function ShareWishlistContent() {
    const searchParams = useSearchParams();
    const idsParam = searchParams.get('ids');
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!idsParam) { setLoading(false); return; }
        const ids = idsParam.split(',').filter(Boolean).slice(0, 20);

        Promise.all(
            ids.map(id => fetch(`/api/products/${id}`).then(r => r.ok ? r.json() : null).catch(() => null))
        ).then(results => {
            setProducts(results.filter(Boolean));
        }).finally(() => setLoading(false));
    }, [idsParam]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#006233]" />
            </div>
        );
    }

    if (!idsParam || products.length === 0) {
        return (
            <div className="text-center py-20">
                <div className="text-6xl mb-4">💔</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Liste introuvable</h2>
                <p className="text-gray-500 mb-6">Ce lien de wishlist est invalide ou vide.</p>
                <Link href="/" className="inline-block px-6 py-3 bg-[#006233] text-white rounded-lg font-semibold hover:bg-[#004d28] transition-colors">
                    Découvrir les produits
                </Link>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-8 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-pink-50 border border-pink-200 rounded-full text-pink-700 text-sm font-medium mb-4">
                    ❤️ Wishlist partagée
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Liste de favoris
                </h1>
                <p className="text-gray-500">{products.length} produit{products.length > 1 ? 's' : ''} sélectionné{products.length > 1 ? 's' : ''}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map((product) => {
                    const images = product.images?.split(',') || [];
                    const price = product.discountPrice || product.price;

                    return (
                        <Link
                            key={product.id}
                            href={`/products/${product.id}`}
                            className="group bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300"
                        >
                            <div className="relative aspect-[4/5] bg-gray-100 overflow-hidden">
                                {images[0] && (
                                    <Image
                                        src={images[0].trim()}
                                        alt={product.title}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                )}
                                {product.discountPrice && (
                                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                                        Promo
                                    </div>
                                )}
                            </div>
                            <div className="p-3">
                                <h3 className="font-semibold text-sm line-clamp-2 mb-1 group-hover:text-[#006233] transition-colors">
                                    {product.title}
                                </h3>
                                <p className="text-base font-bold text-[#006233]">
                                    {price?.toLocaleString()} DA
                                </p>
                                {product.Store && (
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        {product.Store.name} · {product.Store.city}
                                    </p>
                                )}
                            </div>
                        </Link>
                    );
                })}
            </div>

            <div className="mt-12 text-center">
                <p className="text-gray-500 mb-4">Vous aimez ces produits ? Créez votre propre liste sur Achrilik</p>
                <Link
                    href="/register"
                    className="inline-block px-8 py-3 bg-[#006233] text-white font-semibold rounded-lg hover:bg-[#004d28] transition-colors"
                >
                    Rejoindre Achrilik gratuitement →
                </Link>
            </div>
        </div>
    );
}

export default function WishlistSharePage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-10 max-w-5xl">
                <Suspense fallback={
                    <div className="flex justify-center items-center min-h-[60vh]">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#006233]" />
                    </div>
                }>
                    <ShareWishlistContent />
                </Suspense>
            </div>
        </div>
    );
}
