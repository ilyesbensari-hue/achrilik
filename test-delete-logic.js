const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testCascadeDelete() {
    const testEmail = 'todelete@test.com';
    console.log('🧪 Test de suppression en cascade...');

    try {
        // 1. Clean up old test data if exists
        const oldUser = await prisma.user.findUnique({ where: { email: testEmail } });
        if (oldUser) {
            console.log('🧹 Nettoyage ancien user test...');
            await prisma.user.delete({ where: { id: oldUser.id } }).catch(() => { });
            // Note: simple delete might fail if constraints exist, but we assume it's clean for now or logic handles it
        }

        // 2. Create User, Product, Order
        console.log('📝 Création données test...');
        const user = await prisma.user.create({
            data: {
                email: testEmail,
                password: 'password123',
                name: 'To Delete',
                role: 'BUYER'
            }
        });

        // Create a dummy store & product for the order (using existing store/product if needed, or creating simple one)
        // Let's attach to an existing product to simplify, or create one.
        // We'll create a dummy order linked to this user.

        // We need a product. Let's find one.
        const product = await prisma.product.findFirst();
        if (!product) {
            console.log('⚠️ Aucun produit trouvé, impossible de créer une commande test complète.');
            // Just create user to test at least that
        } else {
            // Create Variant if needed (usually exists)
            const variant = await prisma.variant.findFirst({ where: { productId: product.id } });

            if (variant) {
                const order = await prisma.order.create({
                    data: {
                        userId: user.id,
                        total: 1000,
                        paymentMethod: 'CASH',
                        deliveryType: 'DELIVERY',
                        status: 'PENDING',
                        OrderItem: {
                            create: {
                                variantId: variant.id,
                                quantity: 1,
                                price: 1000
                            }
                        }
                    }
                });
                console.log(`✅ Commande créée: ${order.id} pour user ${user.id}`);
            }
        }

        // 3. EXECUTE DELETION LOGIC (Same as API)
        console.log('🗑️ Exécution de la suppression (Logique API)...');

        await prisma.$transaction(async (tx) => {
            const id = user.id;

            // 1. OrderItems
            const userOrders = await tx.order.findMany({
                where: { userId: id },
                select: { id: true }
            });
            const orderIds = userOrders.map(o => o.id);
            if (orderIds.length > 0) {
                await tx.orderItem.deleteMany({ where: { orderId: { in: orderIds } } });
            }

            // 2. Orders
            await tx.order.deleteMany({ where: { userId: id } });

            // 3. Reviews/Wishlist (Empty here)
            await tx.review.deleteMany({ where: { userId: id } });
            await tx.wishlist.deleteMany({ where: { userId: id } });
            await tx.passwordResetToken.deleteMany({ where: { userId: id } });

            // 4. User
            await tx.user.delete({ where: { id } });
        });

        console.log('✨ Suppression terminée sans erreur !');

        // 4. VERIFY
        const checkUser = await prisma.user.findUnique({ where: { email: testEmail } });
        if (!checkUser) {
            console.log('✅ VÉRIFIÉ: Utilisateur bien supprimé.');
        } else {
            console.error('❌ ÉCHEC: Utilisateur toujours présent.');
        }

    } catch (e) {
        console.error('❌ Erreur durant le test:', e);
    } finally {
        await prisma.$disconnect();
    }
}

testCascadeDelete();
