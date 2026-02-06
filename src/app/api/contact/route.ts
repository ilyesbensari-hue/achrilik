import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_placeholder_for_build');

export async function POST(request: Request) {
    try {
        const { name, email, subject, message } = await request.json();

        // Validation
        if (!name || !email || !subject || !message) {
            return NextResponse.json(
                { error: 'Tous les champs sont requis' },
                { status: 400 }
            );
        }

        // Send email to achrilik@gmail.com
        await resend.emails.send({
            from: 'Achrilik Contact <contact@achrilik.com>',
            to: 'achrilik@gmail.com',
            replyTo: email,
            subject: `[Contact] ${subject}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #f43f5e 0%, #ec4899 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0; }
                        .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
                        .field { margin-bottom: 20px; }
                        .field-label { font-weight: bold; color: #6b7280; font-size: 12px; text-transform: uppercase; margin-bottom: 5px; }
                        .field-value { background: white; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb; }
                        .message-box { background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #f43f5e; min-height: 100px; }
                        .footer { text-align: center; padding: 20px; color: #9ca3af; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1 style="margin: 0; font-size: 24px;">📧 Nouveau Message de Contact</h1>
                            <p style="margin: 10px 0 0 0; opacity: 0.9;">Achrilik.com</p>
                        </div>
                        <div class="content">
                            <div class="field">
                                <div class="field-label">Nom du contact</div>
                                <div class="field-value">${name}</div>
                            </div>
                            <div class="field">
                                <div class="field-label">Adresse Email</div>
                                <div class="field-value">
                                    <a href="mailto:${email}" style="color: #f43f5e; text-decoration: none;">${email}</a>
                                </div>
                            </div>
                            <div class="field">
                                <div class="field-label">Sujet</div>
                                <div class="field-value">${subject}</div>
                            </div>
                            <div class="field">
                                <div class="field-label">Message</div>
                                <div class="message-box">
                                    ${message.replace(/\n/g, '<br>')}
                                </div>
                            </div>
                        </div>
                        <div class="footer">
                            Message envoyé depuis le formulaire de contact d'Achrilik.com<br>
                            Vous pouvez répondre directement à ${email}
                        </div>
                    </div>
                </body>
                </html>
            `,
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Contact form error:', error);
        return NextResponse.json(
            { error: 'Erreur lors de l\'envoi du message' },
            { status: 500 }
        );
    }
}
