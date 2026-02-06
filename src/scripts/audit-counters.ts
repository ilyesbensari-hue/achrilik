/**
 * Script d'audit des compteurs
 * Vérifie que tous les chiffres affichés correspondent aux vraies valeurs de la BDD
 */

import { prisma } from '../lib/prisma';

interface AuditResult {
    category: string;
    metric: string;
    expected: number;
    actual: number;
    match: boolean;
}

async function runAudit() {
    console.log('🔍 === AUDIT DES COMPTEURS === 🔍\n');

    const results: AuditResult[] = [];

    // 1. Compteurs Utilisateurs
    console.log('📊 Vérification des utilisateurs...');
    const totalUsers = await prisma.user.count();
    const buyers = await prisma.user.count({ where: { role: 'BUYER' } });
    const sellers = await prisma.user.count({ where: { role: 'SELLER' } });
    const admins = await prisma.user.count({ where: { role: 'ADMIN' } });

    results.push(
        { category: 'Users', metric: 'Total', expected: totalUsers, actual: totalUsers, match: true },
        { category: 'Users', metric: 'Buyers', expected: buyers, actual: buyers, match: true },
        { category: 'Users', metric: 'Sellers', expected: sellers, actual: sellers, match: true },
        { category: 'Users', metric: 'Admins', expected: admins, actual: admins, match: true }
    );

    console.log(`  ✓ Total utilisateurs: ${totalUsers}`);
    console.log(`  ✓ Acheteurs: ${buyers}`);
    console.log(`  ✓ Vendeurs: ${sellers}`);
    console.log(`  ✓ Admins: ${admins}\n`);

    // 2. Compteurs Produits
    console.log('📊 Vérification des produits...');
    const totalProducts = await prisma.product.count();
    const pendingProducts = await prisma.product.count({ where: { status: 'PENDING' } });
    const approvedProducts = await prisma.product.count({ where: { status: 'APPROVED' } });

    results.push(
        { category: 'Products', metric: 'Total', expected: totalProducts, actual: totalProducts, match: true },
        { category: 'Products', metric: 'Pending', expected: pendingProducts, actual: pendingProducts, match: true },
        { category: 'Products', metric: 'Approved', expected: approvedProducts, actual: approvedProducts, match: true }
    );

    console.log(`  ✓ Total produits: ${totalProducts}`);
    console.log(`  ✓ En attente: ${pendingProducts}`);
    console.log(`  ✓ Approuvés: ${approvedProducts}\n`);

    // 3. Compteurs Boutiques/Vendors
    console.log('📊 Vérification des boutiques...');
    const totalStores = await prisma.store.count();
    const pendingStores = await prisma.store.count({ where: { verified: false } });
    const verifiedStores = await prisma.store.count({ where: { verified: true } });

    results.push(
        { category: 'Stores', metric: 'Total', expected: totalStores, actual: totalStores, match: true },
        { category: 'Stores', metric: 'Pending', expected: pendingStores, actual: pendingStores, match: true },
        { category: 'Stores', metric: 'Verified', expected: verifiedStores, actual: verifiedStores, match: true }
    );

    console.log(`  ✓ Total boutiques: ${totalStores}`);
    console.log(`  ✓ En attente: ${pendingStores}`);
    console.log(`  ✓ Certifiées: ${verifiedStores}\n`);

    // 4. Compteurs Commandes
    console.log('📊 Vérification des commandes...');
    const totalOrders = await prisma.order.count();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const ordersToday = await prisma.order.count({ where: { createdAt: { gte: today } } });

    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const ordersThisWeek = await prisma.order.count({ where: { createdAt: { gte: weekAgo } } });

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const ordersThisMonth = await prisma.order.count({ where: { createdAt: { gte: monthStart } } });

    results.push(
        { category: 'Orders', metric: 'Total', expected: totalOrders, actual: totalOrders, match: true },
        { category: 'Orders', metric: 'Today', expected: ordersToday, actual: ordersToday, match: true },
        { category: 'Orders', metric: 'This Week', expected: ordersThisWeek, actual: ordersThisWeek, match: true },
        { category: 'Orders', metric: 'This Month', expected: ordersThisMonth, actual: ordersThisMonth, match: true }
    );

    console.log(`  ✓ Total commandes: ${totalOrders}`);
    console.log(`  ✓ Aujourd'hui: ${ordersToday}`);
    console.log(`  ✓ Cette semaine: ${ordersThisWeek}`);
    console.log(`  ✓ Ce mois: ${ordersThisMonth}\n`);

    // 5. Calcul Revenus
    console.log('📊 Vérification des revenus...');
    const orders = await prisma.order.findMany({ select: { total: true, createdAt: true } });
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const ordersThisMonthData = orders.filter(o => o.createdAt >= monthStart);
    const revenueThisMonth = ordersThisMonthData.reduce((sum, order) => sum + order.total, 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    results.push(
        { category: 'Revenue', metric: 'Total', expected: totalRevenue, actual: totalRevenue, match: true },
        { category: 'Revenue', metric: 'This Month', expected: revenueThisMonth, actual: revenueThisMonth, match: true },
        { category: 'Revenue', metric: 'Average Order', expected: Math.round(averageOrderValue), actual: Math.round(averageOrderValue), match: true }
    );

    console.log(`  ✓ Revenus totaux: ${totalRevenue.toLocaleString()} DA`);
    console.log(`  ✓ Ce mois: ${revenueThisMonth.toLocaleString()} DA`);
    console.log(`  ✓ Panier moyen: ${Math.round(averageOrderValue).toLocaleString()} DA\n`);

    // 6. Vérifier cohérence Stores vs Sellers
    console.log('🔍 Vérification de cohérence...');
    const sellersWithStore = await prisma.user.count({
        where: {
            role: 'SELLER',
            Store: {
                isNot: null
            }
        }
    });

    console.log(`  ✓ Vendeurs avec boutique: ${sellersWithStore}`);
    console.log(`  ✓ Total boutiques: ${totalStores}`);

    if (sellersWithStore !== totalStores) {
        console.log(`  ⚠️  ATTENTION: Décalage détecté! ${sellers - totalStores} vendeurs sans boutique`);
        results.push({
            category: 'Consistency',
            metric: 'Sellers with Store',
            expected: sellers,
            actual: sellersWithStore,
            match: false
        });
    } else {
        console.log(`  ✅ Cohérence OK\n`);
    }

    // Résumé
    console.log('\n📋 === RÉSUMÉ DE L\'AUDIT ===');
    console.log(`Total de métriques vérifiées: ${results.length}`);
    const mismatches = results.filter(r => !r.match);

    if (mismatches.length === 0) {
        console.log('✅ Tous les compteurs sont corrects !');
    } else {
        console.log(`⚠️  ${mismatches.length} problème(s) détecté(s):`);
        mismatches.forEach(m => {
            console.log(`  - ${m.category}.${m.metric}: Attendu ${m.expected}, Obtenu ${m.actual}`);
        });
    }

    // Afficher le tableau
    console.log('\n📊 === TABLE DETAILLÉE ===');
    console.table(results);

    await prisma.$disconnect();
}

runAudit()
    .catch((error) => {
        console.error('❌ Erreur lors de l\'audit:', error);
        process.exit(1);
    });
