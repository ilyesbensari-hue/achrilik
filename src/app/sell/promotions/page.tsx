"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Product {
    id: string;
    title: string;
    price: number;
    discountPrice: number | null;
    images: string;
    storeId: string;
}

export default function SellerPromotionsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [savingId, setSavingId] = useState<string | null>(null);
    const [discounts, setDiscounts] = useState<Record<string, string>>({});
    const [toastMsg, setToastMsg] = useState('');

    useEffect(() => {
        const userSession = localStorage.getItem('user');
        if (!userSession) { window.location.href = '/login'; return; }
        try {
            const user = JSON.parse(userSession);
            const isSeller = user.role === 'SELLER' || (Array.isArray(user.roles) && user.roles.includes('SELLER'));
            if (!isSeller) { window.location.href = '/'; return; }
            fetchProducts(user.id);
        } catch { window.location.href = '/login'; }
    }, []);

    const fetchProducts = async (userId: string) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/seller/products?userId=${userId}`);
            const data = await res.json();
            const prods = data.products || data || [];
            setProducts(Array.isArray(prods) ? prods : []);
            // Initialize discount inputs from existing discountPrice
            const init: Record<string, string> = {};
            prods.forEach((p: Product) => {
                if (p.discountPrice) {
                    const pct = Math.round(((p.price - p.discountPrice) / p.price) * 100);
                    init[p.id] = pct.toString();
                }
            });
            setDiscounts(init);
        } catch { setProducts([]); }
        finally { setLoading(false); }
    };

    const applyDiscount = async (product: Product, pctStr: string) => {
        setSavingId(product.id);
        const pct = parseInt(pctStr);
        const discountPrice = pct > 0 && pct < 100 ? Math.round(product.price * (1 - pct / 100)) : null;
        try {
            const res = await fetch(`/api/seller/products/${product.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ discountPrice }),
            });
            if (res.ok) {
                setProducts(prev => prev.map(p => p.id === product.id ? { ...p, discountPrice } : p));
                setToastMsg(discountPrice ? `✅ Promotion de ${pct}% appliquée` : '✅ Promotion retirée');
                setTimeout(() => setToastMsg(''), 3000);
            }
        } catch { /* ignore */ }
        finally { setSavingId(null); }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#006233]" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Toast */}
            {toastMsg && (
                <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-3 bg-[#006233] text-white rounded-xl shadow-lg text-sm font-semibold">
                    {toastMsg}
                </div>
            )}

            <div className="container mx-auto px-4 py-8 max-w-4xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">🏷️ Gestion des Promotions</h1>
                        <p className="text-gray-500 mt-1">Appliquez des réductions sur vos produits</p>
                    </div>
                    <Link href="/sell" className="text-[#006233] hover:underline text-sm font-medium">
                        ← Dashboard
                    </Link>
                </div>

                {products.length === 0 ? (
                    <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center">
                        <div className="text-6xl mb-4">🛍️</div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Aucun produit</h2>
                        <p className="text-gray-500 mb-6">Ajoutez des produits d'abord pour gérer vos promotions.</p>
                        <Link href="/sell/new" className="inline-block px-6 py-3 bg-[#006233] text-white font-semibold rounded-lg hover:bg-[#004d28] transition-colors">
                            + Ajouter un produit
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {products.map((product) => {
                            const images = product.images?.split(',') || [];
                            const hasDiscount = !!product.discountPrice;
                            const currentPct = discounts[product.id] || '';
                            const previewPrice = currentPct && parseInt(currentPct) > 0
                                ? Math.round(product.price * (1 - parseInt(currentPct) / 100))
                                : null;

                            return (
                                <div key={product.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
                                    {/* Image */}
                                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                        {images[0] && (
                                            <Image src={images[0].trim()} alt={product.title} fill className="object-cover" />
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-gray-900 truncate">{product.title}</h3>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-sm font-semibold text-[#006233]">
                                                {product.price.toLocaleString()} DA
                                            </span>
                                            {hasDiscount && (
                                                <span className="text-xs text-red-500 line-through">
                                                    → {product.discountPrice!.toLocaleString()} DA
                                                </span>
                                            )}
                                            {hasDiscount && (
                                                <span className="px-1.5 py-0.5 bg-red-100 text-red-600 text-xs font-bold rounded">
                                                    -{Math.round(((product.price - product.discountPrice!) / product.price) * 100)}%
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Discount input */}
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <div className="relative">
                                            <input
                                                type="number"
                                                min="0"
                                                max="90"
                                                placeholder="0"
                                                value={currentPct}
                                                onChange={(e) => setDiscounts(prev => ({ ...prev, [product.id]: e.target.value }))}
                                                className="w-20 px-2 py-2 pr-6 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-[#006233]/30 focus:border-[#006233]"
                                            />
                                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">%</span>
                                        </div>
                                        {previewPrice && (
                                            <span className="text-xs text-gray-500 whitespace-nowrap">
                                                → {previewPrice.toLocaleString()} DA
                                            </span>
                                        )}
                                        <button
                                            onClick={() => applyDiscount(product, currentPct)}
                                            disabled={savingId === product.id}
                                            className="px-3 py-2 bg-[#006233] text-white text-xs font-semibold rounded-lg hover:bg-[#004d28] transition-colors disabled:opacity-50 whitespace-nowrap"
                                        >
                                            {savingId === product.id ? '...' : currentPct === '0' || currentPct === '' ? 'Retirer' : 'Appliquer'}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
