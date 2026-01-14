
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const stores = await prisma.store.findMany();
  console.log('Total stores:', stores.length);
  stores.forEach(s => {
    console.log(`Store: ${s.name}, City: ${s.city}, Lat: ${s.latitude}, Lng: ${s.longitude}`);
  });
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
