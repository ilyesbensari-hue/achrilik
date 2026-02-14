import dynamic from 'next/dynamic';
import CategoryCircles from '@/components/home/CategoryCircles';
import MobileHeader from '@/components/home/MobileHeader';
import Navbar from '@/components/Navbar';
import JsonLd, { generateOrganizationSchema } from '@/components/JsonLd';
import { prisma } from '@/lib/prisma';
import HeroSection from '@/components/HeroSection';

// Lazy load heavy components
const HeroVideoBanner = dynamic(() => import('@/components/home/HeroVideoBanner'), {
  loading: () => <div className="h-96 bg-gradient-to-r from-emerald-50 to-green-50 animate-pulse" />,
});

const ClothingProductSections = dynamic(() => import('@/components/home/ClothingProductSections'), {
  loading: () => <div className="h-96 bg-white animate-pulse" />,
});

const BottomNav = dynamic(() => import('@/components/home/BottomNav'));

export const metadata = {
  title: 'Achrilik - Shopping en Ligne Algérie | Mode, Tech & Maison',
  description: 'Découvrez les meilleures offres en Algérie. Livraison 58 Wilayas, Paiement à la livraison.',
};

// Force dynamic rendering to enable searchParams filtering
export const dynamic = 'force-dynamic';

// Fetch top-level categories
async function getTopLevelCategories() {
  try {
    const categories = await prisma.category.findMany({
      where: {
        parentId: null,
      },
      orderBy: {
        name: 'asc'
      },
      take: 8
    });
    return categories;
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return [];
  }
}

// Fetch active banners for promotions carousel
async function getActiveBanners() {
  try {
    const banners = await prisma.banner.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' }
    });
    return banners;
  } catch (error) {
    console.error('Failed to fetch banners:', error);
    return [];
  }
}

// Fetch featured products for promotions banner
async function getFeaturedProducts() {
  try {
    const products = await prisma.product.findMany({
      where: {
        status: 'APPROVED',
        Store: {
          verified: true
        },
        OR: [
          { promotionLabel: { not: null } },
          { discountPrice: { not: null } }
        ]
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 3
    });

    return products.map(p => {
      const images = p.images ? p.images.split(',') : [];
      return {
        id: p.id,
        title: p.title,
        image: images[0] || '/placeholder-product.png',
      };
    });
  } catch (error) {
    console.error('Failed to fetch featured products:', error);
    return [];
  }
}

// Helper function to map products
function mapProducts(products: any[]) {
  return products.map(p => {
    const images = p.images ? p.images.split(',') : [];
    return {
      id: p.id,
      title: p.title,
      price: p.price,
      discountPrice: p.discountPrice,
      promotionLabel: p.promotionLabel,
      image: images[0] || '/placeholder-product.png',
      categoryName: p.Category?.name || 'Produit',
      createdAt: p.createdAt,
      Store: p.Store ? {
        name: p.Store.name,
        city: p.Store.city,
        offersFreeDelivery: p.Store.offersFreeDelivery,
        freeDeliveryThreshold: p.Store.freeDeliveryThreshold
      } : undefined
    };
  });
}

// getBestSellers function removed - Best Seller feature discontinued

// Fetch new arrivals (newest products)
async function getNewArrivals() {
  try {
    const products = await prisma.product.findMany({
      where: {
        status: 'APPROVED',
        Store: {
          verified: true
        }
      },
      select: {
        id: true,
        title: true,
        price: true,
        discountPrice: true,
        promotionLabel: true,
        images: true,
        createdAt: true,
        Category: {
          select: {
            name: true,
          },
        },
        Store: {
          select: {
            name: true,
            city: true,
            offersFreeDelivery: true,
            freeDeliveryThreshold: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 12
    });

    return mapProducts(products);
  } catch (error) {
    console.error('Failed to fetch new arrivals:', error);
    return [];
  }
}

// Fetch promotions (products with active discounts or promotion labels)
async function getPromotions() {
  try {
    const products = await prisma.product.findMany({
      where: {
        status: 'APPROVED',
        Store: {
          verified: true
        },
        OR: [
          {
            discountPrice: {
              not: null
            }
          },
          {
            promotionLabel: {
              not: null
            }
          }
        ]
      },
      select: {
        id: true,
        title: true,
        price: true,
        discountPrice: true,
        promotionLabel: true,
        images: true,
        createdAt: true,
        Category: {
          select: {
            name: true,
          },
        },
        Store: {
          select: {
            name: true,
            city: true,
            offersFreeDelivery: true,
            freeDeliveryThreshold: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 12
    });

    // Filter to include:
    // 1. Products with valid discountPrice < price
    // 2. Products with promotionLabel (even without discount)
    const filteredProducts = products.filter(p => {
      const hasDiscount = p.discountPrice && p.discountPrice < p.price;
      const hasPromoLabel = p.promotionLabel && p.promotionLabel.trim() !== '';
      return hasDiscount || hasPromoLabel;
    });

    return mapProducts(filteredProducts);
  } catch (error) {
    console.error('Failed to fetch promotions:', error);
    return [];
  }
}

// Helper: Recursively get all descendant category IDs
async function getAllDescendantCategoryIds(categoryId: string): Promise<string[]> {
  const childCategories = await prisma.category.findMany({
    where: { parentId: categoryId },
    select: { id: true }
  });

  if (childCategories.length === 0) {
    return [categoryId];
  }

  // Recursively get descendants of each child
  const descendantIds = await Promise.all(
    childCategories.map(child => getAllDescendantCategoryIds(child.id))
  );

  // Flatten and include current category
  return [categoryId, ...descendantIds.flat()];
}

// Helper: Get products for a category and ALL its descendants (recursive)
async function getCategoryProducts(categoryId: string, limit: number = 8) {
  try {
    // Get all descendant category IDs recursively
    const categoryIds = await getAllDescendantCategoryIds(categoryId);

    // Fetch products in these categories
    const products = await prisma.product.findMany({
      where: {
        categoryId: { in: categoryIds },
        status: 'APPROVED',
        Store: {
          verified: true
        }
      },
      select: {
        id: true,
        title: true,
        price: true,
        discountPrice: true,
        promotionLabel: true,
        images: true,
        createdAt: true,
        Category: {
          select: {
            name: true,
          },
        },
        Store: {
          select: {
            name: true,
            city: true,
            offersFreeDelivery: true,
            freeDeliveryThreshold: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    });

    return mapProducts(products);
  } catch (error) {
    console.error(`Failed to fetch products for category ${categoryId}:`, error);
    return [];
  }
}

// Fetch clothing sections (Femme, Homme, Enfants) with products
async function getClothingSections() {
  try {
    // Using top-level category IDs (REAL IDs from database - verified in Prisma Studio Feb 9 2026)
    const sections = [
      { id: '9affd04aa8ebc8631587f7d3d7f76e3a', name: 'Femme', slug: 'femmes' }, // Vêtements Femme - 16 children
      { id: '7978b971816bcebcb3734e4aade82620', name: 'Homme', slug: 'hommes' }, // Vêtements Homme - 14 children
      { id: 'a041678aa693e0f26bb81f6d0046f7be', name: 'Enfant', slug: 'enfants' }
    ];

    const sectionsWithProducts = await Promise.all(
      sections.map(async (section) => {
        // getCategoryProducts includes all descendant categories recursively
        const products = await getCategoryProducts(section.id, 8);
        return {
          id: section.id,
          name: section.name,
          slug: section.slug,
          products
        };
      })
    );

    // Filter out sections with no products
    return sectionsWithProducts.filter(section => section.products.length > 0);
  } catch (error) {
    console.error('Failed to fetch clothing sections:', error);
    return [];
  }
}

// Fetch Maroquinerie products
async function getMaroquinerieProducts() {
  try {
    const categoryId = '071afaec3544214899128fe1293330e6'; // CORRECT ID from database
    return await getCategoryProducts(categoryId, 20); // Increased from 8 to show all products
  } catch (error) {
    console.error('Failed to fetch maroquinerie products:', error);
    return [];
  }
}

// Fetch Accessoires products
async function getAccessoiresProducts() {
  try {
    const categoryId = '2db6a96e26fdba4431025b4a3421e48e'; // CORRECT ID from database
    return await getCategoryProducts(categoryId, 20); // Increased from 8
  } catch (error) {
    console.error('Failed to fetch accessoires products:', error);
    return [];
  }
}

// Fetch Électronique products
async function getElectroniqueProducts() {
  try {
    // Find Électronique category in DB
    const category = await prisma.category.findFirst({
      where: { slug: 'electronique' }
    });
    if (!category) return [];
    return await getCategoryProducts(category.id, 20); // Increased from 8
  } catch (error) {
    console.error('Failed to fetch electronique products:', error);
    return [];
  }
}



export default async function Home({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const [
    banners,
    categories,
    featuredProducts,
    newArrivals,
    promotions,
    clothingSections,
    maroquinerieProducts,
    accessoiresProducts,
    elektroniqueProducts
  ] = await Promise.all([
    getActiveBanners(),
    getTopLevelCategories(),
    getFeaturedProducts(),
    getNewArrivals(),
    getPromotions(),
    getClothingSections(),
    getMaroquinerieProducts(),
    getAccessoiresProducts(),
    getElectroniqueProducts()
  ]);

  // Filter sections based on category query parameter (for breadcrumb navigation)
  const categoryFilter = searchParams.category;
  const filteredClothingSections = categoryFilter
    ? clothingSections.filter(s => s.slug === categoryFilter)
    : clothingSections;

  const shouldShowMaroquinerie = !categoryFilter || categoryFilter === 'maroquinerie';
  const shouldShowAccessoires = !categoryFilter || categoryFilter === 'accessoires';
  const shouldShowElectronique = !categoryFilter || categoryFilter === 'electronique';
  const shouldShowPromotions = !categoryFilter || categoryFilter === 'promotions';
  const shouldShowNouveautes = !categoryFilter || categoryFilter === 'nouveautes';

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50/30 via-white to-white">
      <JsonLd data={generateOrganizationSchema('https://achrilik.com')} />

      {/* Content - Responsive for both mobile and desktop */}
      <div className="pb-20 md:pb-8">

        {/* 1. Hero Video Banner - Compact (max 450px) */}
        <HeroVideoBanner />

        {/* 1.5. Hero Section avec Features */}
        <HeroSection />

        {/* 2. Category Circles */}
        <CategoryCircles />

        {/* 3. Promotions */}
        {shouldShowPromotions && (
          <ClothingProductSections
            sections={[{
              id: 'promotions',
              name: 'Promotions',
              slug: 'promotions',
              products: promotions,
              customHref: '/promotions'
            }]}
          />
        )}

        {/* Best Sellers section removed */}

        {/* 5. Nouveautés */}
        {shouldShowNouveautes && (
          <ClothingProductSections
            sections={[{
              id: 'nouveautes',
              name: 'Nouveautés',
              slug: 'nouveautes',
              products: newArrivals,
              customHref: '/nouveautes' // FIX: Direct route instead of /categories/nouveautes
            }]}
          />
        )}

        {/* 6. Vêtements Sections (Femme, Homme, Enfants) */}
        {filteredClothingSections.length > 0 && (
          <ClothingProductSections sections={filteredClothingSections} />
        )}

        {/* 7. Maroquinerie */}
        {shouldShowMaroquinerie && (
          <ClothingProductSections
            sections={[{
              id: 'maroquinerie',
              name: 'Maroquinerie',
              slug: 'maroquinerie',
              products: maroquinerieProducts
            }]}
          />
        )}

        {/* 8. Accessoires */}
        {shouldShowAccessoires && (
          <ClothingProductSections
            sections={[{
              id: 'accessoires',
              name: 'Accessoires',
              slug: 'accessoires',
              products: accessoiresProducts
            }]}
          />
        )}

        {/* 9. Électronique */}
        {shouldShowElectronique && (
          <ClothingProductSections
            sections={[{
              id: 'electronique',
              name: 'Électronique',
              slug: 'electronique',
              products: elektroniqueProducts
            }]}
          />
        )}

        {/* 10. Bottom Navigation - Mobile Only */}
        <div className="md:hidden">
          <BottomNav />
        </div>
      </div>

    </main>
  );
}
