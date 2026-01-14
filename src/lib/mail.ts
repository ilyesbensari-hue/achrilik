import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export async function sendOrderConfirmation(to: string, order: any) {
    if (!process.env.SMTP_USER) {
        console.log('⚠️ SMTP_USER not set. Skipping email sending.');
        console.log(`[Mock Email] To: ${to}, Subject: Confirmation de commande #${order.id}`);
        return;
    }

    try {
        const info = await transporter.sendMail({
            from: '"Achrilik Store" <no-reply@achrilik.com>',
            to: to,
            subject: `Confirmation de votre commande #${order.id.slice(0, 8)}`,
            html: `
                <div style="font-family: Arial, sans-serif; color: #333;">
                    <h1 style="color: #006233;">Merci pour votre commande !</h1>
                    <p>Bonjour,</p>
                    <p>Votre commande <strong>#${order.id.slice(0, 8)}</strong> a bien été enregistrée.</p>
                    
                    <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <h3>Récapitulatif</h3>
                        <p><strong>Total:</strong> ${order.total} DA</p>
                        <p><strong>Mode de livraison:</strong> ${order.deliveryType === 'CLICK_COLLECT' ? 'Click & Collect' : 'Livraison à domicile'}</p>
                    </div>

                    <p>Vous recevrez un autre email dès que votre commande sera traitée par le vendeur.</p>
                    <br>
                    <p>Cordialement,<br>L'équipe Achrilik</p>
                </div>
            `,
        });
        console.log("Message sent: %s", info.messageId);
    } catch (error) {
        console.error("Error sending order confirmation email:", error);
    }
}

export async function sendNewOrderNotification(to: string, order: any) {
    if (!process.env.SMTP_USER) {
        console.log('⚠️ SMTP_USER not set. Skipping email sending.');
        console.log(`[Mock Email] To: ${to}, Subject: Nouvelle vente ! #${order.id}`);
        return;
    }

    try {
        const info = await transporter.sendMail({
            from: '"Achrilik System" <system@achrilik.com>',
            to: to,
            subject: `💰 Nouvelle vente ! Commande #${order.id.slice(0, 8)}`,
            html: `
                <div style="font-family: Arial, sans-serif; color: #333;">
                    <h1 style="color: #006233;">Nouvelle commande reçue !</h1>
                    <p>Félicitations ! Vous avez réalisé une nouvelle vente.</p>
                    
                    <div style="background: #e8f5f0; padding: 15px; border-radius: 8px; border: 1px solid #006233; margin: 20px 0;">
                        <h3>Détails de la commande #${order.id.slice(0, 8)}</h3>
                        <p><strong>Montant:</strong> ${order.total} DA</p>
                        <p><strong>Client:</strong> ${order.user?.name || 'Client'}</p>
                        <p><strong>Articles:</strong> ${order.items?.length || 1}</p>
                    </div>

                    <p>Connectez-vous à votre tableau de bord vendeur pour traiter cette commande.</p>
                    <a href="${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/profile" style="background: #006233; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Gérer ma commande</a>
                </div>
            `,
        });
        console.log("Message sent: %s", info.messageId);
    } catch (error) {
        console.error("Error sending seller notification email:", error);
    }
}
