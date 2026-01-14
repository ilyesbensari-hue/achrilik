import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendOrderConfirmation, sendNewOrderNotification } from '@/lib/mail';


export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { userId, items, total, paymentMethod, deliveryType } = body;

        // Transaction to ensure order and items are created together
        const order = await prisma.$transaction(async (tx) => {
            const newOrder = await tx.order.create({
                data: {
                    userId,
                    total: parseFloat(total),
                    paymentMethod,
                    deliveryType,
                    status: 'PENDING',
                    items: {
                        create: items.map((item: any) => ({
                            variantId: item.variantId,
                            quantity: parseInt(item.quantity),
                            price: parseFloat(item.price),
                        })),
                    },
                },
                include: {
                    items: true,
                },
            });

            // Update stock
            for (const item of items) {
                await tx.variant.update({
                    where: { id: item.variantId },
                    data: {
                        stock: {
                            decrement: parseInt(item.quantity)
                        }
                    }
                });
            }

            return newOrder;
        });

        // --- Email Notifications ---
        try {
            const fullOrder = await prisma.order.findUnique({
                where: { id: order.id },
                include: {
                    user: true,
                    items: {
                        include: {
                            variant: {
                                include: {
                                    product: {
                                        include: {
                                            store: {
                                                include: { owner: true }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });

            if (fullOrder) {
                // 1. Notify Buyer
                if (fullOrder.user?.email) {
                    await sendOrderConfirmation(fullOrder.user.email, fullOrder);
                }

                // 2. Notify Seller (Assuming single store per order for now)
                // We take the store from the first item
                const firstItem = fullOrder.items[0];
                const sellerEmail = firstItem?.variant?.product?.store?.owner?.email;

                if (sellerEmail) {
                    await sendNewOrderNotification(sellerEmail, fullOrder);
                }
            }
        } catch (emailError) {
            console.error("Failed to send email notifications:", emailError);
            // Non-blocking: we still return the order success
        }

        return NextResponse.json(order);
    } catch (error) {
        console.error('Order creation failed:', error);
        return NextResponse.json({ error: 'Failed to create order', details: error }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const storeId = searchParams.get('storeId');

        if (userId) {
            const orders = await prisma.order.findMany({
                where: { userId },
                include: { items: { include: { variant: { include: { product: true } } } } },
                orderBy: { createdAt: 'desc' }
            });
            return NextResponse.json(orders);
        }

        if (storeId) {
            // Find orders that contain items from this store
            const orders = await prisma.order.findMany({
                where: {
                    items: {
                        some: {
                            variant: {
                                product: {
                                    storeId: storeId
                                }
                            }
                        }
                    }
                },
                include: {
                    items: {
                        include: {
                            variant: {
                                include: {
                                    product: true
                                }
                            }
                        }
                    },
                    user: {
                        select: {
                            name: true,
                            email: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });
            return NextResponse.json(orders);
        }

        const orders = await prisma.order.findMany({
            include: { items: { include: { variant: { include: { product: true } } } } },
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(orders);

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }
}
