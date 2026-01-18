import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        variants: true,
        store: true,
        category: true,
        reviews: {
          include: {
            user: {
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
        product: {
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
        ...product.store,
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

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, description, price, images, categoryId, variants } = body;

    // Update product and handle variants safely
    const product = await prisma.$transaction(async (tx) => {
      // Get existing variants
      const existingVariants = await tx.variant.findMany({
        where: { productId: id },
        include: {
          orderItems: true
        }
      });

      // Separate variants into those with and without orders
      const variantsWithOrders = existingVariants.filter(v => v.orderItems.length > 0);
      const variantsWithoutOrders = existingVariants.filter(v => v.orderItems.length === 0);

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
          variants: {
            create: variants.map((v: any) => ({
              size: v.size,
              color: v.color,
              stock: parseInt(v.stock),
            })),
          },
        },
        include: {
          variants: true,
          category: true,
        },
      });
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('Product update error:', error);
    return NextResponse.json({ error: 'Failed to update product', details: error }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete product', details: error }, { status: 500 });
  }
}
