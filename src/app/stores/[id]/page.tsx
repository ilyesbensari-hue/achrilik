"use client";

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const MapPicker = dynamic(() => import('@/components/StoreMap'), { ssr: false });

interface Review {
    id: string;
    rating: number;
    comment: string | null;
    createdAt: string;
    user: {
        name: string;
    };
}

interface Product {
    id: string;
    title: string;
    price: number;
    images: string;
    reviews: Review[];
}

interface Store {
    id: string;
    name: string;
    description?: string;
    address?: string;
    city?: string;
    phone?: string;
    hours?: string;
    latitude?: number;
    longitude?: number;
    clickCollect?: boolean;
    products: Product[];
}

export default function StoreDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [store, setStore] = useState<Store | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStore();
    }, [id]);

    const fetchStore = async () => {
        try {
            // Optimized fetch: Direct API call for single store
            const res = await fetch(`/api/stores/${id}`);
            if (res.ok) {
                const data = await res.json();
                setStore(data);
            }
            setLoading(false);
        } catch (e) {
            console.error(e);
            setLoading(false);
        }
    };

    const getGoogleMapsLink = () => {
        if (store?.latitude && store?.longitude) {
            return `https://www.google.com/maps?q=${store.latitude},${store.longitude}`;
        } else if (store?.address && store?.city) {
            return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.address + ', ' + store.city)}`;
        }
        return null;
    };

    // Calculate Store Stats
    const calculateStats = () => {
        if (!store?.products) return { avgRating: 0, totalReviews: 0, allReviews: [] };

        const allReviews: Review[] = [];
        store.products.forEach(p => {
            if (p.reviews) {
                allReviews.push(...p.reviews);
            }
        });

        const totalReviews = allReviews.length;
        const sumRating = allReviews.reduce((acc, r) => acc + r.rating, 0);
        const avgRating = totalReviews > 0 ? sumRating / totalReviews : 0;

        // Sort reviews by date desc
        allReviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return { avgRating, totalReviews, allReviews };
    };

    if (loading) {
        return (
            <div className="container py-20 flex justify-center">
                <div className="loading w-12 h-12"></div>
            </div>
        );
    }

    if (!store) {
        return (
            <div className="container py-10 text-center">
                <h2 className="text-2xl font-bold mb-4">Magasin introuvable</h2>
                <Link href="/stores" className="btn btn-primary">
                    Retour à la recherche
                </Link>
            </div>
        );
    }

    const { avgRating, totalReviews, allReviews } = calculateStats();
    const mapsLink = getGoogleMapsLink();

    return (
        <div className="container py-10">
            {/* Back button */}
            <Link href="/" className="btn btn-ghost mb-6 inline-flex items-center gap-2 text-gray-600 hover:text-gray-900">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Retour à l'accueil
            </Link>

            {/* Store Header Card */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-10 border border-gray-100">
                <div className="bg-gradient-to-r from-[#006233] to-[#004d28] h-32 md:h-48 relative">
                    <div className="absolute -bottom-10 left-8 md:left-12">
                        <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-full p-2 shadow-lg flex items-center justify-center text-4xl border-4 border-white">
                            🏪
                        </div>
                    </div>
                </div>

                <div className="pt-12 px-8 pb-8 md:pl-48">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                        <div>
                            <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-2">{store.name}</h1>

                            {/* Rating Badge */}
                            <div className="flex items-center gap-3 mb-4">
                                <div className="flex items-center bg-yellow-50 px-3 py-1 rounded-full border border-yellow-100">
                                    <span className="text-yellow-500 mr-1 text-lg">★</span>
                                    <span className="font-bold text-gray-800">{avgRating.toFixed(1)}</span>
                                    <span className="text-gray-400 text-sm mx-1">/</span>
                                    <span className="text-sm text-gray-500 font-medium">5.0</span>
                                </div>
                                <span className="text-sm text-gray-500 underline decoration-gray-300 decoration-dotted underline-offset-4">
                                    {totalReviews} avis authentiques
                                </span>
                            </div>

                            {store.description && (
                                <p className="text-gray-600 text-lg leading-relaxed max-w-2xl">{store.description}</p>
                            )}
                        </div>

                        {store.clickCollect && (
                            <div className="flex items-center gap-2 bg-green-50 text-[#006233] px-4 py-2 rounded-xl font-bold border border-green-100 shadow-sm animate-pulse-slow">
                                <span className="text-xl">🛍️</span>
                                Click & Collect
                            </div>
                        )}
                    </div>
                </div>

                {/* Info & Map Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-t border-gray-100 divide-y md:divide-y-0 md:divide-x divide-gray-100 bg-gray-50/50">
                    {/* Contact */}
                    <div className="p-8">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            📍 Adresse & Contact
                        </h3>
                        <div className="space-y-4">
                            {(store.address || store.city) && (
                                <div className="text-sm text-gray-600">
                                    <p className="font-medium text-gray-900 mb-1">{store.address}</p>
                                    <p>{store.city}</p>
                                    {mapsLink && (
                                        <a href={mapsLink} target="_blank" className="text-[#006233] text-xs font-semibold mt-2 inline-flex items-center gap-1 hover:underline">
                                            🗺️ Voir sur la carte
                                        </a>
                                    )}
                                </div>
                            )}
                            {store.phone && (
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wide font-bold mb-1">Téléphone</p>
                                    <a href={`tel:${store.phone}`} className="text-lg font-mono font-medium text-gray-900 hover:text-[#006233]">
                                        {store.phone}
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Hours */}
                    <div className="p-8">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            🕒 Horaires d'ouverture
                        </h3>
                        {store.hours ? (
                            <p className="text-gray-600 whitespace-pre-line">{store.hours}</p>
                        ) : (
                            <p className="text-gray-400 italic">Non communiqué</p>
                        )}
                    </div>

                    {/* Small Map Preview */}
                    <div className="h-64 md:h-auto relative bg-gray-200">
                        {store.latitude && store.longitude ? (
                            <div className="absolute inset-0 grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                                <MapPicker stores={[store]} onStoreSelect={() => { }} />
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                                Carte non disponible
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Left: Products (2 cols space) */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-black text-gray-900">
                            La Collection <span className="text-[#006233]">({store.products?.length || 0})</span>
                        </h2>
                    </div>

                    {store.products && store.products.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {store.products.map(product => {
                                const imageUrl = product.images?.split(',')[0] || '';
                                return (
                                    <Link
                                        key={product.id}
                                        href={`/products/${product.id}`}
                                        className="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:border-[#006233]/30 transition-all duration-300"
                                    >
                                        <div className="aspect-[4/5] bg-gray-100 overflow-hidden relative">
                                            {imageUrl ? (
                                                <img
                                                    src={imageUrl}
                                                    alt={product.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-gray-400">Pas d'image</div>
                                            )}
                                            {/* Quick Rating on Card */}
                                            {product.reviews && product.reviews.length > 0 && (
                                                <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-md text-white px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1">
                                                    <span className="text-yellow-400">★</span>
                                                    {(product.reviews.reduce((a, b) => a + b.rating, 0) / product.reviews.length).toFixed(1)}
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-bold text-gray-900 truncate mb-1">{product.title}</h3>
                                            <p className="text-[#006233] font-black">{product.price.toLocaleString()} DA</p>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="bg-gray-50 rounded-xl p-10 text-center border-2 border-dashed border-gray-200">
                            <p className="text-gray-500">Ce vendeur n'a pas encore ajouté de produits.</p>
                        </div>
                    )}
                </div>

                {/* Right: Reviews (1 col space) */}
                <div className="lg:col-span-1">
                    <div className="bg-gray-50 rounded-2xl p-6 sticky top-24">
                        <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                            💬 Avis Clients <span className="text-gray-400 font-normal text-base">({totalReviews})</span>
                        </h2>

                        {allReviews.length > 0 ? (
                            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                                {allReviews.map((review) => (
                                    <div key={review.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-1">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <span key={i} className={`text-sm ${i < review.rating ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
                                                ))}
                                            </div>
                                            <span className="text-xs text-gray-400">
                                                {new Date(review.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        {review.comment && (
                                            <p className="text-gray-700 text-sm mb-3 line-clamp-4">"{review.comment}"</p>
                                        )}
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600 text-[10px] font-bold flex items-center justify-center uppercase">
                                                {review.user.name.charAt(0)}
                                            </div>
                                            <span className="text-xs font-medium text-gray-900">{review.user.name}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 text-gray-500">
                                <p className="mb-2">💤 Aucun avis pour le moment</p>
                                <p className="text-xs">Les avis collectés sur les produits de ce vendeur apparaîtront ici.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
