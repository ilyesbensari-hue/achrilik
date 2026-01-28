import { requireAuth } from '@/lib/server-auth';
import SellerDashboardClient from './SellerDashboardClient';

export default async function SellerDashboardPage() {
    // Server-side auth check - redirects to /login if not authenticated
    const user = await requireAuth();

    // Check if user is a seller
    if (user.role !== 'SELLER') {
        return (
            <div className="container py-20 text-center">
                <h1 className="text-3xl font-bold mb-4">Accès refusé</h1>
                <p className="text-gray-600 mb-6">Vous devez être vendeur pour accéder à cette page.</p>
                <a href="/why-sell" className="btn btn-primary">Devenir vendeur</a>
            </div>
        );
    }

    return <SellerDashboardClient initialUser={user} />;
}
