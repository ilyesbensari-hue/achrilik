import nodemailer from 'nodemailer';
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
                create: template
            });
        } catch (error) {
            console.error(`Failed to create template ${template.name}:`, error);
        }
    }
}
