import { NextRequest } from 'next/server';
import { hasRole, hasAnyRole } from "@/lib/role-helpers";
import { prisma } from '@/lib/prisma';
import { generateCSVResponse, generatePDFResponse, generateSimplePDF } from '@/lib/exportUtils';

// GET /api/admin/export/users - Export users data
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const format = searchParams.get('format') || 'csv';

        // Fetch all users
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                phone: true,
                address: true,
                createdAt: true
            },
            orderBy: { createdAt: 'desc' }
        });

        // Format data for export
        const exportData = users.map(user => ({
            ID: user.id,
            Email: user.email,
            Nom: user.name || 'N/A',
            Rôle: user.role,
            Téléphone: user.phone || 'N/A',
            Adresse: user.address || 'N/A',
            'Date d\'inscription': new Date(user.createdAt).toLocaleDateString('fr-FR')
        }));

        if (format === 'pdf') {
            const columns = [
                { key: 'Email', label: 'Email' },
                { key: 'Nom', label: 'Nom' },
                { key: 'Rôle', label: 'Rôle' },
                { key: 'Téléphone', label: 'Téléphone' },
                { key: 'Date d\'inscription', label: 'Date d\'inscription' }
            ];
            const html = generateSimplePDF('Export des Utilisateurs', exportData, columns);
            return generatePDFResponse(html, 'utilisateurs');
        }

        return generateCSVResponse(exportData, 'utilisateurs');
    } catch (error) {
        console.error('Error exporting users:', error);
        return new Response('Export failed', { status: 500 });
    }
}
