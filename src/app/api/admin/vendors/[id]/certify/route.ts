import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminApi } from '@/lib/server-auth';

/**
 * PATCH /api/admin/vendors/[id]/certify
 * Certify a vendor store
 */
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const admin = await requireAdminApi();
        const vendorId = params.id;

        // Update vendor certification
        const updatedStore = await prisma.store.update({
            where: { id: vendorId },
            data: {
                verified: true,
                verifiedAt: new Date(),
                verifiedBy: admin?.id || null
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Vendeur certifié avec succès',
            vendor: {
                id: updatedStore.id,
                name: updatedStore.name,
                verifiedAt: updatedStore.verifiedAt,
                verified: updatedStore.verified
            }
        });

    } catch (error) {
        console.error('Error certifying vendor:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la certification' },
            { status: 500 }
        );
    }
}
