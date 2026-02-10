import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireAdminApi } from '@/lib/server-auth';

/**
 * Force refresh all cache
 * POST /api/admin/force-refresh
 * 
 * Usage: After manual DB edits via Prisma Studio
 */
export async function POST() {
    try {
        // Verify admin authentication
        await requireAdminApi();

        // Invalidate entire app cache (layout revalidation cascades to all pages)
        revalidatePath('/', 'layout');

        // Also explicitly invalidate critical pages for certainty
        revalidatePath('/');  // Homepage
        revalidatePath('/categories/[slug]', 'page');  // All category pages
        revalidatePath('/nouveautes');  // New arrivals
        revalidatePath('/promotions');  // Promotions page
        revalidatePath('/products/[id]', 'page');  // All product pages

        console.log('[Admin] Force cache refresh executed');

        return NextResponse.json({
            success: true,
            message: 'Cache complètement rafraîchi',
            refreshedAt: new Date().toISOString()
        });
    } catch (error) {
        console.error('Force refresh error:', error);
        if (error instanceof Error && error.message === 'Unauthorized') {
            return NextResponse.json({ error: 'Non autorisé - Admin requis' }, { status: 401 });
        }
        return NextResponse.json({ error: 'Échec du rafraîchissement' }, { status: 500 });
    }
}
