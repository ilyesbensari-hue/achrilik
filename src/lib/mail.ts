/* eslint-disable @typescript-eslint/no-explicit-any */
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: process.env.SMTP_PORT === '465', // true for 465, false for others
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

const SENDER_EMAIL = '"Achrilik" <contact@achrilik.com>';

export async function sendOrderConfirmation(to: string, order: any) {
    if (!process.env.SMTP_USER) return;

    try {
        await transporter.sendMail({
            from: SENDER_EMAIL,
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
    } catch (error) {
        console.error("Error sending order confirmation email:", error);
    }
}

export async function sendNewOrderNotification(to: string, order: any) {
    if (!process.env.SMTP_USER) return;

    try {
        await transporter.sendMail({
            from: SENDER_EMAIL,
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
                    <a href="${process.env.NEXT_PUBLIC_URL || 'https://achrilik.com'}/profile" style="background: #006233; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Gérer ma commande</a>
                </div>
            `,
        });
    } catch (error) {
        console.error("Error sending seller notification email:", error);
    }
}

export async function sendWelcomeEmail(to: string, name: string) {
    if (!process.env.SMTP_USER) return;

    try {
        await transporter.sendMail({
            from: SENDER_EMAIL,
            to: to,
            subject: 'Bienvenue sur Achrilik !',
            html: `
                <div style="font-family: Arial, sans-serif; color: #333;">
                    <h1 style="color: #006233;">Bienvenue ${name} !</h1>
                    <p>Nous sommes ravis de vous compter parmi nous.</p>
                    <p>Toute l'équipe d'Achrilik vous souhaite de bons achats.</p>
                    <a href="${process.env.NEXT_PUBLIC_URL || 'https://achrilik.com'}" style="background: #006233; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Commencer mes achats</a>
                </div>
            `,
        });
    } catch (error) {
        console.error("Error sending welcome email:", error);
    }
}

// Send order status update email
export async function sendOrderStatusUpdate(to: string, order: any, oldStatus: string, newStatus: string) {
    if (!process.env.SMTP_USER) return;

    const statusMessages: Record<string, string> = {
        CONFIRMED: 'Votre commande a été confirmée par le vendeur.',
        READY: 'Votre commande est prête !',
        DELIVERED: 'Votre commande a été livrée. Merci pour votre achat !',
        CANCELLED: 'Votre commande a malheureusement été annulée.'
    };

    try {
        await transporter.sendMail({
            from: SENDER_EMAIL,
            to: to,
            subject: `Mise à jour de votre commande #${order.id.slice(0, 8)}`,
            html: `
                <div style="font-family: Arial, sans-serif; color: #333;">
                    <h1 style="color: #006233;">Mise à jour de commande</h1>
                    <p>Bonjour,</p>
                    <p>${statusMessages[newStatus] || `Statut mis à jour: ${newStatus}`}</p>
                    
                    <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <h3>Commande #${order.id.slice(0, 8)}</h3>
                        <p><strong>Nouveau statut:</strong> ${newStatus}</p>
                        <p><strong>Total:</strong> ${order.total} DA</p>
                        ${order.trackingNumber ? `<p><strong>Numéro de suivi:</strong> ${order.trackingNumber}</p>` : ''}
                    </div>

                    ${newStatus === 'READY' && order.deliveryType === 'CLICK_COLLECT' ?
                    '<p style="color: #006233; font-weight: bold;">📦 Votre commande est prête pour le retrait !</p>' : ''}
                    
                    ${newStatus === 'DELIVERED' ?
                    '<p>Nous espérons que votre commande vous satisfait. N\'hésitez pas à laisser un avis !</p>' : ''}

                    <br>
                    <a href=\"${process.env.NEXT_PUBLIC_URL || 'https://achrilik.com'}/profile\" 
                       style="background: #006233; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                        Voir ma commande
                    </a>
                    
                    <br><br>
                    <p>Cordialement,<br>L'équipe Achrilik</p>
                </div>
            `,
        });
    } catch (error) {
        console.error("Error sending status update email:", error);
    }
}

// Send password reset email
export async function sendPasswordResetEmail(to: string, resetToken: string, userName: string) {
    if (!process.env.SMTP_USER) return;

    const resetLink = `${process.env.NEXT_PUBLIC_URL || 'https://achrilik.com'}/reset-password/${resetToken}`;

    try {
        await transporter.sendMail({
            from: SENDER_EMAIL,
            to: to,
            subject: 'Réinitialisation de votre mot de passe - Achrilik',
            html: `
                <div style="font-family: Arial, sans-serif; color: #333;">
                    <h1 style="color: #006233;">Réinitialisation de mot de passe</h1>
                    <p>Bonjour ${userName},</p>
                    <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
                    
                    <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border: 1px solid #ffc107; margin: 20px 0;">
                        <p><strong>⚠️ Ce lien est valide pendant 1 heure seulement.</strong></p>
                    </div>

                    <p>Cliquez sur le bouton ci-dessous pour réinitialiser votre mot de passe:</p>
                    
                    <a href="${resetLink}" 
                       style="display: inline-block; background: #006233; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0;">
                        Réinitialiser mon mot de passe
                    </a>

                    <p style="color: #666; font-size: 14px;">
                        Ou copiez ce lien dans votre navigateur:<br>
                        <span style="word-break: break-all;">${resetLink}</span>
                    </p>
                    
                    <p style="color: #999; font-size: 12px; margin-top: 30px;">
                        Si vous n'avez pas demandé cette réinitialisation, ignorez cet email. 
                        Votre mot de passe actuel reste inchangé.
                    </p>
                    
                    <br>
                    <p>Cordialement,<br>L'équipe Achrilik</p>
                </div>
            `,
        });
    } catch (error) {
        console.error("Error sending password reset email:", error);
    }
}

// Send delivery person notification
export async function sendDeliveryPersonNotification(to: string, order: any, deliveryPersonName: string) {
    if (!process.env.SMTP_USER) return;

    try {
        await transporter.sendMail({
            from: SENDER_EMAIL,
            to: to,
            subject: `Nouvelle livraison à effectuer #${order.id.slice(0, 8)}`,
            html: `
                <div style="font-family: Arial, sans-serif; color: #333;">
                    <h1 style="color: #006233;">Nouvelle Livraison</h1>
                    <p>Bonjour ${deliveryPersonName},</p>
                    <p>Une nouvelle livraison vous a été assignée.</p>
                    
                    <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #006233;">
                        <h3>Commande #${order.id.slice(0, 8)}</h3>
                        <p><strong>Montant à collecter:</strong> ${order.total} DA ${order.paymentMethod === 'CASH' ? '💵 (Espèces)' : ''}</p>
                        <p><strong>Nb articles:</strong> ${order.items?.length || 1}</p>
                        ${order.trackingNumber ? `<p><strong>Tracking:</strong> ${order.trackingNumber}</p>` : ''}
                    </div>

                    <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <h4 style="margin-top: 0;">📍 Adresse Départ (Récupération)</h4>
                        <p style="margin: 5px 0;"><strong>${order.storeName || 'Vendeur'}</strong></p>
                        <p style="margin: 5px 0;">${order.storeAddress || 'Adresse non fournie'}</p>
                        <p style="margin: 5px 0;">${order.storeCity || ''}</p>
                    </div>

                    <div style="background: #d4edda; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <h4 style="margin-top: 0;">🏠 Adresse Livraison (Client)</h4>
                        <p style="margin: 5px 0;"><strong>${order.shippingName || order.user?.name || 'Client'}</strong></p>
                        <p style="margin: 5px 0;">${order.shippingAddress || 'Adresse non fournie'}</p>
                        <p style="margin: 5px 0;">${order.shippingCity || ''}</p>
                        ${order.shippingPhone ? `<p style="margin: 5px 0;">📞 ${order.shippingPhone}</p>` : ''}
                    </div>

                    ${order.notes ? `
                    <div style="background: #e8f5f0; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <h4 style="margin-top: 0;">📝 Notes</h4>
                        <p>${order.notes}</p>
                    </div>
                    ` : ''}

                    <p style="color: #666; font-size: 14px; margin-top: 30px;">
                        Merci de confirmer la récupération et la livraison dans l'application.
                    </p>
                    
                    <br>
                    <p>Bonne livraison,<br>L'équipe Achrilik</p>
                </div>
            `,
        });
    } catch (error) {
        console.error("Error sending delivery person notification:", error);
    }
}
