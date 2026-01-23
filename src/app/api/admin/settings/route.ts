import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logAdminAction, AdminActions, TargetTypes } from '@/lib/adminLogger';
import { randomBytes } from 'crypto';

// GET /api/admin/settings - Get all settings or specific setting
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const key = searchParams.get('key');
        const category = searchParams.get('category');

        if (key) {
            const setting = await prisma.systemSettings.findUnique({
                where: { key }
            });
            return NextResponse.json(setting);
        }

        const where: any = {};
        if (category) {
            where.category = category;
        }

        const settings = await prisma.systemSettings.findMany({
            where,
            orderBy: { key: 'asc' }
        });

        return NextResponse.json(settings);
    } catch (error) {
        console.error('Error fetching settings:', error);
        return NextResponse.json(
            { error: 'Failed to fetch settings' },
            { status: 500 }
        );
    }
}

// POST /api/admin/settings - Create or update a setting
export async function POST(request: NextRequest) {
    try {
        const { key, value, category, description, adminId } = await request.json();

        if (!key || !value || !adminId) {
            return NextResponse.json(
                { error: 'Key, value, and adminId are required' },
                { status: 400 }
            );
        }

        const setting = await prisma.systemSettings.upsert({
            where: { key },
            update: { value, category, description, updatedAt: new Date() },
            create: {
                id: randomBytes(16).toString('hex'),
                key,
                value,
                category: category || 'GENERAL',
                description,
                updatedAt: new Date()
            }
        });

        // Log admin action
        await logAdminAction({
            adminId,
            action: AdminActions.UPDATE_SETTINGS,
            targetType: TargetTypes.SETTINGS,
            targetId: key,
            details: { key, value, category }
        });

        return NextResponse.json(setting);
    } catch (error) {
        console.error('Error saving setting:', error);
        return NextResponse.json(
            { error: 'Failed to save setting' },
            { status: 500 }
        );
    }
}

// DELETE /api/admin/settings - Delete a setting
export async function DELETE(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const key = searchParams.get('key');
        const adminId = searchParams.get('adminId');

        if (!key || !adminId) {
            return NextResponse.json(
                { error: 'Key and adminId are required' },
                { status: 400 }
            );
        }

        await prisma.systemSettings.delete({
            where: { key }
        });

        // Log admin action
        await logAdminAction({
            adminId,
            action: AdminActions.UPDATE_SETTINGS,
            targetType: TargetTypes.SETTINGS,
            targetId: key,
            details: { action: 'delete', key }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting setting:', error);
        return NextResponse.json(
            { error: 'Failed to delete setting' },
            { status: 500 }
        );
    }
}
