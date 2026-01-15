const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkLastOrder() {
    try {
        const order = await prisma.order.findFirst({
            orderBy: { createdAt: 'desc' },
            include: { user: true, items: { include: { variant: { include: { product: true } } } } }
        });

        if (!order) {
            console.log("❌ Aucune commande trouvée.");
        } else {
            console.log("✅ Dernière commande trouvée !");
            console.log(`🆔 ID: ${order.id}`);
            console.log(`👤 Client: ${order.user.name || 'Anonyme'} (${order.user.email})`);
            console.log(`📅 Date: ${order.createdAt}`);
            console.log(`💰 Total: ${order.total} DA`);
            console.log(`📦 Statut: ${order.status}`);
            console.log(`🚚 Type: ${order.deliveryType}`);
            console.log("🛒 Articles :");
            order.items.forEach(item => {
                console.log(`   - ${item.quantity}x ${item.variant.product.title} (${item.variant.size}/${item.variant.color})`);
            });
        }
    } catch (e) {
        console.error("Erreur:", e);
    } finally {
        await prisma.$disconnect();
    }
}

checkLastOrder();
