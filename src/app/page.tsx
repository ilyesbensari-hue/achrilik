import Link from 'next/link';
import Image from 'next/image';
import CategorySidebar from '@/components/CategorySidebar';
import SellerRating from '@/components/SellerRating';
import ProductGrid from '@/components/ProductGrid';
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
      {/* Hero Banner */}
      <section className="relative min-h-[500px] lg:h-[600px] bg-gradient-to-br from-[#e8f5f0] via-white to-[#e8f5f0] overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-bl from-[#cce8dd]/50 to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-1/2 h-full bg-gradient-to-tr from-[#e8f5f0]/50 to-transparent"></div>
        </div>
        <div className="container h-full flex items-center justify-center relative z-10">
          <div className="text-center max-w-4xl px-4">
            <div className="flex justify-center mb-8">
              <Image
                src="/achrilik-logo.png"
                alt="Achrilik Logo"
                width={192} // w-48 = 192px
                height={80}
                className="w-48 h-auto object-contain animate-fade-in"
                priority
              />
            </div>
            <div className="inline-block px-4 py-2 bg-[#f8d7dd] text-[#D21034] rounded-full text-sm font-semibold mb-6 animate-fade-in">
              ✨ E-commerce à Oran
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-8xl font-black mb-6 tracking-tight animate-fade-in">
              <span className="bg-gradient-to-r from-[#004d28] via-[#006233] to-[#006233] bg-clip-text text-transparent">
                Achrilik
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-10 text-gray-700 font-light">
              Découvrez la mode à Oran - Achetez local, livraison rapide
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/categories/femmes" className="bg-gradient-to-r from-[#006233] to-[#004d28] text-white px-6 py-3 md:px-10 md:py-4 rounded-xl font-semibold hover:from-[#004d28] hover:to-[#006233] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                Explorer la Collection
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
              <>
                {/* Featured / All Products Mixed (Initial Attraction) */}
                <section className="pb-12">
                  <div className="mb-8">
                    <h2 className="text-3xl font-black mb-2">🔥 Nouveautés</h2>
                    <p className="text-gray-600">Les derniers articles ajoutés</p>
                  </div>
                  <ProductGrid products={products.slice(0, 12)} />
                </section>

                {/* Femmes */}
                <section className="pb-16 border-t border-gray-100 pt-12">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4 sm:gap-0">
                    <div>
                      <h2 className="text-2xl font-bold mb-1">👗 Mode Femme</h2>
                    </div>
                    <Link href="/categories/femmes" className="text-[#006233] font-semibold hover:underline">
                      Voir tout →
                    </Link>
                  </div>
                  <ProductGrid
                    products={products.filter(p => p.category?.slug.includes('femmes') || p.category?.parent?.slug.includes('femmes')).slice(0, 4)}
                  />
                </section>

                {/* Hommes */}
                <section className="pb-16 border-t border-gray-100 pt-12">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4 sm:gap-0">
                    <div>
                      <h2 className="text-2xl font-bold mb-1">👔 Mode Homme</h2>
                    </div>
                    <Link href="/categories/hommes" className="text-[#006233] font-semibold hover:underline">
                      Voir tout →
                    </Link>
                  </div>
                  <ProductGrid
                    products={products.filter(p => p.category?.slug.includes('hommes') || p.category?.slug.includes('homme') || p.category?.parent?.slug.includes('hommes') || p.category?.parent?.slug.includes('homme')).slice(0, 4)}
                  />
                </section>

                {/* Enfants */}
                <section className="pb-16 border-t border-gray-100 pt-12">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4 sm:gap-0">
                    <div>
                      <h2 className="text-2xl font-bold mb-1">👶 Mode Enfant</h2>
                    </div>
                    <Link href="/categories/enfants" className="text-[#006233] font-semibold hover:underline">
                      Voir tout →
                    </Link>
                  </div>
                  <ProductGrid
                    products={products.filter(p => p.category?.slug === 'enfants' || p.category?.parent?.slug === 'enfants').slice(0, 4)}
                  />
                </section>

                {/* Accessoires */}
                <section className="pb-16 border-t border-gray-100 pt-12">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4 sm:gap-0">
                    <div>
                      <h2 className="text-2xl font-bold mb-1">👜 Accessoires</h2>
                    </div>
                    <Link href="/categories/accessoires" className="text-[#006233] font-semibold hover:underline">
                      Voir tout →
                    </Link>
                  </div>
                  <ProductGrid
                    products={products.filter(p => p.category?.slug === 'accessoires' || p.category?.parent?.slug === 'accessoires').slice(0, 4)}
                  />
                </section>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
