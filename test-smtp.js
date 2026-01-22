const nodemailer = require('nodemailer');
require('dotenv').config();

async function testSMTP() {
    console.log('🔍 Configuration SMTP:');
    console.log('Host:', process.env.SMTP_HOST);
    console.log('Port:', process.env.SMTP_PORT);
    console.log('User:', process.env.SMTP_USER);
    console.log('Pass:', process.env.SMTP_PASS ? '✓ Défini' : '✗ Manquant');

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.error('\n❌ Variables SMTP manquantes dans .env');
        console.log('\n💡 Ajoutez ces lignes dans votre fichier .env:');
        console.log('SMTP_HOST=smtp.gmail.com');
        console.log('SMTP_PORT=465');
        console.log('SMTP_USER=votre-email@gmail.com');
        console.log('SMTP_PASS=votre-app-password');
        process.exit(1);
    }

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT),
        secure: process.env.SMTP_PORT === '465',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    try {
        console.log('\n📧 Test de connexion SMTP...');
        await transporter.verify();
        console.log('✅ Connexion SMTP réussie!');

        console.log('\n📨 Envoi d\'un email de test...');
        const info = await transporter.sendMail({
            from: `"Achrilik Test" <${process.env.SMTP_USER}>`,
            to: process.env.SMTP_USER,
            subject: '✅ Test SMTP Achrilik - Configuration Réussie',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; background: #f9f9f9;">
                    <div style="background: white; padding: 30px; border-radius: 8px; max-width: 600px; margin: 0 auto;">
                        <h1 style="color: #006233;">✅ Succès!</h1>
                        <p>Votre configuration SMTP fonctionne correctement.</p>
                        <div style="background: #e8f5f0; padding: 15px; border-radius: 5px; margin: 20px 0;">
                            <h3>🔧 Configuration utilisée:</h3>
                            <ul style="list-style: none; padding: 0;">
                                <li><strong>Host:</strong> ${process.env.SMTP_HOST}</li>
                                <li><strong>Port:</strong> ${process.env.SMTP_PORT}</li>
                                <li><strong>User:</strong> ${process.env.SMTP_USER}</li>
                                <li><strong>Secure:</strong> ${process.env.SMTP_PORT === '465' ? 'Oui (SSL)' : 'Non (TLS)'}</li>
                            </ul>
                        </div>
                        <p style="color: #666;">
                            Vous pouvez maintenant tester les emails de l'application:
                        </p>
                        <ul>
                            <li>Email de bienvenue (inscription)</li>
                            <li>Confirmation de commande</li>
                            <li>Notification vendeur</li>
                            <li>Réinitialisation mot de passe</li>
                        </ul>
                        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                        <p style="color: #999; font-size: 12px;">
                            Ceci est un email de test automatique envoyé depuis le script test-smtp.js
                        </p>
                    </div>
                </div>
            `
        });

        console.log('✅ Email de test envoyé avec succès!');
        console.log(`📬 Message ID: ${info.messageId}`);
        console.log(`📬 Vérifiez votre boîte email: ${process.env.SMTP_USER}`);
        console.log('\n🎉 Configuration SMTP validée! Vous pouvez maintenant utiliser les emails dans votre application.');

    } catch (error) {
        console.error('\n❌ Erreur lors du test SMTP:', error.message);

        if (error.code === 'EAUTH') {
            console.log('\n💡 Problème d\'authentification détecté:');
            console.log('   ⚠️  Vous utilisez probablement votre mot de passe Gmail normal');
            console.log('   ✅  Vous devez créer un "App Password" Gmail:');
            console.log('       1. Allez sur https://myaccount.google.com/security');
            console.log('       2. Activez la validation en 2 étapes si nécessaire');
            console.log('       3. Cherchez "App Passwords"');
            console.log('       4. Créez un nouveau mot de passe pour "Achrilik"');
            console.log('       5. Utilisez ce mot de passe dans SMTP_PASS');
        } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED') {
            console.log('\n💡 Problème de connexion réseau:');
            console.log('   ⚠️  Impossible de se connecter au serveur SMTP');
            console.log('   ✅  Solutions possibles:');
            console.log('       1. Vérifiez votre connexion Internet');
            console.log('       2. Essayez le port 587 au lieu de 465 (TLS au lieu de SSL)');
            console.log('       3. Vérifiez que votre firewall n\'bloque pas le port');
        } else if (error.code === 'ESOCKET') {
            console.log('\n💡 Problème de socket:');
            console.log('   ⚠️  Erreur de communication avec le serveur');
            console.log('   ✅  Essayez de changer SMTP_PORT de 465 à 587');
        }

        console.log('\n📚 Pour plus d\'aide, consultez:');
        console.log('   smtp_configuration_guide.md');

        process.exit(1);
    }
}

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('   📧 Test de Configuration SMTP - Achrilik');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

testSMTP();
