import { prisma } from '@/lib/prisma';

/**
 * Get product status based on store verification
 * Products from verified stores are auto-approved
 */
export async function getProductStatus(storeId: string): Promise<'APPROVED' | 'PENDING'> {
    try {
        const store = await prisma.store.findUnique({
            where: { id: storeId },
            select: { verified: true }
        });

        // Auto-approve if store is verified
        return store?.verified ? 'APPROVED' : 'PENDING';
    } catch (error) {
        console.error('[getProductStatus] Error:', error);
        return 'PENDING'; // Default to pending if error
    }
}
