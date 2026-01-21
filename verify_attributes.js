
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log("Starting Product Attribute Verification...");

        // 1. Get a store to attach product to
        const store = await prisma.store.findFirst();
        if (!store) {
            console.log("No store found, cannot test product creation");
            return;
        }

        // 2. Create Product with NEW Attributes
        const product = await prisma.product.create({
            data: {
                title: "Test Product with Attributes " + Date.now(),
                description: "Test description",
                price: 5000,
                images: "/test.jpg",
                storeId: store.id,
                status: "APPROVED",
                // NEW FIELDS
                material: "100% Cotton",
                fit: "Slim Fit",
                dimensions: "M",
                warranty: "12 Months",
                promotionLabel: "PROMO",
                discountPrice: 4500,
                technicalSpecs: "Battery: 5000mAh"
            }
        });

        console.log("Product Created:", product.id);

        // 3. Verify Fields
        const fetched = await prisma.product.findUnique({
            where: { id: product.id }
        });

        if (fetched.material === "100% Cotton" && fetched.warranty === "12 Months") {
            console.log("SUCCESS: New attributes saved correctly!");
        } else {
            console.error("FAILURE: Attributes not matches:", fetched);
        }

        // Cleanup
        await prisma.product.delete({ where: { id: product.id } });
        console.log("Cleanup done.");

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
