import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateCSVResponse, generatePDFResponse, generateSimplePDF } from '@/lib/exportUtils';

// GET /api/admin/export/products - Export products data
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const format = searchParams.get('format') || 'csv';

        // Fetch all products
        const products = await prisma.product.findMany({
            include: {
                store: {
                    select: {
                        name: true
                    }
                },
                category: {
                    select: {
                        name: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Format data for export
        const exportData = products.map(product => ({
            ID: product.id,
            Titre: product.title,
            Prix: `${product.price} DA`,
            Statut: product.status,
            Magasin: product.store.name,
            Catégorie: product.category?.name || 'N/A',
            'Date de création': new Date(product.createdAt).toLocaleDateString('fr-FR')
        }));

        if (format === 'pdf') {
            const columns = [
                { key: 'Titre', label: 'Titre' },
                { key: 'Prix', label: 'Prix' },
                { key: 'Statut', label: 'Statut' },
                { key: 'Magasin', label: 'Magasin' },
                { key: 'Catégorie', label: 'Catégorie' },
                { key: 'Date de création', label: 'Date de création' }
            ];
            const html = generateSimplePDF('Export des Produits', exportData, columns);
            return generatePDFResponse(html, 'produits');
        }

        return generateCSVResponse(exportData, 'produits');
    } catch (error) {
        console.error('Error exporting products:', error);
        return new Response('Export failed', { status: 500 });
    }
}
