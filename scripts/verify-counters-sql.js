const { Client } = require('pg');

async function verifyCounters() {
    console.log('🔌 Connecting to Database...');

    if (!process.env.DATABASE_URL) {
        console.error('❌ DATABASE_URL is missing in environment variables.');
        process.exit(1);
    }

    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false } // Required for Neon/Vercel Postgres usually
    });

    try {
        await client.connect();
        console.log('✅ Connected.\n');

        console.log('--- 📊 DATABASE COUNTERS VERIFICATION ---\n');

        // 1. Users by Role
        const usersRes = await client.query(`
      SELECT role, COUNT(*)::int as count 
      FROM "User" 
      GROUP BY role 
      ORDER BY count DESC
    `);
        console.log('👥 Users by Role:');
        usersRes.rows.forEach(row => console.log(`   - ${row.role}: ${row.count}`));
        const totalUsers = usersRes.rows.reduce((sum, r) => sum + r.count, 0);
        console.log(`   = TOTAL: ${totalUsers}\n`);

        // 2. Stores
        const storesRes = await client.query(`
      SELECT verified, COUNT(*)::int as count 
      FROM "Store" 
      GROUP BY verified
    `);
        console.log('🏪 Stores:');
        storesRes.rows.forEach(row => console.log(`   - ${row.verified ? 'Verified' : 'Pending'}: ${row.count}`));
        const totalStores = storesRes.rows.reduce((sum, r) => sum + r.count, 0);
        console.log(`   = TOTAL: ${totalStores}\n`);

        // 3. Products by Status
        const productsRes = await client.query(`
      SELECT status, COUNT(*)::int as count 
      FROM "Product" 
      GROUP BY status
    `);
        console.log('📦 Products:');
        productsRes.rows.forEach(row => console.log(`   - ${row.status}: ${row.count}`));
        const totalProducts = productsRes.rows.reduce((sum, r) => sum + r.count, 0);
        console.log(`   = TOTAL: ${totalProducts}\n`);

        // 4. Orders by Status
        const ordersRes = await client.query(`
      SELECT status, COUNT(*)::int as count 
      FROM "Order" 
      GROUP BY status
    `);
        console.log('🛒 Orders:');
        ordersRes.rows.forEach(row => console.log(`   - ${row.status}: ${row.count}`));
        const totalOrders = ordersRes.rows.reduce((sum, r) => sum + r.count, 0);
        console.log(`   = TOTAL: ${totalOrders}\n`);

        // 5. Revenue
        const revenueRes = await client.query(`
      SELECT SUM(total)::float as revenue, AVG(total)::float as avg_order
      FROM "Order"
    `);
        const revenue = revenueRes.rows[0];
        console.log('💰 Revenue:');
        console.log(`   - Total Revenue: ${revenue.revenue ? revenue.revenue.toFixed(2) : 0} DZD`);
        console.log(`   - Avg Order Value: ${revenue.avg_order ? revenue.avg_order.toFixed(2) : 0} DZD\n`);

        console.log('--- 🛑 ANOMALY CHECKS ---');

        // Check for orphan products (no store)
        const orphanProducts = await client.query(`SELECT COUNT(*) as count FROM "Product" WHERE "storeId" IS NULL`);
        if (orphanProducts.rows[0].count > 0) console.log(`⚠️  ${orphanProducts.rows[0].count} Products have NO STORE.`);
        else console.log('✅ All products have a store.');

        // Check for orphan variants (no product)
        const orphanVariants = await client.query(`SELECT COUNT(*) as count FROM "Variant" WHERE "productId" IS NULL`);
        if (orphanVariants.rows[0].count > 0) console.log(`⚠️  ${orphanVariants.rows[0].count} Variants have NO PRODUCT.`);
        else console.log('✅ All variants have a product.');

        // Check for negative stock
        const negativeStock = await client.query(`SELECT COUNT(*) as count FROM "Variant" WHERE stock < 0`);
        if (negativeStock.rows[0].count > 0) console.log(`⚠️  ${negativeStock.rows[0].count} Variants have NEGATIVE STOCK.`);
        else console.log('✅ No negative stock found.');

    } catch (err) {
        console.error('❌ Verification Error:', err);
    } finally {
        await client.end();
    }
}

verifyCounters();
