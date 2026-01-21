import { requireAuth } from '@/lib/server-auth';
import ProfileClient from './ProfileClient';

export default async function ProfilePage() {
    // Server-side auth check - redirects to /login if not authenticated
    const user = await requireAuth();

    return <ProfileClient initialUser={user} />;
}
