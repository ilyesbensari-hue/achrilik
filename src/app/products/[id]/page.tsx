import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import SellerRating from '@/components/SellerRating';
import ProductPageClient from './ProductPageClient';
import FreeDeliveryBadge from '@/components/FreeDeliveryBadge';
import { prisma } from '@/lib/prisma'; // Direct DB access for efficiency

// Enable ISR with 5 minute revalidation
export const revalidate = 300;

// Category Mapping for "Complete the Look"
const COMPLEMENTARY_CATEGORIES: Record<string, string[]> = {
    'pulls': ['chemises', 'vestes', 'pantalons'],
    'chemises': ['pantalons', 'vestes', 'cravates'],
    'pantalons': ['chemises', 'pulls', 'ceintures', 'chaussures'],
    'costumes': ['chemises', 'cravates', 'chaussures'],
    'vestes': ['chemises', 'pantalons'],
    'chaussures': ['ceintures', 'pantalons'],
    // Default fallbacks handled in logic
};

async function getProduct(id: string) {
    try {
        const product = await prisma.product.findUnique({
            where: { id },
            include: {
                Store: true,
                Category: true,
                Variant: true
            }
        });
        return product;
    } catch (error) {
        console.error('Failed to fetch product:', error);
        return null;
    }
}

async function getRecommendations(currentProduct: any) {
    if (!currentProduct?.Category) return { similar: [], complementary: [] };

    // 1. Similar Products (Same Category)
    const similar = await prisma.product.findMany({
        where: {
            categoryId: currentProduct.categoryId,
            id: { not: currentProduct.id }
        },
        take: 4,
        include: { Store: true }
    });

    // 2. Complementary Products
    let complementary: any[] = [];
    const currentSlug = currentProduct.Category.slug.toLowerCase();

    // Find target categories logic
    let targetSlugs: string[] = [];

    // Try exact match in mapping
    // Handle partial matches e.g. "pulls-hommes" matches "pulls" logic if strictly mapped, 
    // but for now let's try simple keyword matching if exact slug fails
    if (COMPLEMENTARY_CATEGORIES[currentSlug]) {
        targetSlugs = COMPLEMENTARY_CATEGORIES[currentSlug];
    } else {
        // Fallback: Check if slug contains key
        const key = Object.keys(COMPLEMENTARY_CATEGORIES).find(k => currentSlug.includes(k));
        if (key) targetSlugs = COMPLEMENTARY_CATEGORIES[key];
    }

    if (targetSlugs.length > 0) {
        complementary = await prisma.product.findMany({
            where: {
                Category: {
                    slug: { in: targetSlugs }
                },
                id: { not: currentProduct.id }
            },
            take: 4,
            include: { Store: true }
        });
    }

    return { similar, complementary };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const product = await getProduct(id);

    if (!product) {
        notFound();
    }

    const { similar, complementary } = await getRecommendations(product);

    const sizes = Array.from(new Set(product.Variant?.map((v: any) => v.size) || [])) as string[];
    const colors = Array.from(new Set(product.Variant?.map((v: any) => v.color) || [])) as string[];
    const images = product.images ? product.images.split(',') : [];

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container">
                {/* Breadcrumb */}
                <nav className="mb-8 flex items-center gap-2 text-sm text-gray-600">
                    <Link href="/" className="hover:text-indigo-600">Accueil</Link>
                    <span>/</span>
                    <Link href={`/?category=${product.Category?.slug}`} className="hover:text-indigo-600">{product.Category?.name}</Link>
                    <span>/</span>
                    <span className="text-gray-900 font-medium">{product.title}</span>
                </nav>

                <div className="grid lg:grid-cols-2 gap-12 bg-white rounded-2xl shadow-lg overflow-hidden">
                    {/* Images Gallery */}
                    <ProductPageClient
                        product={product}
                        sizes={sizes}
                        colors={colors}
                        images={images}
                    />

                    {/* Product Info - Server Rendered */}
                    <div className="p-4 lg:p-12 space-y-8">
                        {/* Store Info */}
                        <div className="flex items-center gap-3 text-sm">
                            <Link href={`/stores/${product.Store.id}`} className="flex items-center gap-3 transition-opacity hover:opacity-80">
                                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                    {product.Store.name[0]}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="font-semibold text-gray-900 hover:text-indigo-600 underline decoration-dotted">{product.Store.name}</p>
                                        <SellerRating rating={0} count={0} size="sm" />
                                    </div>
                                    <p className="text-gray-500">📍 {product.Store.city} <span className="text-xs text-indigo-500">(Voir la boutique)</span></p>
                                </div>
                            </Link>
                        </div>

                        {/* Storage City Badge - if outside Oran */}
                        {product.Store.storageCity && product.Store.storageCity !== 'Oran' && (
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg border border-amber-200 text-xs font-medium">
                                <span>📦</span>
                                <span>Stocké à {product.Store.storageCity}</span>
                            </div>
                        )}

                        {/* Title & Price */}
                        <div>
                            <div className="flex justify-between items-start gap-4">
                                <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-3 leading-tight">{product.title}</h1>
                                {product.promotionLabel && (
                                    <span className="px-3 py-1 bg-red-100 text-red-600 font-bold text-xs uppercase tracking-wider rounded-md animate-pulse">
                                        {product.promotionLabel}
                                    </span>
                                )}
                            </div>

                            <div className="flex flex-col gap-1 mt-4">
                                <div className="flex items-baseline gap-3">
                                    {product.discountPrice ? (
                                        <>
                                            <span className="text-4xl font-black text-red-600">{product.discountPrice.toLocaleString()} DA</span>
                                            <span className="text-xl text-gray-400 line-through decoration-2 decoration-gray-300">
                                                {product.price.toLocaleString()} DA
                                            </span>
                                        </>
                                    ) : (
                                        <span className="text-4xl font-black text-indigo-600">{product.price.toLocaleString()} DA</span>
                                    )}
                                </div>
                                {product.Category && (
                                    <span className="self-start px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-full border border-indigo-100">
                                        {product.Category.name}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Free Delivery Incentive Section */}
                        {product.Store?.offersFreeDelivery && (
                            <FreeDeliveryBadge
                                variant="product-page"
                                threshold={product.Store.freeDeliveryThreshold}
                                currentAmount={product.discountPrice || product.price}
                                storeName={product.Store.name}
                                storeId={product.Store.id}
                            />
                        )}

                        {/* Warranty Badge */}
                        {product.warranty && (
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg border border-green-100 text-sm font-medium">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Garantie: {product.warranty}
                            </div>
                        )}

                        {/* Product Specifications Table */}
                        <div className="border border-gray-100 rounded-xl overflow-hidden">
                            <h3 className="bg-gray-50 px-4 py-3 font-semibold text-gray-900 border-b border-gray-100 flex items-center gap-2">
                                <span>📋</span> Caractéristiques
                            </h3>
                            <div className="divide-y divide-gray-50 text-sm">
                                {product.material && (
                                    <div className="grid grid-cols-3 px-4 py-3">
                                        <span className="text-gray-500">Matière</span>
                                        <span className="col-span-2 font-medium text-gray-900">{product.material}</span>
                                    </div>
                                )}
                                {product.fit && (
                                    <div className="grid grid-cols-3 px-4 py-3 bg-white">
                                        <span className="text-gray-500">Coupe</span>
                                        <span className="col-span-2 font-medium text-gray-900">{product.fit}</span>
                                    </div>
                                )}
                                {product.dimensions && (
                                    <div className="grid grid-cols-3 px-4 py-3">
                                        <span className="text-gray-500">Dimensions</span>
                                        <span className="col-span-2 font-medium text-gray-900">{product.dimensions}</span>
                                    </div>
                                )}
                                {/* Status default fallback */}
                                {(!product.material && !product.fit && !product.dimensions) && (
                                    <div className="px-4 py-3 text-gray-400 italic">Aucune caractéristique spécifique renseignée.</div>
                                )}
                            </div>
                        </div>

                        {/* Technical Specs (Electronics) */}
                        {product.Category?.slug.includes('electronique') && product.technicalSpecs && (
                            <div className="bg-gray-900 text-white rounded-xl p-6">
                                <h3 className="font-bold mb-4 flex items-center gap-2">
                                    <span>⚡</span> Spécifications Techniques
                                </h3>
                                <pre className="font-mono text-sm whitespace-pre-wrap text-gray-300">
                                    {product.technicalSpecs}
                                </pre>
                            </div>
                        )}


                        {/* Description */}
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-2">Description détaillée</h3>
                            <div className="prose prose-sm text-gray-600">
                                <p>{product.description}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recommendations Section */}
                <div className="mt-16 space-y-16">
                    {/* Complementary - Complete the Look */}
                    {complementary.length > 0 && (
                        <section>
                            <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
                                👔 Complétez votre look
                                <span className="text-sm font-normal text-gray-500 ml-2 bg-gray-100 px-2 py-1 rounded-full">Suggestions</span>
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
                                {complementary.map((item: any) => (
                                    <Link key={item.id} href={`/products/${item.id}`} className="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all">
                                        <div className="aspect-[4/5] bg-gray-100 relative overflow-hidden">
                                            <Image
                                                src={item.images?.split(',')[0]}
                                                alt={item.title}
                                                fill
                                                sizes="(max-width: 768px) 50vw, 25vw"
                                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                loading="lazy"
                                            />
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-bold text-gray-900 truncate mb-1">{item.title}</h3>
                                            <p className="text-[#006233] font-bold">{item.price.toLocaleString()} DA</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Similar Products */}
                    {similar.length > 0 && (
                        <section>
                            <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
                                ✨ Vous aimerez aussi
                                <span className="text-sm font-normal text-gray-500 ml-2 bg-gray-100 px-2 py-1 rounded-full">Similaires</span>
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
                                {similar.map((item: any) => (
                                    <Link key={item.id} href={`/products/${item.id}`} className="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all">
                                        <div className="aspect-[4/5] bg-gray-100 relative overflow-hidden">
                                            <Image
                                                src={item.images?.split(',')[0]}
                                                alt={item.title}
                                                fill
                                                sizes="(max-width: 768px) 50vw, 25vw"
                                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                loading="lazy"
                                            />
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-bold text-gray-900 truncate mb-1">{item.title}</h3>
                                            <p className="text-[#006233] font-bold">{item.price.toLocaleString()} DA</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}
                </div>

            </div>
        </div>
    );
}
