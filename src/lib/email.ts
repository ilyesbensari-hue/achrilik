import nodemailer from 'nodemailer';
import { randomBytes } from 'crypto';
import { prisma } from './prisma';
import { getSetting } from './settings';

// Create reusable transporter
let transporter: nodemailer.Transporter | null = null;

async function getTransporter() {
    if (transporter) return transporter;

    // Get email settings from database or env
    const host = await getSetting('email_host') || process.env.EMAIL_HOST || 'smtp.gmail.com';
    const port = parseInt(await getSetting('email_port') || process.env.EMAIL_PORT || '587');
    const user = await getSetting('email_user') || process.env.EMAIL_USER;
    const pass = await getSetting('email_pass') || process.env.EMAIL_PASS;

    if (!user || !pass) {
        console.warn('Email credentials not configured');
        return null;
    }

    transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass }
    });

    return transporter;
}

/**
 * Send a basic email
 */
export async function sendEmail(
    to: string,
    subject: string,
    html: string,
    from?: string
) {
    try {
        const transport = await getTransporter();
        if (!transport) {
            console.error('Email transporter not configured');
            return false;
        }

        const fromAddress = from || await getSetting('email_from') || process.env.EMAIL_FROM || 'noreply@achrilik.com';

        await transport.sendMail({
            from: fromAddress,
            to,
            subject,
            html
        });

        return true;
    } catch (error) {
        console.error('Failed to send email:', error);
        return false;
    }
}

/**
 * Send email using a template
 */
export async function sendTemplateEmail(
    to: string,
    templateName: string,
    variables: Record<string, any>
) {
    try {
        // Get template from database
        const template = await prisma.emailTemplate.findUnique({
            where: { name: templateName }
        });

        if (!template || !template.enabled) {
            console.error(`Email template ${templateName} not found or disabled`);
            return false;
        }

        // Replace variables in template
        let html = template.htmlContent;
        let subject = template.subject;

        Object.keys(variables).forEach(key => {
            const placeholder = `{{${key}}}`;
            html = html.split(placeholder).join(variables[key]);
            subject = subject.split(placeholder).join(variables[key]);
        });

        return await sendEmail(to, subject, html);
    } catch (error) {
        console.error('Failed to send template email:', error);
        return false;
    }
}

/**
 * Initialize default email templates if they don't exist
 */
export async function initializeEmailTemplates() {
    const templates = [
        {
            name: 'welcome',
            subject: 'Bienvenue sur Achrilik!',
            htmlContent: `
                <h1>Bienvenue {{userName}}!</h1>
                <p>Merci de vous être inscrit sur Achrilik, votre marketplace locale.</p>
                <p>Commencez dès maintenant à explorer nos produits artisanaux.</p>
                <a href="{{siteUrl}}">Visiter Achrilik</a>
            `,
            variables: JSON.stringify(['userName', 'siteUrl'])
        },
        {
            name: 'order_confirmation',
            subject: 'Confirmation de commande #{{orderNumber}}',
            htmlContent: `
                <h1>Merci pour votre commande!</h1>
                <p>Bonjour {{userName}},</p>
                <p>Votre commande #{{orderNumber}} a été confirmée.</p>
                <p><strong>Total:</strong> {{orderTotal}} DA</p>
                <p><strong>Mode de livraison:</strong> {{deliveryType}}</p>
                <p>Vous recevrez une notification lorsque votre commande sera prête.</p>
            `,
            variables: JSON.stringify(['userName', 'orderNumber', 'orderTotal', 'deliveryType'])
        },
        {
            name: 'product_approved',
            subject: 'Votre produit a été approuvé!',
            htmlContent: `
                <h1>Félicitations!</h1>
                <p>Bonjour {{sellerName}},</p>
                <p>Votre produit <strong>{{productTitle}}</strong> a été approuvé par notre équipe.</p>
                <p>Il est maintenant visible sur la marketplace!</p>
                <a href="{{productUrl}}">Voir le produit</a>
            `,
            variables: JSON.stringify(['sellerName', 'productTitle', 'productUrl'])
        },
        {
            name: 'product_rejected',
            subject: 'Votre produit nécessite des modifications',
            htmlContent: `
                <h1>Action requise</h1>
                <p>Bonjour {{sellerName}},</p>
                <p>Votre produit <strong>{{productTitle}}</strong> n'a pas été approuvé pour la raison suivante:</p>
                <blockquote>{{rejectionReason}}</blockquote>
                <p>Veuillez modifier votre produit et le soumettre à nouveau.</p>
                <a href="{{dashboardUrl}}">Accéder au tableau de bord</a>
            `,
            variables: JSON.stringify(['sellerName', 'productTitle', 'rejectionReason', 'dashboardUrl'])
        },
        {
            name: 'order_status_update',
            subject: 'Mise à jour de votre commande #{{orderNumber}}',
            htmlContent: `
                <h1>Mise à jour de commande</h1>
                <p>Bonjour {{userName}},</p>
                <p>Le statut de votre commande #{{orderNumber}} a été mis à jour:</p>
                <p><strong>Nouveau statut:</strong> {{orderStatus}}</p>
                <a href="{{orderUrl}}">Voir la commande</a>
            `,
            variables: JSON.stringify(['userName', 'orderNumber', 'orderStatus', 'orderUrl'])
        }
    ];

    for (const template of templates) {
        try {
            await prisma.emailTemplate.upsert({
                where: { name: template.name },
                update: {},
                create: {
                    ...template,
                    id: randomBytes(16).toString('hex'),
                    updatedAt: new Date()
                }
            });
        } catch (error) {
            console.error(`Failed to create template ${template.name}:`, error);
        }
    }
}

/**
 * Send a post-delivery review request email
 * Called automatically when an order transitions to DELIVERED
 */
export async function sendReviewRequestEmail({
    to,
    userName,
    orderId,
    orderItems,
    siteUrl = 'https://achrilik.com',
}: {
    to: string;
    userName: string;
    orderId: string;
    orderItems: Array<{ title: string; image?: string; productId: string }>;
    siteUrl?: string;
}) {
    try {
        const firstName = userName?.split(' ')[0] || 'cher(e) client(e)';
        const reviewUrl = `${siteUrl}/orders/${orderId}`;

        const productRows = orderItems
            .slice(0, 5)
            .map(item => {
                const imgHtml = item.image
                    ? `<img src="${item.image}" alt="${item.title}" width="56" height="56" style="border-radius:8px;object-fit:cover;display:block;" />`
                    : `<div style="width:56px;height:56px;background:#f3f4f6;border-radius:8px;font-size:24px;line-height:56px;text-align:center;">📦</div>`;
                return `
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;">
                    <table width="100%" cellpadding="0" cellspacing="0"><tr>
                      <td width="68" valign="top">${imgHtml}</td>
                      <td style="padding-left:14px;vertical-align:middle;">
                        <p style="margin:0;font-size:14px;font-weight:600;color:#111827;">${item.title}</p>
                        <a href="${siteUrl}/products/${item.productId}"
                           style="display:inline-block;margin-top:6px;font-size:12px;color:#006233;font-weight:600;text-decoration:none;">
                          ⭐ Laisser un avis
                        </a>
                      </td>
                    </tr></table>
                  </td>
                </tr>`;
            })
            .join('');

        const html = `<!DOCTYPE html>
<html lang="fr"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:40px 0;">
  <tr><td align="center">
    <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07);">
      <!-- Header -->
      <tr><td style="background:linear-gradient(135deg,#006233 0%,#004d28 100%);padding:36px 40px;text-align:center;">
        <p style="margin:0;color:#fff;font-size:26px;font-weight:800;">Achrilik</p>
        <p style="margin:6px 0 0;color:rgba(255,255,255,0.75);font-size:12px;">🇩🇿 Votre marketplace algérienne</p>
      </td></tr>
      <!-- Body -->
      <tr><td style="padding:36px 40px;">
        <div style="text-align:center;margin-bottom:28px;">
          <p style="font-size:40px;margin:0;">⭐⭐⭐⭐⭐</p>
          <h1 style="margin:16px 0 8px;font-size:22px;font-weight:800;color:#111827;">Votre avis compte, ${firstName}!</h1>
          <p style="margin:0;font-size:15px;color:#6b7280;line-height:1.6;">Votre commande a été livrée 🎉<br/>Aidez notre communauté en partageant votre avis.</p>
        </div>
        <hr style="border:none;border-top:1px solid #f3f4f6;margin:24px 0;"/>
        <p style="margin:0 0 14px;font-size:12px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:.05em;">Vos articles</p>
        <table width="100%" cellpadding="0" cellspacing="0"><tbody>${productRows}</tbody></table>
        <hr style="border:none;border-top:1px solid #f3f4f6;margin:28px 0;"/>
        <div style="text-align:center;margin:28px 0;">
          <a href="${reviewUrl}" style="display:inline-block;background:linear-gradient(135deg,#006233,#004d28);color:#fff;font-size:16px;font-weight:700;padding:16px 36px;border-radius:12px;text-decoration:none;">
            ✍️ Donner mon avis
          </a>
          <p style="margin:12px 0 0;font-size:12px;color:#9ca3af;">Cela ne prend que 30 secondes</p>
        </div>
        <div style="background:#f0fdf4;border-radius:10px;padding:16px 20px;text-align:right;direction:rtl;">
          <p style="margin:0;font-size:14px;color:#166534;font-weight:600;">مرحباً ${firstName}!</p>
          <p style="margin:6px 0 0;font-size:13px;color:#4b5563;line-height:1.6;">تم تسليم طلبك بنجاح. شاركنا رأيك في المنتجات التي اشتريتها!</p>
        </div>
      </td></tr>
      <!-- Footer -->
      <tr><td style="background:#f9fafb;padding:20px 40px;border-top:1px solid #f3f4f6;text-align:center;">
        <p style="margin:0;font-size:11px;color:#9ca3af;">© ${new Date().getFullYear()} Achrilik — Algérie</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;

        const subject = `⭐ Comment était votre commande, ${firstName} ?`;
        return await sendEmail(to, subject, html);
    } catch (error) {
        console.error('[REVIEW EMAIL] Failed to send:', error);
        return false;
    }
}
