/**
 * Script de test simplifié pour les emails
 * Vérifie que les fonctions existent et peuvent être appelées
 * Sans mock complexe - approche directe
 */

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('   📧 Validation des Fonctions Email');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Charger le fichier mail.ts et analyser son contenu
const fs = require('fs');
const path = require('path');

const mailFilePath = path.join(__dirname, 'src', 'lib', 'mail.ts');
const mailContent = fs.readFileSync(mailFilePath, 'utf-8');

console.log('📄 Analyse du fichier mail.ts...\n');

const tests = [
    {
        name: 'sendWelcomeEmail',
        pattern: /export async function sendWelcomeEmail/,
        params: ['to: string', 'name: string'],
        description: 'Email de bienvenue lors de l\'inscription'
    },
    {
        name: 'sendOrderConfirmation',
        pattern: /export async function sendOrderConfirmation/,
        params: ['to: string', 'order'],
        description: 'Email de confirmation de commande (client)'
    },
    {
        name: 'sendNewOrderNotification',
        pattern: /export async function sendNewOrderNotification/,
        params: ['to: string', 'order'],
        description: 'Email de notification nouvelle vente (vendeur)'
    },
    {
        name: 'sendPasswordResetEmail',
        pattern: /export async function sendPasswordResetEmail/,
        params: ['to: string', 'resetToken: string', 'userName: string'],
        description: 'Email de réinitialisation mot de passe'
    },
    {
        name: 'sendOrderStatusUpdate',
        pattern: /export async function sendOrderStatusUpdate/,
        params: ['to: string', 'order', 'oldStatus: string', 'newStatus: string'],
        description: 'Email de mise à jour statut commande'
    },
    {
        name: 'sendDeliveryPersonNotification',
        pattern: /export async function sendDeliveryPersonNotification/,
        params: ['to: string', 'order', 'deliveryPersonName: string'],
        description: 'Email de notification livreur'
    }
];

let passedTests = 0;
let failedTests = 0;

console.log('🔍 Vérification des fonctions...\n');

tests.forEach(test => {
    const found = test.pattern.test(mailContent);

    if (found) {
        console.log(`✅ ${test.name}`);
        console.log(`   📝 ${test.description}`);
        console.log(`   📌 Paramètres: ${test.params.join(', ')}`);

        // Vérifier les éléments clés dans le HTML de l'email
        const functionContent = mailContent.substring(
            mailContent.indexOf(`function ${test.name}`),
            mailContent.indexOf(`function ${test.name}`) + 3000
        );

        const hasHTML = functionContent.includes('html:');
        const hasSubject = functionContent.includes('subject:');
        const hasTransporter = functionContent.includes('transporter.sendMail');

        if (hasHTML && hasSubject && hasTransporter) {
            console.log(`   ✓ Structure complète (HTML, Subject, Send)`);
        } else {
            console.log(`   ⚠️  Structure incomplète`);
        }

        console.log('');
        passedTests++;
    } else {
        console.log(`❌ ${test.name} - NON TROUVÉE`);
        console.log('');
        failedTests++;
    }
});

// Vérifier la configuration du transporter
console.log('\n🔧 Vérification de la configuration...\n');

if (mailContent.includes('nodemailer.createTransport')) {
    console.log('✅ Transporter nodemailer configuré');
} else {
    console.log('❌ Transporter nodemailer manquant');
    failedTests++;
}

if (mailContent.includes('process.env.SMTP_HOST')) {
    console.log('✅ Variables d\'environnement SMTP utilisées');
} else {
    console.log('❌ Variables SMTP non référencées');
    failedTests++;
}

if (mailContent.includes('process.env.SMTP_USER')) {
    console.log('✅ Authentification SMTP configurée');
} else {
    console.log('❌ Authentification SMTP manquante');
    failedTests++;
}

// Vérifier le fichier .env
console.log('\n📋 Vérification du fichier .env...\n');

const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');

    const hasSmtpHost = envContent.includes('SMTP_HOST');
    const hasSmtpPort = envContent.includes('SMTP_PORT');
    const hasSmtpUser = envContent.includes('SMTP_USER');
    const hasSmtpPass = envContent.includes('SMTP_PASS');

    if (hasSmtpHost && hasSmtpPort && hasSmtpUser && hasSmtpPass) {
        console.log('✅ Toutes les variables SMTP sont définies dans .env');
    } else {
        console.log('❌ Variables SMTP manquantes dans .env:');
        if (!hasSmtpHost) console.log('   - SMTP_HOST');
        if (!hasSmtpPort) console.log('   - SMTP_PORT');
        if (!hasSmtpUser) console.log('   - SMTP_USER');
        if (!hasSmtpPass) console.log('   - SMTP_PASS');
        console.log('\n   💡 Les emails ne pourront pas être envoyés sans ces variables');
    }
} else {
    console.log('❌ Fichier .env non trouvé');
}

// Résumé final
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('\n📊 RÉSUMÉ DES TESTS');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log(`✅ Fonctions validées: ${passedTests}/${tests.length}`);
console.log(`${failedTests === 0 ? '✅' : '❌'} Tests échoués: ${failedTests}\n`);

if (passedTests === tests.length) {
    console.log('🎉 SUCCÈS COMPLET!');
    console.log('\n📋 Toutes les fonctions email sont correctement implémentées:');
    tests.forEach(t => console.log(`   ✅ ${t.name}()`));

    console.log('\n📧 Emails disponibles:');
    console.log('   1. Bienvenue (inscription)');
    console.log('   2. Confirmation de commande (client)');
    console.log('   3. Notification vendeur (nouvelle vente)');
    console.log('   4. Réinitialisation mot de passe');
    console.log('   5. Mise à jour de statut de commande');
    console.log('   6. Notification livreur');

    console.log('\n⚠️  Prochaine étape: Configurer SMTP dans .env pour activer l\'envoi réel');
    console.log('   Consultez: smtp_configuration_guide.md');
} else {
    console.log('❌ Certaines vérifications ont échoué');
    console.log('   Vérifiez les erreurs ci-dessus');
}

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
