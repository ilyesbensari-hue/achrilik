
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        // 1. Get a User (Buyer)
        const user = await prisma.user.findFirst({ where: { role: 'BUYER' } });
        if (!user) {
            console.log("No buyer found");
            return;
        }
        console.log("Buyer:", user.email);

        // 2. Get a Product Variant
        const variant = await prisma.variant.findFirst({
            include: { product: true }
        });

        if (!variant) {
            console.log("No variant found");
            return;
        }
        console.log("Variant:", variant.id, "Product:", variant.product.title, "StoreId:", variant.product.storeId);

        // 3. Create Order
        const order = await prisma.order.create({
            data: {
                userId: user.id,
                total: variant.product.price,
                status: 'PENDING',
                paymentMethod: 'STORE_PAYMENT',
                deliveryType: 'CLICK_COLLECT',
                items: {
                    create: {
                        variantId: variant.id,
                        quantity: 1,
                        price: variant.product.price,
                    }
                }
            },
            include: { items: true }
        });
        console.log("Order Created:", order.id);

        // 4. Update Status (Simulation of Seller Action)
        const updated = await prisma.order.update({
            where: { id: order.id },
            data: { status: 'READY' }
        });
        console.log("Order Updated to READY:", updated.status);

        // 5. Verify Fetch Logic (for Seller Dashboard)
        const storeOrders = await prisma.order.findMany({
            where: {
                items: {
                    some: {
                        variant: {
                            product: {
                                storeId: variant.product.storeId
                            }
                        }
                    }
                }
            }
        });

        const found = storeOrders.find(o => o.id === order.id);
        if (found) {
            console.log("SUCCESS: Order found via Store ID filtering");
        } else {
            console.error("FAILURE: Order NOT found via Store ID filtering");
        }

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
