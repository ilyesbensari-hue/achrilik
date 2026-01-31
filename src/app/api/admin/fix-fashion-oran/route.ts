
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const store = await prisma.store.findFirst({
            where: {
                name: { contains: 'Fashion Oran', mode: 'insensitive' }
            }
        });

        if (!store) {
            return NextResponse.json({ error: 'Store Fashion Oran not found' });
        }

        const products = await prisma.product.findMany({
            where: { storeId: store.id },
            include: { Category: true }
        });

        const categories = await prisma.category.findMany();
        const getCatId = (slug: string) => categories.find(c => c.slug === slug)?.id;

        // Mapping based on common keywords
        const mappings = [
            { keyword: 'Pull', slug: 'pulls-hommes' },
            { keyword: 'Sweat', slug: 'sweatshirts-hommes' },
            { keyword: 'Pantalon', slug: 'pantalons-hommes' },
            { keyword: 'Jean', slug: 'jeans-hommes' },
            { keyword: 'T-shirt', slug: 't-shirts-hommes' },
            { keyword: 'Chemise', slug: 'chemises-hommes' },
            { keyword: 'Veste', slug: 'vestes-hommes' },
            { keyword: 'Blouson', slug: 'vestes-hommes' },
            { keyword: 'Manteau', slug: 'manteaux-hommes' },
            { keyword: 'Ensemble', slug: 'ensembles-hommes' },
            { keyword: 'Pyjama', slug: 'pyjamas-hommes' },
            { keyword: 'Short', slug: 'shorts-hommes' },
            { keyword: 'Chaussure', slug: 'chaussures-hommes' },
            { keyword: 'Basket', slug: 'baskets-hommes' },
            { keyword: 'Casquette', slug: 'accessoires-hommes' },
        ];

        const updates = [];

        for (const p of products) {
            let newCatId = null;
            let reason = '';

            for (const m of mappings) {
                if (p.title.toLowerCase().includes(m.keyword.toLowerCase())) {
                    const targetId = getCatId(m.slug);
                    if (targetId) {
                        newCatId = targetId;
                        reason = `Matched "${m.keyword}" -> ${m.slug}`;
                        break;
                    } else {
                        // Fallback if typical slug doesn't exist, try root 'hommes'
                        const rootId = getCatId('hommes');
                        if (rootId) {
                            newCatId = rootId;
                            reason = `Matched "${m.keyword}" -> Fallback 'hommes'`;
                            break;
                        }
                    }
                }
            }

            if (newCatId && newCatId !== p.categoryId) {
                await prisma.product.update({
                    where: { id: p.id },
                    data: { categoryId: newCatId }
                });
                updates.push({ title: p.title, old: p.Category?.slug, new: reason });
            }
        }

        return NextResponse.json({
            success: true,
            store: store.name,
            totalProducts: products.length,
            updatedCount: updates.length,
            updates
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
