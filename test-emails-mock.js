/**
 * Tests des fonctions email SANS configuration SMTP
 * Utilise un système de mock pour valider la structure et les appels
 */

const fs = require('fs');
const path = require('path');

// Mock nodemailer avant d'importer mail.ts
const mockSendMail = jest.fn();
const mockVerify = jest.fn();

const nodemailerMock = {
    createTransport: () => ({
        sendMail: mockSendMail,
        verify: mockVerify
    })
};

// Remplacer nodemailer par notre mock
require.cache[require.resolve('nodemailer')] = {
    exports: nodemailerMock
};

// Configuration de test
process.env.SMTP_HOST = 'smtp.test.com';
process.env.SMTP_PORT = '465';
process.env.SMTP_USER = 'test@achrilik.com';
process.env.SMTP_PASS = 'test_password';
process.env.NEXT_PUBLIC_URL = 'https://www.achrilik.com';

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('   📧 Tests des Fonctions Email - Achrilik');
console.log('   Mode: Mock (Sans SMTP réel)');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Données de test
const mockUser = {
    id: 'user_123',
    name: 'Test User',
    email: 'test@example.com',
};

const mockOrder = {
    id: 'order_abc123def456789',
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
    notes: 'Test note',
    user: mockUser,
    items: [
        { product: { title: 'T-Shirt Premium' }, quantity: 2, price: 2500 },
    ],
};

const tests = [];
let passedTests = 0;
let failedTests = 0;

function test(name, fn) {
    tests.push({ name, fn });
}

async function runTests() {
    for (const { name, fn } of tests) {
        mockSendMail.mockClear();

        try {
            await fn();
            console.log(`✅ ${name}`);
            passedTests++;
        } catch (error) {
            console.log(`❌ ${name}`);
            console.log(`   Erreur: ${error.message}`);
            failedTests++;
        }
    }
}

// Fonction pour valider les appels email
function validateEmailCall(expectedSubject, expectedTo, expectedFromPattern) {
    if (mockSendMail.mock.calls.length === 0) {
        throw new Error('sendMail() n\'a pas été appelé');
    }

    const call = mockSendMail.mock.calls[0][0];

    if (!call.to || !call.to.includes(expectedTo)) {
        throw new Error(`Destinataire incorrect. Attendu: ${expectedTo}, Reçu: ${call.to}`);
    }

    if (!call.subject || !call.subject.includes(expectedSubject)) {
        throw new Error(`Sujet incorrect. Attendu: contient "${expectedSubject}", Reçu: ${call.subject}`);
    }

    if (!call.html || call.html.length < 100) {
        throw new Error('Contenu HTML manquant ou trop court');
    }

    if (expectedFromPattern && (!call.from || !call.from.includes(expectedFromPattern))) {
        throw new Error(`From incorrect. Attendu: contient "${expectedFromPattern}", Reçu: ${call.from}`);
    }

    return call;
}

// ==========================================
// TESTS
// ==========================================

test('Email de Bienvenue - Structure et Contenu', async () => {
    const { sendWelcomeEmail } = require('../src/lib/mail.ts');

    mockSendMail.mockResolvedValue({ messageId: 'test-message-id' });

    await sendWelcomeEmail('user@test.com', 'Jean Dupont');

    const call = validateEmailCall('Bienvenue', 'user@test.com', 'Achrilik');

    if (!call.html.includes('Jean Dupont')) {
        throw new Error('Le nom de l\'utilisateur n\'est pas dans l\'email');
    }

    if (!call.html.includes('achrilik.com')) {
        throw new Error('Le lien vers le site n\'est pas dans l\'email');
    }
});

test('Confirmation de Commande - Structure et Contenu', async () => {
    const { sendOrderConfirmation } = require('../src/lib/mail.ts');

    mockSendMail.mockResolvedValue({ messageId: 'test-message-id' });

    await sendOrderConfirmation('buyer@test.com', mockOrder);

    const call = validateEmailCall('Confirmation', 'buyer@test.com', 'Achrilik');

    if (!call.html.includes(mockOrder.id.slice(0, 8))) {
        throw new Error('Numéro de commande manquant');
    }

    if (!call.html.includes('5990')) {
        throw new Error('Montant de la commande manquant');
    }

    if (!call.html.includes('Livraison à domicile') && !call.html.includes('DELIVERY')) {
        throw new Error('Type de livraison manquant');
    }
});

test('Notification Vendeur - Structure et Contenu', async () => {
    const { sendNewOrderNotification } = require('../src/lib/mail.ts');

    mockSendMail.mockResolvedValue({ messageId: 'test-message-id' });

    await sendNewOrderNotification('seller@test.com', mockOrder);

    const call = validateEmailCall('Nouvelle vente', 'seller@test.com', 'Achrilik');

    if (!call.html.includes(mockOrder.id.slice(0, 8))) {
        throw new Error('Numéro de commande manquant');
    }

    if (!call.html.includes('5990')) {
        throw new Error('Montant manquant');
    }

    if (!call.html.includes('Test User')) {
        throw new Error('Nom du client manquant');
    }
});

test('Réinitialisation Mot de Passe - Structure et Contenu', async () => {
    const { sendPasswordResetEmail } = require('../src/lib/mail.ts');

    mockSendMail.mockResolvedValue({ messageId: 'test-message-id' });

    const resetToken = 'test_token_abc123';
    await sendPasswordResetEmail('user@test.com', resetToken, 'Jean Dupont');

    const call = validateEmailCall('Réinitialisation', 'user@test.com', 'Achrilik');

    if (!call.html.includes('Jean Dupont')) {
        throw new Error('Nom de l\'utilisateur manquant');
    }

    if (!call.html.includes(resetToken)) {
        throw new Error('Token de réinitialisation manquant dans le lien');
    }

    if (!call.html.includes('/reset-password/')) {
        throw new Error('URL de réinitialisation incorrecte');
    }

    if (!call.html.includes('1 heure')) {
        throw new Error('Information sur l\'expiration manquante');
    }
});

test('Mise à Jour de Statut - Structure et Contenu', async () => {
    const { sendOrderStatusUpdate } = require('../src/lib/mail.ts');

    mockSendMail.mockResolvedValue({ messageId: 'test-message-id' });

    const updatedOrder = { ...mockOrder, status: 'CONFIRMED' };
    await sendOrderStatusUpdate('buyer@test.com', updatedOrder, 'PENDING', 'CONFIRMED');

    const call = validateEmailCall('Mise à jour', 'buyer@test.com', 'Achrilik');

    if (!call.html.includes('CONFIRMED')) {
        throw new Error('Nouveau statut manquant');
    }

    if (!call.html.includes(mockOrder.id.slice(0, 8))) {
        throw new Error('Numéro de commande manquant');
    }
});

test('Notification Livreur - Structure et Contenu', async () => {
    const { sendDeliveryPersonNotification } = require('../src/lib/mail.ts');

    mockSendMail.mockResolvedValue({ messageId: 'test-message-id' });

    await sendDeliveryPersonNotification('delivery@test.com', mockOrder, 'Mohamed Livreur');

    const call = validateEmailCall('livraison', 'delivery@test.com', 'Achrilik');

    if (!call.html.includes('Mohamed Livreur')) {
        throw new Error('Nom du livreur manquant');
    }

    if (!call.html.includes('Alger')) {
        throw new Error('Adresse de livraison manquante');
    }

    if (!call.html.includes('Boutique Test')) {
        throw new Error('Informations vendeur manquantes');
    }

    if (!call.html.includes('5990')) {
        throw new Error('Montant à collecter manquant');
    }
});

test('Gestion des Erreurs - SMTP non configuré', async () => {
    // Sauvegarder les valeurs actuelles
    const savedUser = process.env.SMTP_USER;
    const savedPass = process.env.SMTP_PASS;

    // Supprimer temporairement la config
    delete process.env.SMTP_USER;
    delete process.env.SMTP_PASS;

    // Recharger le module
    delete require.cache[require.resolve('../src/lib/mail.ts')];
    const { sendWelcomeEmail } = require('../src/lib/mail.ts');

    // La fonction ne devrait PAS lancer d'erreur, juste retourner silencieusement
    await sendWelcomeEmail('test@test.com', 'Test');

    // Restaurer
    process.env.SMTP_USER = savedUser;
    process.env.SMTP_PASS = savedPass;

    // Pas d'exception = test réussi
});

// ==========================================
// EXÉCUTION
// ==========================================

runTests().then(() => {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`\n📊 Résultats: ${passedTests}/${tests.length} tests réussis`);

    if (failedTests === 0) {
        console.log('\n✅ TOUS LES TESTS SONT PASSÉS!');
        console.log('\n📋 Fonctions validées:');
        console.log('   ✅ sendWelcomeEmail()');
        console.log('   ✅ sendOrderConfirmation()');
        console.log('   ✅ sendNewOrderNotification()');
        console.log('   ✅ sendPasswordResetEmail()');
        console.log('   ✅ sendOrderStatusUpdate()');
        console.log('   ✅ sendDeliveryPersonNotification()');
        console.log('\n💡 Note: Tests exécutés en mode MOCK');
        console.log('   Les emails ne sont pas réellement envoyés');
        console.log('   Pour des tests réels, configurez SMTP dans .env');
    } else {
        console.log(`\n❌ ${failedTests} test(s) échoué(s)`);
        process.exit(1);
    }
}).catch(error => {
    console.error('\n❌ Erreur fatale:', error);
    process.exit(1);
});
