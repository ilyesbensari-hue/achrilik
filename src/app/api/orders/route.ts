import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendOrderConfirmation, sendNewOrderNotification, sendAdminNewOrderAlert, sendDeliveryAssignmentNotification } from '@/lib/mail';
import { verifyToken } from '@/lib/auth-token';
import { randomBytes } from 'crypto';
import { apiRateLimit, getClientIp } from '@/lib/ratelimit';
import { logger } from '@/lib/logger';
import { generateTrackingNumber } from '@/lib/delivery-helpers';

// GET - Fetch orders for a user or store
export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get('auth_token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await verifyToken(token);

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const storeId = searchParams.get('storeId');

        if (!userId && !storeId) {
            return NextResponse.json({ error: 'userId or storeId required' }, { status: 400 });
        }

        // Security Check: Ensure user can only request their own data
        if (userId && userId !== user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        // For storeId, we should ideally check if user owns the store, but for now we trust the seller dashboard logic + token

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
        logger.error('GET /api/orders error', { error: error as Error });
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        try {
            // Rate limiting check (Skip if Redis unavailable)
            const ip = getClientIp(request);
            const { success } = await apiRateLimit.limit(ip);

            if (!success) {
                return NextResponse.json(
                    { error: 'Trop de commandes. Réessayez dans 1 minute.' },
                    { status: 429 }
                );
            }
        } catch (rateLimitErr) {
            // Bypass rate limiting if Redis fails
            logger.warn('Rate limiting skipped due to Redis error', { error: rateLimitErr as Error });
        }


        const token = request.cookies.get('auth_token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await verifyToken(token);

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const {
            userId, cart, deliveryMethod, paymentMethod,
            address, phone, name, wilaya, city,
            deliveryLatitude,
            deliveryLongitude
        } = body;





        if (!userId || !cart || cart.length === 0) {
            return NextResponse.json({ error: 'Données invalides' }, { status: 400 });
        }

        // =========================================
        // VALIDATION REQUIRED FIELDS FOR DELIVERY
        // =========================================
        if (deliveryMethod === 'DELIVERY') {
            // Check required fields
            if (!address || !phone || !name || !wilaya || !city) {
                return NextResponse.json({
                    error: 'Pour la livraison, veuillez renseigner : adresse complète, téléphone, nom, wilaya et ville'
                }, { status: 400 });
            }

            // Validate Algerian phone format (05/06/07 + 8 digits)
            const cleanPhone = phone.replace(/\s+/g, '');
            if (!/^0[567]\d{8}$/.test(cleanPhone)) {
                return NextResponse.json({
                    error: 'Numéro de téléphone invalide. Format attendu: 05XXXXXXXX, 06XXXXXXXX ou 07XXXXXXXX'
                }, { status: 400 });
            }
        }

        // GPS coordinates are optional but highly recommended
        // Frontend (CheckoutClient.tsx L112-123) already prompts user with confirm() if GPS is missing
        // Delivery agents can use textual address (wilaya, city, address) as fallback

        if (userId !== user.id) {
            return NextResponse.json({ error: 'Forbidden: Cannot place order for another user' }, { status: 403 });
        }

        const order = await prisma.$transaction(async (tx) => {
            let total = 0;
            let storeInfo = null;

            // 1. Validate Stock & Price + Extract Store Info
            for (const item of cart) {
                const variant = await tx.variant.findUnique({
                    where: { id: item.variantId },
                    include: {
                        Product: {
                            include: {
                                Store: true
                            }
                        }
                    }
                });

                if (!variant) {
                    throw new Error(`Produit introuvable: ${item.title}`);
                }

                if (variant.stock < item.quantity) {
                    throw new Error(`Stock insuffisant pour: ${item.title}`);
                }

                total += variant.Product.price * item.quantity;

                // Extract store info from first item
                if (!storeInfo && variant.Product.Store) {
                    storeInfo = variant.Product.Store;
                }
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

                    // Store Info (from first cart item)
                    storeId: storeInfo?.id || null,
                    storeName: storeInfo?.name || null,
                    storeAddress: storeInfo?.address || null,
                    storeCity: storeInfo?.city || storeInfo?.storageCity || null,

                    // Shipping Info
                    shippingName: name,
                    shippingPhone: phone,
                    shippingAddress: address,
                    shippingCity: city,
                    shippingWilaya: wilaya,
                    deliveryLatitude: deliveryLatitude || null,
                    deliveryLongitude: deliveryLongitude || null,

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



        // =========================================
        //         AUTO-ASSIGNMENT DELIVERY
        // =========================================
        // Auto-create delivery for DELIVERY orders and assign to default agent
        if (deliveryMethod === 'DELIVERY' && wilaya) {
            try {
                const defaultAgent = await prisma.deliveryAgent.findFirst({
                    where: {
                        user: { email: 'livreur@achrilik.com' },
                        isActive: true
                    },
                    include: {
                        user: true
                    }
                });

                if (defaultAgent) {
                    await prisma.delivery.create({
                        data: {
                            id: randomBytes(12).toString('hex'),
                            orderId: order.id,
                            agentId: defaultAgent.id,
                            trackingNumber: generateTrackingNumber(),
                            status: 'PENDING',
                            assignedAt: new Date(),
                            codAmount: paymentMethod === 'COD' ? order.total : 0,
                            codCollected: false
                        }
                    });

                    logger.info('[ORDER] Delivery auto-assigned', {
                        orderId: order.id,
                        agentId: defaultAgent.id
                    });
                }
            } catch (deliveryErr) {
                logger.error('[ORDER] Delivery auto-assignment failed', { error: deliveryErr as Error });
                // Non-blocking error
            }
        }

        // ==========================================
        //         EMAIL NOTIFICATIONS (Sync-ish)
        // ==========================================
        // In serverless (Vercel/Netlify), we MUST wait for async tasks
        // otherwise the function freezes/terminates immediately after return.

        try {
            const emailPromises = [];

            // 0. Send Email to Admin (NEW)
            if (process.env.ADMIN_EMAIL) {
                emailPromises.push(
                    sendAdminNewOrderAlert(process.env.ADMIN_EMAIL, order)
                        .catch(e => logger.error('[EMAIL ERROR] Admin alert failed', { error: e as Error }))
                );
            }

            // 1. Send Email to Buyer
            if (order.User && order.User.email) {

                emailPromises.push(
                    sendOrderConfirmation(order.User.email, order)
                        .catch(e => logger.error('[EMAIL ERROR] Buyer confirmation failed', { error: e as Error }))
                );
            }

            // 2. Send Email to Sellers
            const storeIds = Array.from(new Set(order.OrderItem.map((item: any) => item.Variant.Product.storeId)));
            if (storeIds.length > 0) {
                const stores = await prisma.store.findMany({
                    where: { id: { in: storeIds as string[] } },
                    include: { User: true }
                });

                for (const store of stores) {
                    if (store.User && store.User.email) {

                        emailPromises.push(
                            sendNewOrderNotification(store.User.email, order)
                                .catch(e => logger.error(`[EMAIL ERROR] Seller notification failed for ${store.id}:`, e))
                        );
                    }
                }
            }

            // 3. Send Email to Delivery Agent if auto-assigned (NEW)
            if (deliveryMethod === 'DELIVERY') {
                const defaultAgent = await prisma.deliveryAgent.findFirst({
                    where: {
                        user: { email: 'livreur@achrilik.com' },
                        isActive: true
                    },
                    include: { user: true }
                });

                if (defaultAgent && defaultAgent.user?.email) {
                    emailPromises.push(
                        sendDeliveryAssignmentNotification(
                            defaultAgent.user.email,
                            order,
                            defaultAgent
                        ).catch(e => logger.error('[EMAIL ERROR] Delivery agent notification failed', { error: e as Error }))
                    );
                }
            }

            // Await with timeout (5s max) to not block user too long
            await Promise.race([
                Promise.all(emailPromises),
                new Promise(resolve => setTimeout(resolve, 5000))
            ]);



        } catch (emailErr) {
            logger.error('[ORDER] Critical error in email dispatch', { error: emailErr as Error });
            // Non-blocking error for client, but logged
        }

        return NextResponse.json({ success: true, orderId: order.id });

    } catch (error: any) {
        logger.error('[ORDER] Create error', { error: error as Error });
        return NextResponse.json({ error: error.message || 'Erreur lors de la commande' }, { status: 500 });
    }
}
