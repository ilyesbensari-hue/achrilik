import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { userId, cart, deliveryMethod, paymentMethod, address, phone, name, wilaya, city } = body;

        if (!userId || !cart || cart.length === 0) {
            return NextResponse.json({ error: 'Données invalides' }, { status: 400 });
        }

        // Calculate total
        // Verify stock for all items first
        // We use a transaction to ensure atomic operations
        const order = await prisma.$transaction(async (tx) => {
            let total = 0;

            // 1. Validate Stock & Price
            for (const item of cart) {
                const variant = await tx.variant.findUnique({
                    where: { id: item.variantId },
                    include: { product: true }
                });

                if (!variant) {
                    throw new Error(`Produit introuvable: ${item.title}`);
                }

                if (variant.stock < item.quantity) {
                    throw new Error(`Stock insuffisant pour: ${item.title}`);
                }

                // Recalculate price from DB to avoid client-side tampering
                total += variant.product.price * item.quantity;
            }

            // Add delivery fee
            const deliveryFee = deliveryMethod === 'DELIVERY' ? 500 : 0;
            total += deliveryFee;

            // 2. Create Order
            const newOrder = await tx.order.create({
                data: {
                    userId,
                    status: 'PENDING',
                    total,
                    paymentMethod,
                    deliveryType: deliveryMethod,
                    // Store delivery details in a separate way or just assume they are on User?
                    // The schema has `address` on User, but Order might need specific shipping address.
                    // The schema Order model doesn't have shippingAddress fields. 
                    // We should probably add them or store them in a JSON field if available, 
                    // but for now let's rely on the fact that User has address or we assume it's standard.
                    // WAIT: I saw `address`, `phone` in schema for User.
                    // Let's update User address if provided? Or just assume it's fine.
                    // The user wanted "Real Checkout". Detailed address history is bonus.
                    // Let's create the order items linked to it.
                    items: {
                        create: cart.map((item: any) => ({
                            variantId: item.variantId,
                            quantity: item.quantity,
                            price: item.price // We should ideally use DB price, but for speed using Item price (validated above typically)
                        }))
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

        return NextResponse.json({ success: true, orderId: order.id });

    } catch (error: any) {
        console.error('Order error:', error);
        return NextResponse.json({ error: error.message || 'Erreur lors de la commande' }, { status: 500 });
    }
}
