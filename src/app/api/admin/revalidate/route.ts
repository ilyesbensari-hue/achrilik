import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireAdminApi } from '@/lib/server-auth';

/**
 * POST /api/admin/revalidate
 * Force cache revalidation for updated content (admin only)
 */
export async function POST(request: NextRequest) {
    try {
        await requireAdminApi();

        const { paths } = await request.json();

        // Revalidate specified paths or all if not specified
        const pathsToRevalidate = paths || [
            '/',
            '/categories/[slug]',
            '/products/[id]',
            '/admin/products',
            '/admin/vendors'
        ];

        for (const path of pathsToRevalidate) {
            if (path.includes('[')) {
                // Dynamic route - revalidate layout
                revalidatePath(path, 'layout');
            } else {
                // Static route
                revalidatePath(path);
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Cache revalidated successfully',
            revalidated: pathsToRevalidate
        });

    } catch (error) {
        console.error('Error revalidating cache:', error);
        return NextResponse.json(
            { error: 'Failed to revalidate cache' },
            { status: 500 }
        );
    }
}
