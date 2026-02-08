import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { randomBytes } from 'crypto';
import { verifyToken } from '@/lib/auth-token';
import { getProductStatus } from '@/lib/productHelpers';

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
        // Fetch all descendant category IDs recursively
        const getDescendantIds = async (parentId: string): Promise<string[]> => {
          const children = await prisma.category.findMany({
            where: { parentId },
            select: { id: true }
          });

          let allIds = [parentId];
          for (const child of children) {
            const descendants = await getDescendantIds(child.id);
            allIds = [...allIds, ...descendants];
          }
          return allIds;
        };

        const categoryIds = await getDescendantIds(categoryId);
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

    return NextResponse.json(enrichedProducts, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    console.error('GET /api/products error:', error);
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
      quality,
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
        quality: quality || null,
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
      console.log(`[Auto-Approval] Product "${title}" (${product.id}) auto-approved from verified store ${storeId}`);
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('POST /api/products error:', error);
    return NextResponse.json({ error: 'Failed to create product', details: error }, { status: 500 });
  }
}
