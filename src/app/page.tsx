import Link from 'next/link';
import Image from 'next/image';
import CategorySidebar from '@/components/CategorySidebar';
import SellerRating from '@/components/SellerRating';
import ProductGrid from '@/components/ProductGrid';
import HomeProductsClient from '@/components/HomeProductsClient';
import HeroBanner from '@/components/HeroBanner';
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
        take: 50, // Reduced from 100 for better performance
        include: {
          Store: true,
          Variant: true,
          Category: {
            include: {
              Category: true
            }
          },
          Review: true,
        },
        orderBy: { createdAt: 'desc' }
      }),
      search ? prisma.store.findMany({
        where: storeWhere,
        take: 50, // Limit stores in search results
        include: {
          Product: {
            include: {
              Review: true
            }
          },
          _count: {
            select: { Product: true }
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
        Product: {
          storeId: { in: Array.from(storeIds) }
        }
      },
      select: {
        rating: true,
        Product: {
          select: { storeId: true }
        }
      }
    });

    // 4. Aggregate ratings in memory (fast and efficient)
    const storeRatingsMap = new Map<string, { total: number; count: number }>();
    reviewsForStores.forEach(r => {
      const sid = r.Product.storeId;
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
          ...p.Store,
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
      {/* Hero Banner - Enhanced & Attractive */}
      {/* Hero Banner - Compact & Dynamic */}
      <HeroBanner />

      {/* Categories "Stories" - Compact */}
      <div className="container mx-auto px-4 mt-6">
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar justify-start lg:justify-center">
          {[
            { name: 'Top Nouveautés', img: '🔥', bg: 'bg-red-100', link: '/search?q=nouveau' },
            { name: 'Femmes', img: '👗', bg: 'bg-pink-100', link: '/categories/femme' },
            { name: 'Hommes', img: '👔', bg: 'bg-blue-100', link: '/categories/homme' },
            { name: 'Enfants', img: '👶', bg: 'bg-yellow-100', link: '/categories/enfant' },
            { name: 'Accessoires', img: '🎧', bg: 'bg-purple-100', link: '/categories/accessoires' },
            { name: 'High-Tech', img: '📱', bg: 'bg-gray-100', link: '/categories/electronique' },
            { name: 'Promos', img: '🏷️', bg: 'bg-green-100', link: '/search?q=promo' },
          ].map((item, i) => (
            <Link
              key={i}
              href={item.link}
              className="flex flex-col items-center gap-2 min-w-[72px] snap-start group"
            >
              <div className={`w-[60px] h-[60px] rounded-full p-[2px] bg-gradient-to-tr from-[#006233] to-yellow-400 group-hover:scale-105 transition-transform`}>
                <div className={`w-full h-full rounded-full ${item.bg} flex items-center justify-center border-2 border-white text-xl shadow-sm`}>
                  {item.img}
                </div>
              </div>
              <span className="text-[10px] sm:text-xs font-semibold text-gray-700">{item.name}</span>
            </Link>
          ))}
        </div>
      </div>



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
                              <span>{store._count.Product} produit{store._count.Product > 1 ? 's' : ''}</span>
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
