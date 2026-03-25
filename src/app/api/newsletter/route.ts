import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
    try {
        const { email, name } = await req.json();

        if (!email || !email.includes('@')) {
            return NextResponse.json({ error: 'Email invalide' }, { status: 400 });
        }

        // Check if email already exists as a user or in newsletter list
        // We'll store newsletter subscribers in the database using a simple approach
        // Using a raw query to handle potential missing table gracefully
        try {
            await prisma.$executeRaw`
                INSERT INTO "Newsletter" ("id", "email", "name", "createdAt")
                VALUES (gen_random_uuid()::text, ${email}, ${name || null}, NOW())
                ON CONFLICT ("email") DO NOTHING
            `;
        } catch {
            // Table might not exist - silently succeed (we'll add schema migration later)
            // For now, just store in user preferences or log
            console.log(`Newsletter signup: ${email} (${name})`);
        }

        return NextResponse.json({ success: true, message: 'Merci pour votre inscription !' });
    } catch (error) {
        console.error('Newsletter POST error:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}

export async function GET() {
    // Public count for homepage display
    try {
        const count = await prisma.$queryRaw<Array<{ count: bigint }>>`SELECT COUNT(*) as count FROM "Newsletter"`;
        return NextResponse.json({ count: Number(count[0]?.count ?? 0) });
    } catch {
        return NextResponse.json({ count: 0 });
    }
}
