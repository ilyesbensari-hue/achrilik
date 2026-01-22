import { requireAdmin } from '@/lib/server-auth';
import AdminOrdersClient from './AdminOrdersClient';

export default async function AdminOrdersPage() {
    // Server-side admin auth check - redirects if not admin
    const user = await requireAdmin();

    return <AdminOrdersClient />;
}
