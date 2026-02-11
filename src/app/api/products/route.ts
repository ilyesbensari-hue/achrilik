import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { randomBytes } from 'crypto';
import { verifyToken } from '@/lib/auth-token';
import { getProductStatus } from '@/lib/productHelpers';
import { revalidatePath } from 'next/cache';
import { parseSafeInt } from '@/lib/parseHelpers';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('storeId');
    const search = searchParams.get('search');
    const showAll = searchParams.get('showAll'); // For admin/seller to see all products

    const whereClause: any = {
      // By default, only show APPROVED products to regular users
      status: showAll === 'true' ? undefined : 'APPROVED'
    };

    if (storeId) whereClause.storeId = storeId;

    // Add Category filtering with optional recursive children
    const categoryId = searchParams.get('categoryId');
    const includeChildren = searchParams.get('includeChildren') === 'true';

    if (categoryId) {
      if (includeChildren) {
        // FIX Bug #6: N+1 Query - Fetch all categories once
        const allCategories = await prisma.category.findMany({
          select: { id: true, parentId: true }
        });

        const buildTree = (pid: string): string[] => {
          const children = allCategories.filter(c => c.parentId === pid);
          return [pid, ...children.flatMap(c => buildTree(c.id))];
        };

        const categoryIds = buildTree(categoryId);
        whereClause.categoryId = { in: categoryIds };
      } else {
        whereClause.categoryId = categoryId;
      }
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    // ===== ADVANCED FILTERS =====

    // Price Range Filter - FIX Bug #4: parseInt validation
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const parsedMinPrice = parseSafeInt(minPrice);
    const parsedMaxPrice = parseSafeInt(maxPrice);

    if (parsedMinPrice !== undefined || parsedMaxPrice !== undefined) {
      whereClause.price = {
        ...(parsedMinPrice !== undefined && { gte: parsedMinPrice }),
        ...(parsedMaxPrice !== undefined && { lte: parsedMaxPrice }),
      };
    }

    // Size Filter (multi-select)
    const sizes = searchParams.get('sizes')?.split(',').filter(Boolean);
    if (sizes && sizes.length > 0) {
      whereClause.Variant = {
        some: {
          size: { in: sizes }
        }
      };
    }

    // Color Filter (multi-select)
    const colors = searchParams.get('colors')?.split(',').filter(Boolean);
    if (colors && colors.length > 0) {
      whereClause.Variant = {
        some: {
          ...(whereClause.Variant?.some || {}),
          color: { in: colors }
        }
      };
    }

    // Wilaya Filter (multi-select for store location)
    const wilayas = searchParams.get('wilayas')?.split(',').filter(Boolean);
    if (wilayas && wilayas.length > 0) {
      whereClause.Store = {
        ...(whereClause.Store || {}),
        wilaya: { in: wilayas }
      };
    }

    // Free Delivery Filter
    const freeDelivery = searchParams.get('freeDelivery') === 'true';
    if (freeDelivery) {
      whereClause.Store = {
        ...(whereClause.Store || {}),
        offersFreeDelivery: true
      };
    }

    // Click & Collect Filter
    const clickCollect = searchParams.get('clickCollect') === 'true';
    if (clickCollect) {
      whereClause.Store = {
        ...(whereClause.Store || {}),
        clickCollect: true
      };
    }

    // Note: Seller rating will be filtered post-query since it's calculated dynamically


    const products = await prisma.product.findMany({
      where: whereClause,
      // Removed limit to allow client-side filtering of all products
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        Variant: true,
        Store: true,
        Category: true,
        Review: true,
      },
    });

    // Calculate store ratings
    const storeIds = new Set(products.map(p => p.storeId));

    // Fetch all reviews for these stores
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

    const storeRatingsMap = new Map<string, { total: number; count: number }>();
    reviewsForStores.forEach(r => {
      const sid = r.Product.storeId;
      const current = storeRatingsMap.get(sid) || { total: 0, count: 0 };
      storeRatingsMap.set(sid, {
        total: current.total + r.rating,
        count: current.count + 1
      });
    });

    const enrichedProducts = products.map(p => {
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

    // ===== POST-QUERY FILTERS =====

    // Seller Rating Filter (applied after calculation)
    const minRating = searchParams.get('minRating');
    let filteredProducts = enrichedProducts;

    if (minRating && parseFloat(minRating) > 0) {
      const minRatingValue = parseFloat(minRating);
      filteredProducts = enrichedProducts.filter(p =>
        p.store.averageRating >= minRatingValue
      );
    }

    return NextResponse.json(filteredProducts, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    logger.error('GET /api/products error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await verifyToken(token);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Strict Role Check - Safe includes
    const userRoles = user.roles || [];
    const isSeller = (Array.isArray(userRoles) && userRoles.includes('SELLER')) || user.role === 'SELLER';
    if (!isSeller) {
      return NextResponse.json({ error: 'Must be a SELLER to create products' }, { status: 403 });
    }

    const body = await request.json();
    const {
      title,
      description,
      price,
      images,
      storeId,
      categoryId,
      variants,
      promotionLabel,
      cutType,
      sizeGuide,
      countryOfManufacture,
      composition
      // NOTE: isNew, isTrending, isBestSeller sont ignorés - calculés automatiquement
    } = body;

    // Verify Store Ownership (Optional but recommended, requires DB call. For now, we trust the token+role)
    // Ideally: const store = await prisma.store.findUnique({ where: { id: storeId } });
    // if (store.ownerId !== user.id) throw new Error("Not your store");

    // Validate required fields
    if (!categoryId) {
      return NextResponse.json({ error: 'La catégorie est obligatoire' }, { status: 400 });
    }

    // Badges automatiques lors de la création
    const badges = {
      isNew: true,  // Toujours true lors de la création
      isTrending: false,  // Géré uniquement par admin
      isBestSeller: false  // Calculé ultérieurement basé sur les ventes
    };

    // Auto-approve products from verified stores
    const productStatus = await getProductStatus(storeId);

    const product = await prisma.product.create({
      data: {
        id: randomBytes(16).toString('hex'),
        title,
        description,
        price: parseFloat(price),
        images: images, // Comma separated string
        storeId,
        categoryId,
        status: productStatus, // Auto-approved if store is verified, PENDING otherwise
        promotionLabel: promotionLabel || null,
        cutType: cutType || null,
        sizeGuide: sizeGuide || null,
        countryOfManufacture: countryOfManufacture || null,
        composition: composition || null,
        // Badges automatiques
        ...badges,
        Variant: {
          create: variants.map((v: any) => ({
            id: randomBytes(16).toString('hex'),
            size: v.size,
            color: v.color,
            stock: parseInt(v.stock),
          })),
        },
      },
      include: {
        Variant: true,
        Category: true,
      },
    });

    // Log auto-approval for monitoring
    if (productStatus === 'APPROVED') {
      logger.log(`[Auto-Approval] Product "${title}" (${product.id}) auto-approved from verified store ${storeId}`);

      // Invalidate homepage cache so new product appears immediately
      revalidatePath('/');
      revalidatePath('/categories/[slug]', 'page');
      revalidatePath('/nouveautes');
    }

    return NextResponse.json(product);
  } catch (error) {
    logger.error('POST /api/products error:', error);
    return NextResponse.json({ error: 'Failed to create product', details: error }, { status: 500 });
  }
}
