import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '@/lib/auth-token';
import { cookies } from 'next/headers';
import { randomBytes } from 'crypto';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Await params for Next.js 15+
        const { id: storeId } = await params;

        // Verify admin authentication
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
        }

        const payload = await verifyToken(token);
        if (!payload) {
            return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
        }

        // Check if user is admin
        const admin = await prisma.user.findUnique({
            where: { id: payload.userId as string },
        });

        if (!admin || admin.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
        }

        // Get current store
        const store = await prisma.store.findUnique({
            where: { id: storeId },
            include: { User: true }
        });

        if (!store) {
            return NextResponse.json({ error: 'Boutique introuvable' }, { status: 404 });
        }

        // Toggle verification
        const newVerifiedStatus = !store.verified;

        const updatedStore = await prisma.store.update({
            where: { id: storeId },
            data: {
                verified: newVerifiedStatus,
                verifiedAt: newVerifiedStatus ? new Date() : null,
                verifiedBy: newVerifiedStatus ? admin.id : null,
            },
            include: { User: true }
        });

        // Log admin action
        await prisma.adminLog.create({
            data: {
                id: randomBytes(16).toString('hex'),
                adminId: admin.id,
                action: newVerifiedStatus ? 'VERIFY_SELLER' : 'UNVERIFY_SELLER',
                targetType: 'STORE',
                targetId: storeId,
                details: JSON.stringify({
                    storeName: store.name,
                    ownerEmail: store.User.email,
                }),
            },
        });

        // Send verification email to vendor
        if (newVerifiedStatus) {
            const { sendVendorVerificationEmail } = await import('@/lib/mail');
            await sendVendorVerificationEmail(
                store.User.email,
                store.name,
                store.User.name || 'Vendeur',
                true
            );
        }

        // Force admin vendor list revalidation
        revalidatePath('/admin/vendors');

        return NextResponse.json({
            success: true,
            verified: updatedStore.verified,
            verifiedAt: updatedStore.verifiedAt,
        });
    } catch (error) {
        console.error('Error toggling store verification:', error);
        return NextResponse.json(
            { error: 'Erreur serveur' },
            { status: 500 }
        );
    }
}
