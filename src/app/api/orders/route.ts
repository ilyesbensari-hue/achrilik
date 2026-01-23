/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendOrderConfirmation, sendNewOrderNotification } from '@/lib/mail';

import { randomBytes } from 'crypto';

// GET - Fetch orders for a user or store
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const storeId = searchParams.get('storeId');

        if (!userId && !storeId) {
            return NextResponse.json({ error: 'userId or storeId required' }, { status: 400 });
        }

        let orders;

        if (storeId) {
            // Fetch orders for a specific store (seller view)
            orders = await prisma.order.findMany({
                where: {
                    OrderItem: {
                        some: {
                            Variant: {
                                Product: {
                                    storeId
                                }
                            }
                        }
                    }
                },
                include: {
                    OrderItem: {
                        include: {
                            Variant: {
                                include: {
                                    Product: true
                                }
                            }
                        }
                    },
                    User: {
                        select: {
                            name: true,
                            email: true,
                            phone: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });
        } else {
            // Fetch orders for a specific user (buyer view)
            orders = await prisma.order.findMany({
                where: { userId: userId as string },
                include: {
                    OrderItem: {
                        include: {
                            Variant: {
                                include: {
                                    Product: true
                                }
                            }
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });
        }

        return NextResponse.json(orders);

    } catch (error) {
        console.error('GET /api/orders error:', error);
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }
}

// POST - Create a new order
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { userId, cart, deliveryMethod, paymentMethod, address, phone, name, wilaya, city } = body;

        if (!userId || !cart || cart.length === 0) {
            return NextResponse.json({ error: 'Données invalides' }, { status: 400 });
        }

        const order = await prisma.$transaction(async (tx) => {
            let total = 0;

            // 1. Validate Stock & Price
            for (const item of cart) {
                const variant = await tx.variant.findUnique({
                    where: { id: item.variantId },
                    include: { Product: true }
                });

                if (!variant) {
                    throw new Error(`Produit introuvable: ${item.title}`);
                }

                if (variant.stock < item.quantity) {
                    throw new Error(`Stock insuffisant pour: ${item.title}`);
                }

                total += variant.Product.price * item.quantity;
            }

            // Add delivery fee
            const deliveryFee = deliveryMethod === 'DELIVERY' ? 500 : 0;
            total += deliveryFee;

            // 2. Create Order
            const newOrder = await tx.order.create({
                data: {
                    id: randomBytes(16).toString('hex'),
                    userId,
                    status: 'PENDING',
                    total,
                    paymentMethod,
                    deliveryType: deliveryMethod,
                    OrderItem: {
                        create: cart.map((item: any) => ({
                            id: randomBytes(16).toString('hex'),
                            variantId: item.variantId,
                            quantity: item.quantity,
                            price: item.price
                        }))
                    }
                },
                include: {
                    User: true, // For Buyer Email
                    OrderItem: {
                        include: {
                            Variant: {
                                include: {
                                    Product: true // For Store ID
                                }
                            }
                        }
                    }
                }
            });

            // 3. Decrement Stock
            for (const item of cart) {
                await tx.variant.update({
                    where: { id: item.variantId },
                    data: {
                        stock: { decrement: item.quantity }
                    }
                });
            }

            return newOrder;
        });

        // ==========================================
        //         EMAIL NOTIFICATIONS
        // ==========================================

        // 1. Send Email to Buyer
        if (order.User && order.User.email) {
            await sendOrderConfirmation(order.User.email, order);
        }

        // 2. Send Email to Sellers
        // Extract unique store IDs involved in this order
        const storeIds = Array.from(new Set(order.OrderItem.map((item: any) => item.Variant.Product.storeId)));

        if (storeIds.length > 0) {
            const stores = await prisma.store.findMany({
                where: { id: { in: storeIds as string[] } },
                include: { User: true }
            });

            for (const store of stores) {
                if (store.User && store.User.email) {
                    // Send notification to each seller involved
                    await sendNewOrderNotification(store.User.email, order);
                }
            }
        }

        return NextResponse.json({ success: true, orderId: order.id });

    } catch (error: any) {
        console.error('Order error:', error);
        return NextResponse.json({ error: error.message || 'Erreur lors de la commande' }, { status: 500 });
    }
}
