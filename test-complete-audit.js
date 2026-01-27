/**
 * Script de Test Complet - Achrilik E-commerce
 * Vérifie toutes les fonctionnalités avant déploiement
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    bold: '\x1b[1m'
};

function log(emoji, message, color = colors.reset) {
    console.log(`${color}${emoji} ${message}${colors.reset}`);
}

function success(message) {
    log('✅', message, colors.green);
}

function error(message) {
    log('❌', message, colors.red);
}

function info(message) {
    log('ℹ️', message, colors.blue);
}

function warn(message) {
    log('⚠️', message, colors.yellow);
}

let passedTests = 0;
let failedTests = 0;
const issues = [];

async function testDatabase() {
    console.log('\n' + colors.bold + '📊 TEST 1: BASE DE DONNÉES' + colors.reset);
    console.log('='.repeat(50));

    try {
        // Test connection
        await prisma.$connect();
        success('Connexion database OK');
        passedTests++;

        // Test models
        const models = [
            { name: 'User', query: () => prisma.user.count() },
            { name: 'Store', query: () => prisma.store.count() },
            { name: 'Product', query: () => prisma.product.count() },
            { name: 'Category', query: () => prisma.category.count() },
            { name: 'Order', query: () => prisma.order.count() },
            { name: 'Variant', query: () => prisma.variant.count() },
            { name: 'Review', query: () => prisma.review.count() },
            { name: 'Wishlist', query: () => prisma.wishlist.count() },
        ];

        for (const model of models) {
            try {
                const count = await model.query();
                success(`${model.name}: ${count} enregistrements`);
                passedTests++;
            } catch (e) {
                error(`${model.name}: ERREUR - ${e.message}`);
                failedTests++;
                issues.push(`Database: ${model.name} inaccessible`);
            }
        }

    } catch (e) {
        error(`Connexion database échouée: ${e.message}`);
        failedTests++;
        issues.push('Database connection failed');
    }
}

async function testCategories() {
    console.log('\n' + colors.bold + '📁 TEST 2: CATÉGORIES' + colors.reset);
    console.log('='.repeat(50));

    try {
        const categories = await prisma.category.findMany({
            include: {
                other_Category: true
            }
        });

        success(`${categories.length} catégories trouvées`);
        passedTests++;

        // Test catégorie Bébé
        const bebeCategory = categories.find(c => c.slug === 'bebe');
        if (bebeCategory) {
            success(`Catégorie "Bébé" trouvée avec ${bebeCategory.other_Category.length} sous-catégories`);
            passedTests++;

            const subCategories = ['Bodies', 'Ensembles', 'Pyjamas'];
            const foundSubs = bebeCategory.other_Category.map(c => c.name);
            const allFound = subCategories.every(sub => foundSubs.some(f => f.includes(sub)));

            if (allFound) {
                success('Toutes les sous-catégories Bébé présentes');
                passedTests++;
            } else {
                warn('Certaines sous-catégories Bébé manquantes');
                failedTests++;
            }
        } else {
            error('Catégorie "Bébé" non trouvée');
            failedTests++;
            issues.push('Catégorie Bébé manquante');
        }

        // Test catégories principales
        const mainCategories = ['Vêtements', 'Accessoires', 'Maison & Décoration'];
        let mainFound = 0;
        mainCategories.forEach(name => {
            const found = categories.some(c => c.name === name);
            if (found) {
                mainFound++;
            }
        });

        info(`${mainFound}/${mainCategories.length} catégories principales trouvées`);

    } catch (e) {
        error(`Test catégories échoué: ${e.message}`);
        failedTests++;
    }
}

async function testUsers() {
    console.log('\n' + colors.bold + '👤 TEST 3: UTILISATEURS' + colors.reset);
    console.log('='.repeat(50));

    try {
        const users = await prisma.user.findMany();
        success(`${users.length} utilisateurs en DB`);
        passedTests++;

        // Count by role
        const buyers = users.filter(u => u.role === 'BUYER').length;
        const sellers = users.filter(u => u.role === 'SELLER').length;
        const admins = users.filter(u => u.role === 'ADMIN').length;

        info(`BUYER: ${buyers}, SELLER: ${sellers}, ADMIN: ${admins}`);

        if (admins > 0) {
            success(`${admins} admin(s) trouvé(s)`);
            passedTests++;
        } else {
            warn('Aucun admin trouvé');
            issues.push('No admin users');
        }

        // Test admin user
        const adminUser = users.find(u => u.email === 'admin@achrilik.com');
        if (adminUser) {
            success('Compte admin@achrilik.com existe');
            passedTests++;
        } else {
            warn('Compte admin@achrilik.com non trouvé');
        }

    } catch (e) {
        error(`Test utilisateurs échoué: ${e.message}`);
        failedTests++;
    }
}

async function testStores() {
    console.log('\n' + colors.bold + '🏪 TEST 4: BOUTIQUES' + colors.reset);
    console.log('='.repeat(50));

    try {
        const stores = await prisma.store.findMany({
            include: {
                Product: true,
                User: true
            }
        });

        success(`${stores.length} boutiques trouvées`);
        passedTests++;

        // Check Click & Collect
        const withCC = stores.filter(s => s.clickCollect).length;
        info(`${withCC} boutiques avec Click & Collect`);

        // Check coordinates
        const withCoords = stores.filter(s => s.latitude && s.longitude).length;
        if (withCoords > 0) {
            success(`${withCoords} boutiques avec coordonnées GPS`);
            passedTests++;
        } else {
            warn('Aucune boutique avec coordonnées GPS');
        }

        // Check products per store
        let totalProducts = 0;
        stores.forEach(store => {
            totalProducts += store.Product.length;
            if (store.Product.length > 0) {
                info(`${store.name}: ${store.Product.length} produits`);
            }
        });

        if (totalProducts > 0) {
            success(`${totalProducts} produits total distribués`);
            passedTests++;
        } else {
            warn('Aucun produit trouvé');
        }

    } catch (e) {
        error(`Test boutiques échoué: ${e.message}`);
        failedTests++;
    }
}

async function testProducts() {
    console.log('\n' + colors.bold + '📦 TEST 5: PRODUITS' + colors.reset);
    console.log('='.repeat(50));

    try {
        const products = await prisma.product.findMany({
            include: {
                Variant: true,
                Category: true,
                Store: true
            }
        });

        success(`${products.length} produits trouvés`);
        passedTests++;

        // Status breakdown
        const approved = products.filter(p => p.status === 'APPROVED').length;
        const pending = products.filter(p => p.status === 'PENDING').length;
        const rejected = products.filter(p => p.status === 'REJECTED').length;

        info(`APPROVED: ${approved}, PENDING: ${pending}, REJECTED: ${rejected}`);

        // Variants
        const withVariants = products.filter(p => p.Variant.length > 0).length;
        if (withVariants > 0) {
            success(`${withVariants} produits ont des variantes`);
            passedTests++;
        } else {
            warn('Aucun produit avec variantes');
        }

        // Categories
        const withCategory = products.filter(p => p.categoryId).length;
        info(`${withCategory}/${products.length} produits ont une catégorie`);

        // Images
        const withImages = products.filter(p => p.images && p.images.length > 0).length;
        if (withImages > 0) {
            success(`${withImages} produits ont des images`);
            passedTests++;
        }

    } catch (e) {
        error(`Test produits échoué: ${e.message}`);
        failedTests++;
    }
}

async function testOrders() {
    console.log('\n' + colors.bold + '🛒 TEST 6: COMMANDES' + colors.reset);
    console.log('='.repeat(50));

    try {
        const orders = await prisma.order.findMany({
            include: {
                OrderItem: true,
                User: true
            }
        });

        success(`${orders.length} commandes trouvées`);
        passedTests++;

        // Status
        const statuses = {};
        orders.forEach(o => {
            statuses[o.status] = (statuses[o.status] || 0) + 1;
        });

        Object.entries(statuses).forEach(([status, count]) => {
            info(`${status}: ${count} commandes`);
        });

        // Payment methods
        const paymentMethods = {};
        orders.forEach(o => {
            paymentMethods[o.paymentMethod] = (paymentMethods[o.paymentMethod] || 0) + 1;
        });

        info('Méthodes de paiement:');
        Object.entries(paymentMethods).forEach(([method, count]) => {
            info(`  - ${method}: ${count}`);
        });

        // Delivery types
        const deliveryTypes = {};
        orders.forEach(o => {
            deliveryTypes[o.deliveryType] = (deliveryTypes[o.deliveryType] || 0) + 1;
        });

        info('Types de livraison:');
        Object.entries(deliveryTypes).forEach(([type, count]) => {
            info(`  - ${type}: ${count}`);
        });

    } catch (e) {
        error(`Test commandes échoué: ${e.message}`);
        failedTests++;
    }
}

async function testDataIntegrity() {
    console.log('\n' + colors.bold + '🔍 TEST 7: INTÉGRITÉ DES DONNÉES' + colors.reset);
    console.log('='.repeat(50));

    try {
        // Orphan checks
        const productsWithoutStore = await prisma.product.count({
            where: { storeId: null }
        });

        if (productsWithoutStore === 0) {
            success('Aucun produit orphelin (sans boutique)');
            passedTests++;
        } else {
            warn(`${productsWithoutStore} produits sans boutique`);
            issues.push(`${productsWithoutStore} orphan products`);
        }

        // Variants without products
        const variants = await prisma.variant.findMany({
            include: { Product: true }
        });

        const orphanVariants = variants.filter(v => !v.Product).length;
        if (orphanVariants === 0) {
            success('Aucune variante orpheline');
            passedTests++;
        } else {
            warn(`${orphanVariants} variantes orphelines`);
        }

        // Orders without items
        const orders = await prisma.order.findMany({
            include: { OrderItem: true }
        });

        const emptyOrders = orders.filter(o => o.OrderItem.length === 0).length;
        if (emptyOrders === 0) {
            success('Aucune commande vide');
            passedTests++;
        } else {
            warn(`${emptyOrders} commandes vides`);
        }

    } catch (e) {
        error(`Test intégrité échoué: ${e.message}`);
        failedTests++;
    }
}

async function runAllTests() {
    console.log(colors.bold + colors.blue);
    console.log('╔══════════════════════════════════════════════════╗');
    console.log('║     AUDIT COMPLET - ACHRILIK E-COMMERCE         ║');
    console.log('║              Tests Pré-Déploiement              ║');
    console.log('╚══════════════════════════════════════════════════╝');
    console.log(colors.reset);

    try {
        await testDatabase();
        await testCategories();
        await testUsers();
        await testStores();
        await testProducts();
        await testOrders();
        await testDataIntegrity();

    } catch (e) {
        error(`ERREUR CRITIQUE: ${e.message}`);
    } finally {
        await prisma.$disconnect();

        // Summary
        console.log('\n' + colors.bold + '📋 RÉSUMÉ' + colors.reset);
        console.log('='.repeat(50));

        const total = passedTests + failedTests;
        const percentage = total > 0 ? Math.round((passedTests / total) * 100) : 0;

        console.log(`✅ Tests réussis: ${colors.green}${passedTests}${colors.reset}`);
        console.log(`❌ Tests échoués: ${colors.red}${failedTests}${colors.reset}`);
        console.log(`📊 Score: ${percentage}%`);

        if (issues.length > 0) {
            console.log('\n' + colors.yellow + '⚠️  PROBLÈMES IDENTIFIÉS:' + colors.reset);
            issues.forEach((issue, i) => {
                console.log(`  ${i + 1}. ${issue}`);
            });
        }

        console.log('\n' + colors.bold);
        if (failedTests === 0) {
            console.log(colors.green + '🎉 TOUS LES TESTS SONT PASSÉS! PRÊT POUR DÉPLOIEMENT! 🚀' + colors.reset);
            process.exit(0);
        } else {
            console.log(colors.red + '❌ CERTAINS TESTS ONT ÉCHOUÉ. CORRECTION REQUISE AVANT DÉPLOIEMENT.' + colors.reset);
            process.exit(1);
        }
    }
}

runAllTests().catch(console.error);
