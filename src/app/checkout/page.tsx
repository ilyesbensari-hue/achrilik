import { requireAuth } from '@/lib/server-auth';
import CheckoutClient from './CheckoutClient';

export default async function CheckoutPage() {
    // Server-side auth check - redirects to /login if not authenticated
    const user = await requireAuth();

    return <CheckoutClient initialUser={user} />;
}
