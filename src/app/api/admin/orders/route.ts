import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminApi } from '@/lib/server-auth';

// GET /api/admin/orders
export async function GET(request: NextRequest) {
    try {
        await requireAdminApi();

        const searchParams = request.nextUrl.searchParams;
        const status = searchParams.get('status');

        const where: any = {};
        if (status) {
            where.status = status;
        }

        const orders = await prisma.order.findMany({
            where,
            include: {
                User: {
                    select: { name: true, email: true, phone: true }
                },
                OrderItem: {
                    include: {
                        Variant: {
                            include: {
                                Product: {
                                    include: {
                                        Store: {
                                            include: {
                                                User: {
                                                    select: { email: true, phone: true }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Calculate stats
        const allOrders = await prisma.order.findMany({ select: { status: true, total: true } });
        const stats: Record<string, number> = {};
        allOrders.forEach(o => {
            stats[o.status] = (stats[o.status] || 0) + 1;
        });

        // Format orders for client with store info from products
        const formattedOrders = orders.map(order => {
            // Defensive: check if OrderItem exists and has valid structure
            if (!order.OrderItem || order.OrderItem.length === 0) {
                return {
                    id: order.id,
                    userId: order.userId,
                    status: order.status,
                    total: order.total,
                    paymentMethod: order.paymentMethod,
                    deliveryType: order.deliveryType,
                    createdAt: order.createdAt,
                    shippingAddress: order.shippingAddress,
                    shippingCity: order.shippingCity,
                    shippingPhone: order.shippingPhone,
                    shippingName: order.shippingName,
                    storeAddress: order.storeAddress,
                    storeCity: order.storeCity,
                    storeName: order.storeName,
                    trackingNumber: order.trackingNumber,
                    notes: order.notes,
                    user: order.User,
                    store: null,
                    items: []
                };
            }

            // Get unique stores from order items
            const stores = Array.from(new Set(
                order.OrderItem
                    .filter(item => item?.Variant?.Product?.Store) // defensive filter
                    .map(item => item.Variant.Product.Store)
            ));

            // For single-vendor orders, use the store info
            const primaryStore = stores[0];

            return {
                id: order.id,
                userId: order.userId,
                status: order.status,
                total: order.total,
                paymentMethod: order.paymentMethod,
                deliveryType: order.deliveryType,
                createdAt: order.createdAt,
                shippingAddress: order.shippingAddress,
                shippingCity: order.shippingCity,
                shippingPhone: order.shippingPhone,
                shippingName: order.shippingName,
                storeAddress: order.storeAddress,
                storeCity: order.storeCity,
                storeName: order.storeName,
                trackingNumber: order.trackingNumber,
                notes: order.notes,
                user: order.User,
                store: primaryStore ? {
                    id: primaryStore.id,
                    name: primaryStore.name,
                    address: primaryStore.address,
                    city: primaryStore.city,
                    phone: primaryStore.phone,
                    sellerEmail: primaryStore.User?.email,
                    sellerPhone: primaryStore.User?.phone
                } : null,
                items: order.OrderItem
                    .filter(item => item?.Variant?.Product) // defensive filter
                    .map(item => ({
                        quantity: item.quantity,
                        price: item.price,
                        variant: {
                            size: item.Variant.size,
                            color: item.Variant.color,
                            product: {
                                title: item.Variant.Product.title,
                                images: item.Variant.Product.images,
                                storeName: item.Variant.Product.Store?.name || 'N/A'
                            }
                        }
                    }))
            };
        });

        return NextResponse.json({
            orders: formattedOrders,
            stats
        });

    } catch (error) {
        console.error('Error fetching orders:', error);
        return NextResponse.json(
            { error: 'Failed to fetch orders' },
            { status: 500 }
        );
    }
}
