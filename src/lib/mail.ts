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
            subject: `✅ Confirmation de commande #${order.id.slice(0, 8)} - Achrilik`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                </head>
                <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f4;">
                    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f4f4; padding: 20px 0;">
                        <tr>
                            <td align="center">
                                <!-- Main Container -->
                                <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                                    
                                    <!-- Header -->
                                    <tr>
                                        <td style="background: linear-gradient(135deg, #006233 0%, #00844a 100%); padding: 40px 30px; text-align: center;">
                                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">✅ Commande Confirmée !</h1>
                                            <p style="color: #e6f7f0; margin: 10px 0 0 0; font-size: 16px;">Achrilik - Mode & Tendance</p>
                                        </td>
                                    </tr>
                                    
                                    <!-- Content -->
                                    <tr>
                                        <td style="padding: 40px 30px;">
                                            <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Bonjour ${order.shippingName || order.user?.name || ''},</p>
                                            
                                            <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                                                Nous avons bien reçu votre commande <strong style="color: #006233;">#${order.id.slice(0, 8)}</strong>. 
                                                Merci pour votre confiance !
                                            </p>
                                            
                                            <!-- Order Summary Box -->
                                            <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background: #f9fafb; border: 2px solid #006233; border-radius: 10px; padding: 20px; margin: 30px 0;">
                                                <tr>
                                                    <td>
                                                        <h2 style="color: #006233; margin: 0 0 20px 0; font-size: 20px;">📦 Récapitulatif</h2>
                                                        
                                                        <table role="presentation" cellpadding="8" cellspacing="0" width="100%" style="border-collapse: collapse;">
                                                            <tr>
                                                                <td style="color: #666; font-size: 14px; padding: 8px 0;">Total</td>
                                                                <td align="right" style="color: #006233; font-size: 20px; font-weight: bold; padding: 8px 0;">${order.total?.toLocaleString() || 0} DA</td>
                                                            </tr>
                                                            <tr>
                                                                <td style="color: #666; font-size: 14px; padding: 8px 0; border-top: 1px solid #e5e7eb;">Mode de livraison</td>
                                                                <td align="right" style="color: #333; font-size: 14px; font-weight: 600; padding: 8px 0; border-top: 1px solid #e5e7eb;">
                                                                    ${order.deliveryType === 'CLICK_COLLECT' ? '🏪 Click & Collect' : '🚚 Livraison à domicile'}
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td style="color: #666; font-size: 14px; padding: 8px 0; border-top: 1px solid #e5e7eb;">Paiement</td>
                                                                <td align="right" style="color: #333; font-size: 14px; font-weight: 600; padding: 8px 0; border-top: 1px solid #e5e7eb;">
                                                                    ${order.paymentMethod === 'CASH_ON_DELIVERY' ? '💵 À la livraison' : '💳 En ligne'}
                                                                </td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>
                                            </table>
                                            
                                            ${order.deliveryType === 'DELIVERY' && order.shippingAddress ? `
                                            <!-- Shipping Address Details -->
                                            <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background: #ecfdf5; border: 2px solid #10b981; border-radius: 10px; padding: 20px; margin: 30px 0;">
                                                <tr>
                                                    <td>
                                                        <h2 style="color: #065f46; margin: 0 0 15px 0; font-size: 18px;">📍 Adresse de Livraison</h2>
                                                        
                                                        <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                                                            ${order.shippingName ? `
                                                            <tr>
                                                                <td style="padding: 6px 0;">
                                                                    <span style="color: #047857; font-weight: 600; font-size: 14px;">👤 Destinataire:</span>
                                                                    <span style="color: #064e3b; font-size: 14px; margin-left: 8px;">${order.shippingName}</span>
                                                                </td>
                                                            </tr>
                                                            ` : ''}
                                                            ${order.shippingPhone ? `
                                                            <tr>
                                                                <td style="padding: 6px 0;">
                                                                    <span style="color: #047857; font-weight: 600; font-size: 14px;">📞 Téléphone:</span>
                                                                    <span style="color: #064e3b; font-size: 14px; margin-left: 8px;">${order.shippingPhone}</span>
                                                                </td>
                                                            </tr>
                                                            ` : ''}
                                                            <tr>
                                                                <td style="padding: 6px 0;">
                                                                    <span style="color: #047857; font-weight: 600; font-size: 14px;">🏠 Adresse:</span>
                                                                    <span style="color: #064e3b; font-size: 14px; margin-left: 8px;">${order.shippingAddress}</span>
                                                                </td>
                                                            </tr>
                                                            ${order.shippingCity ? `
                                                            <tr>
                                                                <td style="padding: 6px 0;">
                                                                    <span style="color: #047857; font-weight: 600; font-size: 14px;">📍 Ville:</span>
                                                                    <span style="color: #064e3b; font-size: 14px; margin-left: 8px;">${order.shippingCity}</span>
                                                                </td>
                                                            </tr>
                                                            ` : ''}
                                                        </table>
                                                        
                                                        <div style="background: #d1fae5; padding: 12px; border-radius: 6px; margin-top: 15px;">
                                                            <p style="color: #065f46; margin: 0; font-size: 13px; line-height: 1.5;">
                                                                <strong>💡 Important:</strong> Assurez-vous d'être disponible à cette adresse pour réceptionner votre colis. 
                                                                Le livreur vous contactera au ${order.shippingPhone || 'numéro fourni'} avant la livraison.
                                                            </p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            </table>
                                            ` : ''}
                                            
                                            ${order.deliveryType === 'CLICK_COLLECT' ? `
                                            <!-- Click & Collect Info -->
                                            <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background: #dbeafe; border: 2px solid #3b82f6; border-radius: 10px; padding: 20px; margin: 30px 0;">
                                                <tr>
                                                    <td>
                                                        <h2 style="color: #1e40af; margin: 0 0 15px 0; font-size: 18px;">🏪 Retrait en Boutique</h2>
                                                        <p style="color: #1e3a8a; margin: 0; font-size: 14px; line-height: 1.6;">
                                                            Votre commande sera prête pour le retrait une fois que le vendeur l'aura confirmée. 
                                                            Vous recevrez une notification par email dès qu'elle sera disponible.
                                                        </p>
                                                        ${order.storeName || order.storeAddress ? `
                                                        <div style="background: #bfdbfe; padding: 12px; border-radius: 6px; margin-top: 15px;">
                                                            ${order.storeName ? `<p style="color: #1e3a8a; margin: 0 0 5px 0; font-size: 14px;"><strong>📍 Boutique:</strong> ${order.storeName}</p>` : ''}
                                                            ${order.storeAddress ? `<p style="color: #1e3a8a; margin: 0; font-size: 14px;"><strong>🏠 Adresse:</strong> ${order.storeAddress}${order.storeCity ? ', ' + order.storeCity : ''}</p>` : ''}
                                                        </div>
                                                        ` : ''}
                                                    </td>
                                                </tr>
                                            </table>
                                            ` : ''}
                                            
                                            <!-- Next Steps -->
                                            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 30px 0;">
                                                <p style="color: #92400e; margin: 0; font-size: 14px; font-weight: 600;">📬 Prochaines étapes</p>
                                                <p style="color: #78350f; margin: 10px 0 0 0; font-size: 14px; line-height: 1.5;">
                                                    Vous recevrez un email dès que le vendeur aura traité votre commande. Vous pourrez suivre l'état de livraison dans votre espace client.
                                                </p>
                                            </div>
                                            
                                            <!-- CTA Button -->
                                            <div style="text-align: center; margin: 35px 0;">
                                                <a href="${process.env.NEXT_PUBLIC_URL || 'https://achrilik.com'}/profile" 
                                                   style="display: inline-block; background: #006233; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(0,98,51,0.2);">
                                                    Voir ma commande
                                                </a>
                                            </div>
                                        </td>
                                    </tr>
                                    
                                    <!-- Footer -->
                                    <tr>
                                        <td style="background: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                                            <p style="color: #666; font-size: 14px; margin: 0 0 10px 0;">Merci de faire vos achats sur Achrilik !</p>
                                            <p style="color: #999; font-size: 12px; margin: 0;">
                                                Des questions ? Contactez-nous à <a href="mailto:contact@achrilik.com" style="color: #006233; text-decoration: none;">contact@achrilik.com</a>
                                            </p>
                                            <p style="color: #ccc; font-size: 11px; margin: 15px 0 0 0;">
                                                © ${new Date().getFullYear()} Achrilik - Marketplace Mode Algérie
                                            </p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>
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
            subject: `💰 Nouvelle vente ! Commande #${order.id.slice(0, 8)} - ${order.total} DA`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                </head>
                <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f4;">
                    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f4f4; padding: 20px 0;">
                        <tr>
                            <td align="center">
                                <!-- Main Container -->
                                <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                                    
                                    <!-- Header -->
                                    <tr>
                                        <td style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 40px 30px; text-align: center;">
                                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">💰 Nouvelle Vente !</h1>
                                            <p style="color: #fef3c7; margin: 10px 0 0 0; font-size: 16px;">Vous avez reçu une nouvelle commande</p>
                                        </td>
                                    </tr>
                                    
                                    <!-- Content -->
                                    <tr>
                                        <td style="padding: 40px 30px;">
                                            <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Bonjour,</p>
                                            
                                            <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                                                🎉 <strong>Félicitations !</strong> Vous venez de réaliser une nouvelle vente sur Achrilik.
                                            </p>

                                            <!-- Order Summary -->
                                            <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background: #fef3c7; border: 2px solid #f59e0b; border-radius: 10px; padding: 20px; margin: 20px 0;">
                                                <tr>
                                                    <td>
                                                        <h2 style="color: #92400e; margin: 0 0 15px 0; font-size: 20px;">📋 Détails de la commande</h2>
                                                        <p style="margin: 8px 0; color: #78350f; font-size: 14px;">
                                                            <strong>Numéro:</strong> #${order.id.slice(0, 8).toUpperCase()}
                                                        </p>
                                                        <p style="margin: 8px 0; color: #78350f; font-size: 14px;">
                                                            <strong>Montant total:</strong> <span style="font-size: 18px; font-weight: bold; color: #92400e;">${order.total} DA</span>
                                                        </p>
                                                        <p style="margin: 8px 0; color: #78350f; font-size: 14px;">
                                                            <strong>Nombre d'articles:</strong> ${order.OrderItem?.length || order.items?.length || 1}
                                                        </p>
                                                        <p style="margin: 8px 0; color: #78350f; font-size: 14px;">
                                                            <strong>Mode de livraison:</strong> ${order.deliveryType === 'DELIVERY' ? '🚚 Livraison à domicile' : '🏪 Click & Collect'}
                                                        </p>
                                                        <p style="margin: 8px 0; color: #78350f; font-size: 14px;">
                                                            <strong>Paiement:</strong> ${order.paymentMethod === 'CASH' ? '💵 Espèces' : '💳 Carte bancaire'}
                                                        </p>
                                                    </td>
                                                </tr>
                                            </table>

                                            <!-- Customer Info -->
                                            <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background: #dbeafe; border: 2px solid #3b82f6; border-radius: 10px; padding: 20px; margin: 20px 0;">
                                                <tr>
                                                    <td>
                                                        <h2 style="color: #1e40af; margin: 0 0 15px 0; font-size: 20px;">👤 Informations Client</h2>
                                                        <p style="margin: 8px 0; color: #1e3a8a; font-size: 14px;">
                                                            <strong>Nom:</strong> ${order.shippingName || order.user?.name || 'Non spécifié'}
                                                        </p>
                                                        ${order.shippingPhone ? `
                                                        <p style="margin: 8px 0; color: #1e3a8a; font-size: 14px;">
                                                            <strong>📞 Téléphone:</strong> ${order.shippingPhone}
                                                        </p>
                                                        ` : ''}
                                                        ${order.user?.email ? `
                                                        <p style="margin: 8px 0; color: #1e3a8a; font-size: 14px;">
                                                            <strong>📧 Email:</strong> ${order.user.email}
                                                        </p>
                                                        ` : ''}
                                                    </td>
                                                </tr>
                                            </table>

                                            ${order.deliveryType === 'DELIVERY' && order.shippingAddress ? `
                                            <!-- Delivery Address -->
                                            <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background: #ecfdf5; border: 2px solid #10b981; border-radius: 10px; padding: 20px; margin: 20px 0;">
                                                <tr>
                                                    <td>
                                                        <h2 style="color: #065f46; margin: 0 0 15px 0; font-size: 20px;">🚚 Adresse de Livraison</h2>
                                                        <p style="margin: 8px 0; color: #064e3b; font-size: 14px;">
                                                            <strong>📍 Adresse:</strong> ${order.shippingAddress}
                                                        </p>
                                                        <p style="margin: 8px 0; color: #064e3b; font-size: 14px;">
                                                            <strong>🏙️ Ville:</strong> ${order.shippingCity}
                                                        </p>
                                                    </td>
                                                </tr>
                                            </table>
                                            ` : ''}

                                            ${order.deliveryType === 'CLICK_COLLECT' ? `
                                            <!-- Click & Collect Info -->
                                            <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background: #f3e8ff; border: 2px solid #a855f7; border-radius: 10px; padding: 20px; margin: 20px 0;">
                                                <tr>
                                                    <td>
                                                        <h2 style="color: #6b21a8; margin: 0 0 15px 0; font-size: 20px;">🏪 Click & Collect</h2>
                                                        <p style="margin: 8px 0; color: #581c87; font-size: 14px;">
                                                            Le client viendra retirer sa commande en boutique.
                                                        </p>
                                                        <p style="margin: 8px 0; color: #581c87; font-size: 14px;">
                                                            <strong>⚠️ Important:</strong> Préparez la commande et contactez le client quand elle sera prête.
                                                        </p>
                                                    </td>
                                                </tr>
                                            </table>
                                            ` : ''}

                                            <!-- Action Required -->
                                            <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background: #fef2f2; border: 2px solid #ef4444; border-radius: 10px; padding: 20px; margin: 30px 0;">
                                                <tr>
                                                    <td>
                                                        <h2 style="color: #991b1b; margin: 0 0 10px 0; font-size: 18px;">⚡ Action Requise</h2>
                                                        <p style="margin: 8px 0; color: #7f1d1d; font-size: 14px;">
                                                            1️⃣ Connectez-vous à votre tableau de bord vendeur<br>
                                                            2️⃣ Confirmez la commande<br>
                                                            3️⃣ Préparez les articles<br>
                                                            4️⃣ ${order.deliveryType === 'DELIVERY' ? 'Organisez la livraison' : 'Contactez le client pour le retrait'}
                                                        </p>
                                                    </td>
                                                </tr>
                                            </table>

                                            <!-- CTA Buttons -->
                                            <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin: 30px 0;">
                                                <tr>
                                                    <td align="center">
                                                        <a href="${process.env.NEXT_PUBLIC_URL || 'https://achrilik.com'}/sell/orders" 
                                                           style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; margin: 0 10px 10px 0;">
                                                            📦 Gérer mes commandes
                                                        </a>
                                                        <a href="${process.env.NEXT_PUBLIC_URL || 'https://achrilik.com'}/profile" 
                                                           style="display: inline-block; background: #6b7280; color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; margin: 0 0 10px 0;">
                                                            👤 Mon Profil
                                                        </a>
                                                    </td>
                                                </tr>
                                            </table>

                                            <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
                                                Cordialement,<br>
                                                <strong style="color: #006233;">L'équipe Achrilik</strong>
                                            </p>
                                        </td>
                                    </tr>
                                    
                                    <!-- Footer -->
                                    <tr>
                                        <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                                            <p style="margin: 0; color: #6b7280; font-size: 12px;">
                                                Cet email a été envoyé automatiquement, merci de ne pas y répondre.
                                            </p>
                                            <p style="margin: 10px 0 0 0; color: #6b7280; font-size: 12px;">
                                                © ${new Date().getFullYear()} Achrilik - Mode & Tendance Algérie
                                            </p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>
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

// Send vendor verification email
export async function sendVendorVerificationEmail(to: string, storeName: string, ownerName: string, verified: boolean) {
    if (!process.env.SMTP_USER) return;

    if (!verified) {
        // Don't send email on unverification
        return;
    }

    try {
        await transporter.sendMail({
            from: SENDER_EMAIL,
            to: to,
            subject: '🎉 Votre boutique est maintenant certifiée - Achrilik',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                </head>
                <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f4;">
                    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f4f4; padding: 20px 0;">
                        <tr>
                            <td align="center">
                                <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                                    
                                    <!-- Header -->
                                    <tr>
                                        <td style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 50px 30px; text-align: center;">
                                            <div style="font-size: 60px; margin-bottom: 15px;">🎉</div>
                                            <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: bold;">Félicitations !</h1>
                                            <p style="color: #e0e7ff; margin: 10px 0 0 0; font-size: 18px;">Votre boutique est certifiée</p>
                                        </td>
                                    </tr>
                                    
                                    <!-- Content -->
                                    <tr>
                                        <td style="padding: 40px 30px;">
                                            <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Bonjour ${ownerName},</p>
                                            
                                            <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                                                Nous sommes ravis de vous informer que votre boutique <strong style="color: #006233;">${storeName}</strong> 
                                                vient d'être <strong>officiellement certifiée</strong> sur Achrilik !
                                            </p>
                                            
                                            <!-- Certification Badge -->
                                            <div style="text-align: center; margin: 40px 0;">
                                                <div style="display: inline-block; background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border: 3px solid #2563eb; border-radius: 50%; width: 120px; height: 120px; line-height: 120px; box-shadow: 0 8px 16px rgba(37,99,235,0.2);">
                                                    <span style="font-size: 60px; vertical-align: middle;">✓</span>
                                                </div>
                                                <p style="color: #2563eb; font-size: 18px; font-weight: bold; margin: 15px 0 0 0;">Badge Vendeur Certifié</p>
                                            </div>
                                            
                                            <!-- Benefits Section -->
                                            <div style="background: #f0fdf4; border: 2px solid #10b981; border-radius: 10px; padding: 25px; margin: 30px 0;">
                                                <h2 style="color: #065f46; margin: 0 0 20px 0; font-size: 20px;">✨ Avantages de la certification</h2>
                                                
                                                <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                                                    <tr>
                                                        <td style="padding: 10px 0;">
                                                            <span style="color: #10b981; font-size: 20px; margin-right: 10px;">✓</span>
                                                            <span style="color: #064e3b; font-size: 15px; font-weight: 600;">Badge visible sur votre profil</span>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td style="padding: 10px 0;">
                                                            <span style="color: #10b981; font-size: 20px; margin-right: 10px;">✓</span>
                                                            <span style="color: #064e3b; font-size: 15px; font-weight: 600;">Confiance accrue des clients</span>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td style="padding: 10px 0;">
                                                            <span style="color: #10b981; font-size: 20px; margin-right: 10px;">✓</span>
                                                            <span style="color: #064e3b; font-size: 15px; font-weight: 600;">Meilleur référencement sur la plateforme</span>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td style="padding: 10px 0;">
                                                            <span style="color: #10b981; font-size: 20px; margin-right: 10px;">✓</span>
                                                            <span style="color: #064e3b; font-size: 15px; font-weight: 600;">Priorité dans les résultats de recherche</span>
                                                        </td>
                                                    </tr>
                                                </table>
                                            </div>
                                            
                                            <!-- Next Steps -->
                                            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 30px 0;">
                                                <p style="color: #92400e; margin: 0; font-size: 14px; font-weight: 600;">🚀 Prochaines étapes</p>
                                                <p style="color: #78350f; margin: 10px 0 0 0; font-size: 14px; line-height: 1.5;">
                                                    Continuez à proposer des produits de qualité et à offrir un excellent service client. 
                                                    Votre badge de certification sera automatiquement affiché sur tous vos produits et votre profil vendeur.
                                                </p>
                                            </div>
                                            
                                            <!-- CTA Button -->
                                            <div style="text-align: center; margin: 35px 0;">
                                                <a href="${process.env.NEXT_PUBLIC_URL || 'https://achrilik.com'}/profile" 
                                                   style="display: inline-block; background: #006233; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(0,98,51,0.2);">
                                                    Accéder à mon tableau de bord
                                                </a>
                                            </div>
                                            
                                            <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
                                                Nous sommes fiers de vous avoir parmi nos vendeurs certifiés. Continuez sur cette lancée !
                                            </p>
                                        </td>
                                    </tr>
                                    
                                    <!-- Footer -->
                                    <tr>
                                        <td style="background: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                                            <p style="color: #666; font-size: 14px; margin: 0 0 10px 0;">Merci de faire partie de la communauté Achrilik !</p>
                                            <p style="color: #999; font-size: 12px; margin: 0;">
                                                Des questions ? Contactez-nous à <a href="mailto:contact@achrilik.com" style="color: #006233; text-decoration: none;">contact@achrilik.com</a>
                                            </p>
                                            <p style="color: #ccc; font-size: 11px; margin: 15px 0 0 0;">
                                                © ${new Date().getFullYear()} Achrilik - Marketplace Mode Algérie
                                            </p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>
            `,
        });
    } catch (error) {
        console.error("Error sending vendor verification email:", error);
    }
}
