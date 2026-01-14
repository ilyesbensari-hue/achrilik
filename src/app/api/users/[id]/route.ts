import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { name, password, email, address, phone } = body; // email might be read-only but let's see

        // Basic validation
        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        const data: any = { name };
        if (password) {
            data.password = password; // In real app, hash this! using plain for MVP consistency
        }
        if (address !== undefined) data.address = address;
        if (phone !== undefined) data.phone = phone;

        // If email update is requested, check uniqueness (skipping for MVP complexity unless requested)
        // Ignoring email update for now to avoid conflicts.

        const updatedUser = await prisma.user.update({
            where: { id },
            data,
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                address: true,
                phone: true,
                // Do not return password
            }
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error('Update user failed:', error);
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }
}
