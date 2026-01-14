
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        // 1. Get a test user
        const user = await prisma.user.findFirst({ where: { email: 'client_verify@test.com' } });
        if (!user) {
            console.log("User not found");
            return;
        }
        console.log("Original Name:", user.name);

        // 2. Simulate PATCH (Update Name & Address)
        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: {
                name: user.name + " Edited",
                address: "123 Rue Test",
                phone: "0550000000"
            }
        });

        console.log("Updated Name:", updatedUser.name);
        console.log("Updated Address:", updatedUser.address);

        if (updatedUser.address === "123 Rue Test") {
            console.log("SUCCESS: User address updated in DB.");
        } else {
            console.error("FAILURE: User address did not update.");
        }

        // 3. Revert change
        await prisma.user.update({
            where: { id: user.id },
            data: {
                name: 'Client Verify',
                address: null,
                phone: null
            }
        });
        console.log("Reverted to Original");

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
