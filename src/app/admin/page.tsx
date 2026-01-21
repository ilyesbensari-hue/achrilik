import { requireAdmin } from '@/lib/server-auth';
import AdminDashboardClient from './AdminDashboardClient';

export default async function AdminPage() {
    // Server-side admin auth check - redirects if not admin
    const user = await requireAdmin();

    return <AdminDashboardClient />;
}
