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
    const { title, description, price, images, variants } = body;

    // Delete existing variants and create new ones
    const product = await prisma.$transaction(async (tx) => {
      // Delete old variants
      await tx.variant.deleteMany({
        where: { productId: id },
      });

      // Update product with new variants
      return await tx.product.update({
        where: { id },
        data: {
          title,
          description,
          price: parseFloat(price),
          images,
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
        },
      });
    });

    return NextResponse.json(product);
  } catch (error) {
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
