import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { randomBytes } from 'crypto';
import { verifyToken } from '@/lib/auth-token';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        Variant: true,
        Store: true,
        Category: true,
        Review: {
          include: {
            User: {
              select: {
                name: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Calculate store rating efficiently
    const storeReviews = await prisma.review.findMany({
      where: {
        Product: {
          storeId: product.storeId
        }
      },
      select: {
        rating: true
      }
    });

    const totalRating = storeReviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = storeReviews.length > 0 ? totalRating / storeReviews.length : 0;

    const enrichedProduct = {
      ...product,
      store: {
        ...product.Store,
        averageRating,
        reviewCount: storeReviews.length
      }
    };

    return NextResponse.json(enrichedProduct);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await verifyToken(token);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Check ownership
    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: { Store: true, Category: true }
    });

    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    if (user.role !== 'ADMIN' && existingProduct.Store.ownerId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const {
      title, description, price, images, categoryId, variants, promotionLabel,
      cutType, sizeGuide, countryOfManufacture, composition,
      material, fit, neckline, pattern, careInstructions, brand,
      isNew, isTrending, isBestSeller  // Ces valeurs ne seront utilisées que si admin
    } = body;

    // Importer les helpers de badges
    const { isProductNew, isProductBestSeller } = await import('@/lib/badge-helpers');

    // Calculer les badges selon le rôle
    const badges = user.role === 'ADMIN' ? {
      // Admin peut override manuellement
      isNew: isNew !== undefined ? isNew : existingProduct.isNew,
      isTrending: isTrending !== undefined ? isTrending : existingProduct.isTrending,
      isBestSeller: isBestSeller !== undefined ? isBestSeller : existingProduct.isBestSeller
    } : {
      // Vendeur: calcul automatique
      isNew: isProductNew(existingProduct.createdAt),
      isBestSeller: await isProductBestSeller(id),
      isTrending: existingProduct.isTrending  // Reste inchangé (admin only)
    };

    // Update product and handle variants safely
    const product = await prisma.$transaction(async (tx) => {
      // Get existing variants
      const existingVariants = await tx.variant.findMany({
        where: { productId: id },
        include: {
          OrderItem: true
        }
      });

      // Separate variants into those with and without orders
      const variantsWithOrders = existingVariants.filter(v => v.OrderItem.length > 0);
      const variantsWithoutOrders = existingVariants.filter(v => v.OrderItem.length === 0);

      // Delete only variants that are NOT linked to any orders
      if (variantsWithoutOrders.length > 0) {
        await tx.variant.deleteMany({
          where: {
            id: { in: variantsWithoutOrders.map(v => v.id) }
          },
        });
      }

      // Update product with new variants
      return await tx.product.update({
        where: { id },
        data: {
          title,
          description,
          price: parseFloat(price),
          images,
          categoryId: categoryId || null,
          promotionLabel: promotionLabel || null,
          cutType: cutType || null,
          sizeGuide: sizeGuide || null,
          countryOfManufacture: countryOfManufacture || null,
          composition: composition || null,
          material: material || null,
          fit: fit || null,
          neckline: neckline || null,
          pattern: pattern || null,
          careInstructions: careInstructions || null,
          brand: brand || null,
          // Badges calculés selon le rôle
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
    });

    // Revalidate cache after product update
    try {
      const oldCategorySlug = existingProduct.Category?.slug;
      const newCategory = await prisma.category.findUnique({
        where: { id: categoryId },
        select: { slug: true }
      });

      // Call revalidation API
      await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/admin/revalidate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Cookie': `auth_token=${token}` },
        body: JSON.stringify({
          paths: [
            '/',
            `/products/${id}`,
            oldCategorySlug ? `/categories/${oldCategorySlug}` : null,
            newCategory?.slug ? `/categories/${newCategory.slug}` : null,
            '/admin/products'
          ].filter(Boolean)
        })
      });
    } catch (revalidateError) {
      console.log('Cache revalidation failed (non-critical):', revalidateError);
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Product update error:', error);
    return NextResponse.json({ error: 'Failed to update product', details: error }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await verifyToken(token);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Check ownership
    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: { Store: true }
    });

    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    if (user.role !== 'ADMIN' && existingProduct.Store.ownerId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete product', details: error }, { status: 500 });
  }
}
