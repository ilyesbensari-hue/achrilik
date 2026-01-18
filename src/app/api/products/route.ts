import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('storeId');
    const search = searchParams.get('search');

    const whereClause: any = {};
    if (storeId) whereClause.storeId = storeId;
    if (search) {
      whereClause.OR = [
        { title: { contains: search } },
        { description: { contains: search } }
      ];
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      take: 50, // Reduced from 100 for better performance
      include: {
        variants: true,
        store: true,
        category: true,
        reviews: true,
      },
    });

    // Calculate store ratings
    const storeIds = new Set(products.map(p => p.storeId));

    // Fetch all reviews for these stores
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

    const storeRatingsMap = new Map<string, { total: number; count: number }>();
    reviewsForStores.forEach(r => {
      const sid = r.product.storeId;
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
          ...p.store,
          averageRating: avg,
          reviewCount: stats.count
        }
      };
    });

    return NextResponse.json(enrichedProducts);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, price, images, storeId, variants } = body;

    const product = await prisma.product.create({
      data: {
        title,
        description,
        price: parseFloat(price),
        images: images, // Comma separated string
        storeId,
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

    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create product', details: error }, { status: 500 });
  }
}
