import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth-token';
import { redirect } from 'next/navigation';
import DeliveryDashboardClient from './DeliveryDashboardClient';

export const metadata = {
    title: 'Tableau de Bord Livreur - Achrilik',
    description: 'Gérez vos livraisons'
};

export default async function DeliveryDashboardPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
        redirect('/login');
    }

    const user = await verifyToken(token);

    if (!user || (user.role !== 'DELIVERY_AGENT' && user.role !== 'ADMIN')) {
        redirect('/');
    }

    return <DeliveryDashboardClient initialUser={user} />;
}
