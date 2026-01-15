import Link from 'next/link';
import Image from 'next/image';
import CategorySidebar from '@/components/CategorySidebar';
import SellerRating from '@/components/SellerRating';
import ProductGrid from '@/components/ProductGrid';
import HomeProductsClient from '@/components/HomeProductsClient';
import { prisma } from '@/lib/prisma';

// Enable ISR with 60 second revalidation
export const revalidate = 60;

async function getProductsAndStores(search?: string) {
  try {
    const where: any = {};
    const storeWhere: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];

      storeWhere.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } }
      ];
    }

    // 1. Fetch raw data with LIMITS to prevent over-fetching
    const [productsRaw, storesRaw] = await Promise.all([
      prisma.product.findMany({
        where,
        take: 100, // Limit to 100 products for performance
        include: {
          store: true,
          variants: true,
          category: {
            include: {
              parent: true
            }
          },
          reviews: true,
        },
        orderBy: { createdAt: 'desc' }
      }),
      search ? prisma.store.findMany({
        where: storeWhere,
        take: 50, // Limit stores in search results
        include: {
          products: {
            include: {
              reviews: true
            }
          },
          _count: {
            select: { products: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }) : []
    ]);

    // 2. Get all unique store IDs
    const storeIds = new Set([
      ...productsRaw.map(p => p.storeId),
      ...storesRaw.map(s => s.id)
    ]);

    // 3. Fetch reviews for these stores (single optimized query)
    const reviewsForStores = await prisma.review.findMany({
      where: {
        product: {
          storeId: { in: Array.from(storeIds) }
        }
      },
      select: {
        rating: true,
        product: {
          select: { storeId: true }
        }
      }
    });

    // 4. Aggregate ratings in memory (fast and efficient)
    const storeRatingsMap = new Map<string, { total: number; count: number }>();
    reviewsForStores.forEach(r => {
      const sid = r.product.storeId;
      const current = storeRatingsMap.get(sid) || { total: 0, count: 0 };
      storeRatingsMap.set(sid, {
        total: current.total + r.rating,
        count: current.count + 1
      });
    });

    // 5. Enrich Products with store ratings
    const products = productsRaw.map(p => {
      const stats = storeRatingsMap.get(p.storeId) || { total: 0, count: 0 };
      const avg = stats.count > 0 ? stats.total / stats.count : 0;
      return {
        ...p,
        store: {
          ...p.store,
          averageRating: avg,
          reviewCount: stats.count
        }
      };
    });

    // 6. Enrich Stores with ratings
    const stores = storesRaw.map(s => {
      const stats = storeRatingsMap.get(s.id) || { total: 0, count: 0 };
      const avg = stats.count > 0 ? stats.total / stats.count : 0;
      return {
        ...s,
        averageRating: avg,
        reviewCount: stats.count
      };
    });

    return { products, stores };
  } catch (error) {
    console.error('Failed to fetch products and stores', error);
    return { products: [], stores: [] };
  }
}

export default async function Home(props: { searchParams: Promise<{ search?: string }> }) {
  const searchParams = await props.searchParams;
  const search = searchParams.search;
  const { products, stores } = await getProductsAndStores(search);

  // Split products into featured/new for better display
  const featuredProducts = products.slice(0, 8);

  return (
    <div className="min-h-screen">
      {/* Hero Banner - Minimalist */}
      <section className="relative min-h-[400px] lg:h-[500px] bg-white border-b border-gray-100">
        <div className="container h-full flex items-center justify-center relative z-10">
          <div className="text-center max-w-3xl px-4">
            <div className="flex justify-center mb-6">
              <Image
                src="/achrilik-logo.png"
                alt="Achrilik Logo"
                width={128}
                height={53}
                className="w-32 h-auto object-contain"
                priority
              />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 tracking-tight text-black">
              Achrilik
            </h1>
            <p className="text-lg md:text-xl mb-8 text-gray-600 font-light">
              Mode à Oran - Achetez local, livraison rapide
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/categories/femmes" className="border-2 border-black text-black px-8 py-3 rounded-md font-medium hover:bg-black hover:text-white transition-all">
                Explorer
              </Link>
            </div>
          </div>
        </div>
      </section>



      {/* Main Layout with Sidebar */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Left Sidebar */}
          <CategorySidebar />

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Products by Category or Search */}
            {search ? (
              <section className="pb-20">
                <h2 className="text-3xl font-black mb-10">Résultats pour "{search}"</h2>

                {/* Stores Results */}
                {stores.length > 0 && (
                  <div className="mb-12">
                    <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                      <span>🏪</span> Vendeurs trouvés ({stores.length})
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                      {stores.map((store: any) => (
                        <Link
                          href={`/stores/${store.id}`}
                          key={store.id}
                          className="block p-6 bg-white border-2 border-gray-200 rounded-xl hover:border-[#006233] hover:shadow-lg transition-all group"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="text-lg font-bold group-hover:text-[#006233] transition-colors">{store.name}</h4>
                              <div className="mt-1">
                                <SellerRating rating={store.averageRating || 0} count={store.reviewCount || 0} size="sm" />
                              </div>
                            </div>
                            <span className="text-2xl">🏪</span>
                          </div>
                          {store.description && (
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{store.description}</p>
                          )}
                          <div className="space-y-1 text-sm">
                            {store.city && (
                              <div className="flex items-center gap-2 text-gray-700">
                                <span>📍</span>
                                <span>{store.city}</span>
                              </div>
                            )}
                            {store.address && (
                              <div className="flex items-center gap-2 text-gray-600 text-xs">
                                <span>{store.address}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-[#006233] font-medium mt-3">
                              <span>📦</span>
                              <span>{store._count.products} produit{store._count.products > 1 ? 's' : ''}</span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Products Results */}
                {products.length === 0 && stores.length === 0 ? (
                  <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <p className="text-gray-500 text-lg mb-4">Aucun résultat trouvé.</p>
                  </div>
                ) : products.length > 0 ? (
                  <>
                    <ProductGrid products={products} title="👕 Produits trouvés" />
                  </>
                ) : null}
              </section>
            ) : (
              <HomeProductsClient products={products} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
