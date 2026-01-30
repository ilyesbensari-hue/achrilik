import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { name, password, email, address, city, wilaya, phone } = body;

        // Basic validation
        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        const data: any = { name };

        // Hash password if provided
        if (password) {
            data.password = await bcrypt.hash(password, 10);
        }

        if (address !== undefined) data.address = address;
        if (city !== undefined) data.city = city;
        if (wilaya !== undefined) data.wilaya = wilaya;
        if (phone !== undefined) data.phone = phone;

        const updatedUser = await prisma.user.update({
            where: { id },
            data,
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                address: true,
                city: true,
                wilaya: true,
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
