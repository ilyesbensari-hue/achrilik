import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import ReviewList from '@/components/ReviewList';
import ReviewForm from '@/components/ReviewForm';
import SellerRating from '@/components/SellerRating';
import ProductPageClient from './ProductPageClient';
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
                store: true,
                category: true,
                reviews: true,
                variants: true
            }
        });
        return product;
    } catch (error) {
        console.error('Failed to fetch product:', error);
        return null;
    }
}

async function getRecommendations(currentProduct: any) {
    if (!currentProduct?.category) return { similar: [], complementary: [] };

    // 1. Similar Products (Same Category)
    const similar = await prisma.product.findMany({
        where: {
            categoryId: currentProduct.categoryId,
            id: { not: currentProduct.id }
        },
        take: 4,
        include: { store: true }
    });

    // 2. Complementary Products
    let complementary: any[] = [];
    const currentSlug = currentProduct.category.slug.toLowerCase();

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
                category: {
                    slug: { in: targetSlugs }
                },
                id: { not: currentProduct.id }
            },
            take: 4,
            include: { store: true }
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

    const sizes = Array.from(new Set(product.variants?.map((v: any) => v.size) || [])) as string[];
    const colors = Array.from(new Set(product.variants?.map((v: any) => v.color) || [])) as string[];
    const images = product.images ? product.images.split(',') : [];

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container">
                {/* Breadcrumb */}
                <nav className="mb-8 flex items-center gap-2 text-sm text-gray-600">
                    <Link href="/" className="hover:text-indigo-600">Accueil</Link>
                    <span>/</span>
                    <Link href={`/?category=${product.category?.slug}`} className="hover:text-indigo-600">{product.category?.name}</Link>
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
                            <Link href={`/stores/${product.store.id}`} className="flex items-center gap-3 transition-opacity hover:opacity-80">
                                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                    {product.store.name[0]}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <p className="font-semibold text-gray-900 hover:text-indigo-600 underline decoration-dotted">{product.store.name}</p>
                                        <SellerRating rating={0} count={0} size="sm" />
                                    </div>
                                    <p className="text-gray-500">📍 {product.store.city} <span className="text-xs text-indigo-500">(Voir la boutique)</span></p>
                                </div>
                            </Link>
                        </div>

                        {/* Title & Price */}
                        <div>
                            <h1 className="text-2xl md:text-4xl font-black text-gray-900 mb-3">{product.title}</h1>

                            {/* Product Rating Stars */}
                            {product.reviews && product.reviews.length > 0 && (
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="flex text-yellow-400 text-lg">
                                        {(() => {
                                            const avg = product.reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / product.reviews.length;
                                            return Array.from({ length: 5 }).map((_, i) => (
                                                <span key={i}>{i < Math.round(avg) ? '★' : '☆'}</span>
                                            ));
                                        })()}
                                    </div>
                                    <span className="text-sm text-gray-500 font-medium">({product.reviews.length} avis)</span>
                                </div>
                            )}

                            <div className="flex items-baseline gap-3">
                                <span className="text-4xl font-black text-indigo-600">{product.price.toLocaleString()} DA</span>
                                {product.category && (
                                    <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm font-semibold rounded-full">
                                        {product.category.name}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Description */}
                        <div className="prose prose-sm text-gray-600 border-t border-b py-6">
                            <p>{product.description}</p>
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

                {/* Reviews Section */}
                <div className="mt-16 grid lg:grid-cols-3 gap-12 border-t pt-12">
                    <div className="lg:col-span-1">
                        <ReviewForm productId={product.id} />
                    </div>
                    <div className="lg:col-span-2">
                        <ReviewList productId={product.id} />
                    </div>
                </div>
            </div>
        </div>
    );
}
