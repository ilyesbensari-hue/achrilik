
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
        // Keywords are case-insensitive
        const mappings = [
            { keyword: 'Pull', slugs: ['pulls-hommes', 'pulls', 'pull'] },
            { keyword: 'Sweat', slugs: ['sweatshirts-hommes', 'sweatshirts', 'sweats'] },
            { keyword: 'Pantalon', slugs: ['pantalons-hommes', 'pantalons', 'jeans-pantalons'] },
            { keyword: 'Jean', slugs: ['jeans-hommes', 'jeans'] },
            { keyword: 'T-shirt', slugs: ['t-shirts-hommes', 't-shirts', 'tshirts'] },
            { keyword: 'Chemise', slugs: ['chemises-hommes', 'chemises'] },
            { keyword: 'Veste', slugs: ['vestes-hommes', 'vestes', 'blousons', 'vestes-et-manteaux'] },
            { keyword: 'Blouson', slugs: ['vestes-hommes', 'vestes', 'blousons', 'vestes-et-manteaux'] },
            { keyword: 'Manteau', slugs: ['manteaux-hommes', 'manteaux', 'vestes-et-manteaux'] },
            { keyword: 'Ensemble', slugs: ['ensembles-hommes', 'ensembles'] },
            { keyword: 'Pyjama', slugs: ['pyjamas-hommes', 'pyjamas'] },
            { keyword: 'Short', slugs: ['shorts-hommes', 'shorts'] },
            { keyword: 'Chaussure', slugs: ['chaussures-hommes', 'chaussures'] },
            { keyword: 'Basket', slugs: ['baskets-hommes', 'baskets', 'sneakers'] },
            { keyword: 'Casquette', slugs: ['accessoires-hommes', 'accessoires', 'casquettes'] },
        ];

        const updates = [];
        const unmatched = [];
        const allSlugs = categories.map(c => c.slug);

        for (const p of products) {
            let newCatId = null;
            let reason = '';
            let matchedKw = '';

            for (const m of mappings) {
                if (p.title.toLowerCase().includes(m.keyword.toLowerCase())) {
                    matchedKw = m.keyword;
                    // Try all slug variations
                    for (const slug of m.slugs) {
                        const targetId = getCatId(slug);
                        if (targetId) {
                            newCatId = targetId;
                            reason = `Matched "${m.keyword}" -> ${slug}`;
                            break;
                        }
                    }
                    if (newCatId) break;
                }
            }

            // Fallback: If title matched a keyword but no specific slug found, try generic 'hommes'
            if (matchedKw && !newCatId) {
                const rootId = getCatId('hommes');
                if (rootId) {
                    newCatId = rootId;
                    reason = `Matched "${matchedKw}" -> Fallback 'hommes' (Specific slug not found)`;
                }
            }

            if (newCatId && newCatId !== p.categoryId) {
                await prisma.product.update({
                    where: { id: p.id },
                    data: { categoryId: newCatId }
                });
                updates.push({ title: p.title, old: p.Category?.slug, new: reason });
            } else if (!p.Category || (matchedKw && !p.Category)) {
                // Track unmatched only if they don't have a category or if we missed categorizing them despite a keyword
                unmatched.push({
                    title: p.title,
                    currentSlug: p.Category?.slug || 'null',
                    matchedKeyword: matchedKw || 'none'
                });
            }
        }

        return NextResponse.json({
            success: true,
            store: store.name,
            totalProducts: products.length,
            updatedCount: updates.length,
            updates,
            debug: {
                availableSlugs: allSlugs.sort(),
                unmatchedSamples: unmatched.slice(0, 50) // Show up to 50 failures
            }
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
