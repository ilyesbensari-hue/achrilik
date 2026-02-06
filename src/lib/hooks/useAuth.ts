import { useEffect, useState } from 'react';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
}

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch current user session
        fetch('/api/auth/session')
            .then(res => res.json())
            .then(data => {
                setUser(data.user || null);
                setLoading(false);
            })
            .catch(() => {
                setUser(null);
                setLoading(false);
            });
    }, []);

    return { user, loading };
}
