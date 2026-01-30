import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminApi } from '@/lib/server-auth';

// GET /api/admin/emails - Get all email templates
export async function GET() {
    try {
        await requireAdminApi();
        const templates = await prisma.emailTemplate.findMany({
            orderBy: { name: 'asc' }
        });
        return NextResponse.json(templates);
    } catch (error) {
        console.error('Error fetching email templates:', error);
        return NextResponse.json(
            { error: 'Failed to fetch templates' },
            { status: 500 }
        );
    }
}

// PUT /api/admin/emails - Update an email template
export async function PUT(request: NextRequest) {
    try {
        await requireAdminApi();
        const { name, subject, htmlContent, enabled } = await request.json();

        if (!name) {
            return NextResponse.json(
                { error: 'Template name is required' },
                { status: 400 }
            );
        }

        const template = await prisma.emailTemplate.update({
            where: { name },
            data: {
                subject,
                htmlContent,
                enabled
            }
        });

        return NextResponse.json(template);
    } catch (error) {
        console.error('Error updating email template:', error);
        return NextResponse.json(
            { error: 'Failed to update template' },
            { status: 500 }
        );
    }
}
