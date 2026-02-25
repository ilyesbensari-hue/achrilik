import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateCSVResponse, generatePDFResponse, generateSimplePDF } from '@/lib/exportUtils';
import { requireAdminAuth } from '@/lib/adminAuth';

// GET /api/admin/export/orders - Export orders data (ADMIN ONLY)
export async function GET(request: NextRequest) {
    const guard = await requireAdminAuth(request);
    if (guard) return guard;

    try {
        const searchParams = request.nextUrl.searchParams;
        const format = searchParams.get('format') || 'csv';

        // Fetch all orders
        const orders = await prisma.order.findMany({
            include: {
                User: {
                    select: {
                        name: true,
                        email: true
                    }
                },
                OrderItem: {
                    include: {
                        Variant: {
                            include: {
                                Product: {
                                    select: {
                                        title: true
                                    }
                                }
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Format data for export
        const exportData = orders.map(order => ({
            ID: order.id,
            Client: order.User.name || order.User.email,
            Total: `${order.total} DA`,
            Statut: order.status,
            'Mode de livraison': order.deliveryType,
            'Mode de paiement': order.paymentMethod,
            'Nombre d\'articles': order.OrderItem.length,
            'Date de commande': new Date(order.createdAt).toLocaleDateString('fr-FR')
        }));

        if (format === 'pdf') {
            const columns = [
                { key: 'ID', label: 'ID Commande' },
                { key: 'Client', label: 'Client' },
                { key: 'Total', label: 'Total' },
                { key: 'Statut', label: 'Statut' },
                { key: 'Mode de livraison', label: 'Livraison' },
                { key: 'Date de commande', label: 'Date' }
            ];
            const html = generateSimplePDF('Export des Commandes', exportData, columns);
            return generatePDFResponse(html, 'commandes');
        }

        return generateCSVResponse(exportData, 'commandes');
    } catch (error) {
        console.error('Error exporting orders:', error);
        return new Response('Export failed', { status: 500 });
    }
}
