import dynamic from 'next/dynamic';
import CategoryCircles from '@/components/home/CategoryCircles';
import MobileHeader from '@/components/home/MobileHeader';
import Navbar from '@/components/Navbar';
import JsonLd, { generateOrganizationSchema } from '@/components/JsonLd';
import { prisma } from '@/lib/prisma';

// Lazy load heavy components
const HeroVideoBanner = dynamic(() => import('@/components/home/HeroVideoBanner'), {
  loading: () => <div className="h-96 bg-gradient-to-r from-emerald-50 to-green-50 animate-pulse" />,
});

const Footer = dynamic(() => import('@/components/layout/Footer'), {
  loading: () => <div className="h-64 bg-gray-50" />,
});

const ClothingProductSections = dynamic(() => import('@/components/home/ClothingProductSections'), {
  loading: () => <div className="h-96 bg-white animate-pulse" />,
});

const BottomNav = dynamic(() => import('@/components/home/BottomNav'));

export const metadata = {
  title: 'Achrilik - Shopping en Ligne Algérie | Mode, Tech & Maison',
  description: 'Découvrez les meilleures offres en Algérie. Livraison 58 Wilayas, Paiement à la livraison.',
};

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
    };
  });
}

// Fetch best sellers (top products by creation date)
async function getBestSellers() {
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
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 12
    });

    return mapProducts(products);
  } catch (error) {
    console.error('Failed to fetch best sellers:', error);
    return [];
  }
}

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
    // Using top-level category IDs (REAL IDs from database)
    const sections = [
      { id: 'cat-femme', name: 'Femme', slug: 'femmes' },
      { id: 'cat-homme', name: 'Homme', slug: 'hommes' },
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
    return await getCategoryProducts(categoryId, 8);
  } catch (error) {
    console.error('Failed to fetch maroquinerie products:', error);
    return [];
  }
}

// Fetch Accessoires products
async function getAccessoiresProducts() {
  try {
    const categoryId = '2db6a96e26fdba4431025b4a3421e48e'; // CORRECT ID from database
    return await getCategoryProducts(categoryId, 8);
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
    return await getCategoryProducts(category.id, 8);
  } catch (error) {
    console.error('Failed to fetch electronique products:', error);
    return [];
  }
}



export default async function Home() {
  const [
    banners,
    categories,
    featuredProducts,
    bestSellers,
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
    getBestSellers(),
    getNewArrivals(),
    getPromotions(),
    getClothingSections(),
    getMaroquinerieProducts(),
    getAccessoiresProducts(),
    getElectroniqueProducts()
  ]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50/30 via-white to-white">
      <JsonLd data={generateOrganizationSchema('https://achrilik.com')} />

      {/* Content - Responsive for both mobile and desktop */}
      <div className="pb-20 md:pb-8">

        {/* 1. Hero Video Banner - Compact (max 450px) */}
        <HeroVideoBanner />

        {/* 2. Category Circles */}
        <CategoryCircles />

        {/* 3. Promotions */}
        <ClothingProductSections
          sections={[{
            id: 'promotions',
            name: 'Promotions',
            slug: 'promotions',
            products: promotions
          }]}
        />

        {/* 4. Best Sellers */}
        <ClothingProductSections
          sections={[{
            id: 'best-sellers',
            name: 'Best Sellers',
            slug: 'best-sellers',
            products: bestSellers
          }]}
        />

        {/* 5. Nouveautés */}
        <ClothingProductSections
          sections={[{
            id: 'nouveautes',
            name: 'Nouveautés',
            slug: 'nouveautes',
            products: newArrivals
          }]}
        />

        {/* 6. Vêtements Sections (Femme, Homme, Enfants) */}
        <ClothingProductSections sections={clothingSections} />

        {/* 7. Maroquinerie */}
        <ClothingProductSections
          sections={[{
            id: 'maroquinerie',
            name: 'Maroquinerie',
            slug: 'maroquinerie',
            products: maroquinerieProducts
          }]}
        />

        {/* 8. Accessoires */}
        <ClothingProductSections
          sections={[{
            id: 'accessoires',
            name: 'Accessoires',
            slug: 'accessoires',
            products: accessoiresProducts
          }]}
        />

        {/* 9. Électronique */}
        <ClothingProductSections
          sections={[{
            id: 'electronique',
            name: 'Électronique',
            slug: 'electronique',
            products: elektroniqueProducts
          }]}
        />

        {/* 9. Footer */}
        <Footer />

        {/* 10. Bottom Navigation - Mobile Only */}
        <div className="md:hidden">
          <BottomNav />
        </div>
      </div>

    </main>
  );
}
