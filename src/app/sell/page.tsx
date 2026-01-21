import { requireSeller } from '@/lib/server-auth';
import SellerPageClient from './SellerPageClient';

export default async function SellPage() {
    // Server-side seller auth check - redirects to /why-sell if not seller
    const user = await requireSeller();

    return <SellerPageClient initialUser={user} />;
}
