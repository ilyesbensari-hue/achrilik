import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/lib/auth-token';
import OrderDetailClient from './OrderDetailClient';

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
        redirect('/login');
    }

    const user = await verifyToken(token);

    if (!user || (user.role !== 'DELIVERY_AGENT' && user.role !== 'ADMIN')) {
        redirect('/');
    }

    const { id } = await params;

    return <OrderDetailClient deliveryId={id} initialUser={user} />;
}
