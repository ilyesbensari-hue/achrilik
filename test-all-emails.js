/**
 * Script de test complet pour toutes les fonctions email d'Achrilik
 * 
 * Usage:
 *   node test-all-emails.js                    # Test tous les emails
 *   node test-all-emails.js welcome            # Test email de bienvenue uniquement
 *   node test-all-emails.js order              # Test confirmation commande uniquement
 *   node test-all-emails.js forgot-password    # Test mot de passe oublié uniquement
 */

require('dotenv').config();
const path = require('path');

// Simuler l'environnement Next.js
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// Importer les fonctions email
const mailLib = require('./src/lib/mail.ts');

const TEST_EMAIL = process.env.SMTP_USER || 'test@example.com';

// Données de test
const mockUser = {
    id: 'test_user_123',
    name: 'Test User',
    email: TEST_EMAIL,
};

const mockOrder = {
    id: 'test_order_abc123def456',
    total: 5990,
    deliveryType: 'DELIVERY',
    status: 'PENDING',
    paymentMethod: 'CASH',
    trackingNumber: 'TRACK123456',
    shippingName: 'Test User',
    shippingAddress: '123 Rue de Test',
    shippingCity: 'Alger',
    shippingPhone: '+213 555 123 456',
    storeName: 'Boutique Test',
    storeAddress: '456 Avenue du Vendeur',
    storeCity: 'Oran',
    notes: 'Ceci est une commande de test pour validation des emails',
    user: mockUser,
    items: [
        { product: { title: 'T-Shirt Premium' }, quantity: 2, price: 2500 },
        { product: { title: 'Jean Slim' }, quantity: 1, price: 4990 },
    ],
};

// Tests individuels
const tests = {
    async welcome() {
        console.log('\n📧 Test: Email de Bienvenue');
        console.log('─────────────────────────────────────');
        await mailLib.sendWelcomeEmail(TEST_EMAIL, mockUser.name);
        console.log('✅ Email de bienvenue envoyé');
        console.log(`📬 Destinataire: ${TEST_EMAIL}`);
    },

    async orderConfirmation() {
        console.log('\n📧 Test: Confirmation de Commande');
        console.log('─────────────────────────────────────');
        await mailLib.sendOrderConfirmation(TEST_EMAIL, mockOrder);
        console.log('✅ Email de confirmation envoyé');
        console.log(`📬 Destinataire: ${TEST_EMAIL}`);
        console.log(`💰 Montant: ${mockOrder.total} DA`);
    },

    async sellerNotification() {
        console.log('\n📧 Test: Notification Vendeur (Nouvelle Vente)');
        console.log('─────────────────────────────────────');
        await mailLib.sendNewOrderNotification(TEST_EMAIL, mockOrder);
        console.log('✅ Email de notification vendeur envoyé');
        console.log(`📬 Destinataire: ${TEST_EMAIL}`);
    },

    async forgotPassword() {
        console.log('\n📧 Test: Mot de Passe Oublié');
        console.log('─────────────────────────────────────');
        const resetToken = 'test_token_' + Date.now();
        await mailLib.sendPasswordResetEmail(TEST_EMAIL, resetToken, mockUser.name);
        console.log('✅ Email de réinitialisation envoyé');
        console.log(`📬 Destinataire: ${TEST_EMAIL}`);
        console.log(`🔑 Token: ${resetToken}`);
        console.log(`🔗 Lien: ${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/reset-password/${resetToken}`);
    },

    async statusUpdate() {
        console.log('\n📧 Test: Mise à Jour de Statut Commande');
        console.log('─────────────────────────────────────');
        const updatedOrder = { ...mockOrder, status: 'CONFIRMED' };
        await mailLib.sendOrderStatusUpdate(TEST_EMAIL, updatedOrder, 'PENDING', 'CONFIRMED');
        console.log('✅ Email de mise à jour de statut envoyé');
        console.log(`📬 Destinataire: ${TEST_EMAIL}`);
        console.log(`📊 Statut: PENDING → CONFIRMED`);
    },

    async deliveryNotification() {
        console.log('\n📧 Test: Notification Livreur');
        console.log('─────────────────────────────────────');
        const deliveryPerson = 'Mohamed Livreur';
        await mailLib.sendDeliveryPersonNotification(TEST_EMAIL, mockOrder, deliveryPerson);
        console.log('✅ Email de notification livreur envoyé');
        console.log(`📬 Destinataire: ${TEST_EMAIL}`);
        console.log(`👤 Livreur: ${deliveryPerson}`);
    },
};

async function runTests(specificTest) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('   📧 Test Complet des Emails - Achrilik');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Vérifier la configuration
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.error('❌ Configuration SMTP manquante!');
        console.log('\n💡 Exécutez d\'abord: node test-smtp.js');
        process.exit(1);
    }

    console.log('🔧 Configuration:');
    console.log(`   Email de test: ${TEST_EMAIL}`);
    console.log(`   Environnement: ${process.env.NODE_ENV}`);
    console.log(`   URL publique: ${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}`);

    try {
        if (specificTest) {
            // Test spécifique
            const testName = specificTest.toLowerCase().replace(/-/g, '');
            const testMap = {
                'welcome': 'welcome',
                'order': 'orderConfirmation',
                'seller': 'sellerNotification',
                'forgotpassword': 'forgotPassword',
                'status': 'statusUpdate',
                'delivery': 'deliveryNotification',
            };

            const testKey = testMap[testName];
            if (tests[testKey]) {
                await tests[testKey]();
            } else {
                console.error(`\n❌ Test inconnu: ${specificTest}`);
                console.log('\n📋 Tests disponibles:');
                console.log('   - welcome');
                console.log('   - order');
                console.log('   - seller');
                console.log('   - forgot-password');
                console.log('   - status');
                console.log('   - delivery');
                process.exit(1);
            }
        } else {
            // Tous les tests
            await tests.welcome();
            await delay(2000);

            await tests.orderConfirmation();
            await delay(2000);

            await tests.sellerNotification();
            await delay(2000);

            await tests.forgotPassword();
            await delay(2000);

            await tests.statusUpdate();
            await delay(2000);

            await tests.deliveryNotification();
        }

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ Tous les tests terminés avec succès!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`\n📬 Vérifiez votre boîte email: ${TEST_EMAIL}`);
        console.log('   Vous devriez avoir reçu ' + (specificTest ? '1 email' : '6 emails'));

        console.log('\n📊 Résumé des emails envoyés:');
        if (!specificTest) {
            console.log('   ✅ Email de bienvenue');
            console.log('   ✅ Confirmation de commande');
            console.log('   ✅ Notification vendeur');
            console.log('   ✅ Réinitialisation mot de passe');
            console.log('   ✅ Mise à jour de statut');
            console.log('   ✅ Notification livreur');
        } else {
            console.log(`   ✅ ${specificTest}`);
        }

    } catch (error) {
        console.error('\n❌ Erreur lors des tests:', error);
        console.error(error.stack);
        process.exit(1);
    }
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Exécution
const specificTest = process.argv[2];
runTests(specificTest);
