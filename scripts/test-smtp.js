/**
 * SMTP Email Test Script avec Resend
 * 
 * Usage:
 *   node scripts/test-smtp.js
 * 
 * Prérequis:
 * 1. Créer compte sur resend.com
 * 2. Obtenir API key
 * 3. Ajouter RESEND_API_KEY dans .env
 */

const { Resend } = require('resend');

// Charger env vars
require('dotenv').config();

const resend = new Resend(process.env.RESEND_API_KEY);

async function testSMTP() {
    console.log('🧪 Test SMTP avec Resend...\n');

    // Vérifier API key
    if (!process.env.RESEND_API_KEY) {
        console.error('❌ ERREUR: RESEND_API_KEY non configurée dans .env');
        console.log('\n📋 Étapes:');
        console.log('1. Créer compte sur https://resend.com');
        console.log('2. Créer une API key');
        console.log('3. Ajouter dans .env: RESEND_API_KEY=re_...\n');
        process.exit(1);
    }

    // Email de test
    const testEmail = {
        from: 'Achrilik Contact <contact@achrilik.com>',
        to: 'achrilik@gmail.com',  // Email du vendeur
        subject: '[TEST] Configuration SMTP Achrilik',
        html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #C62828 0%, #D32F2F 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
        .success-badge { display: inline-block; background: #10b981; color: white; padding: 8px 16px; border-radius: 20px; font-weight: bold; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin: 0; font-size: 24px;">✅ Test SMTP Réussi</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Achrilik.com</p>
        </div>
        <div class="content">
            <div class="success-badge">🎉 Configuration validée</div>
            
            <h2 style="color: #C62828;">Résultat du Test</h2>
            <p>Si vous recevez cet email, la configuration SMTP avec Resend est <strong>fonctionnelle</strong>.</p>
            
            <h3>Fonctionnalités Email Actives</h3>
            <ul>
                <li>✅ Emails de confirmation de commande</li>
                <li>✅ Notifications aux vendeurs</li>
                <li>✅ Formulaire de contact</li>
                <li>✅ Emails d'inscription</li>
            </ul>
            
            <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px;">
                Test envoyé le ${new Date().toLocaleString('fr-FR')}
            </p>
        </div>
    </div>
</body>
</html>
        `
    };

    try {
        console.log('📧 Envoi email de test...');
        const result = await resend.emails.send(testEmail);

        console.log('\n✅ EMAIL ENVOYÉ AVEC SUCCÈS!');
        console.log('📬 ID:', result.id);
        console.log('📭 Vérifiez achrilik@gmail.com\n');

        console.log('🎉 Configuration SMTP validée!');
        console.log('\n✅ Prochaines étapes:');
        console.log('1. Vérifier réception email');
        console.log('2. Tester formulaire de contact');
        console.log('3. Tester commande complète\n');

    } catch (error) {
        console.error('\n❌ ERREUR lors de l\'envoi:');
        console.error(error);

        if (error.message.includes('401')) {
            console.log('\n💡 API KEY invalide. Vérifiez:');
            console.log('1. API key correcte dans .env');
            console.log('2. Compte Resend actif\n');
        }

        process.exit(1);
    }
}

// Exécuter test
testSMTP();
