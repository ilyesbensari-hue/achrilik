import { requireAuth } from '@/lib/server-auth';
import { redirect } from 'next/navigation';
import SupportClient from './SupportClient';
import { prisma } from '@/lib/prisma';

export default async function SupportPage() {
    const user = await requireAuth();

    // Check if user is admin
    const fullUser = await prisma.user.findUnique({
        where: { id: user.id as string },
        select: { role: true }
    });

    if (!fullUser || fullUser.role !== 'ADMIN') {
        redirect('/');
    }

    return <SupportClient />;
}
