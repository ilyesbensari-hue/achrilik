"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    roles?: string[];
    activeRole?: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (path?: string) => void; // helper method if needed
    logout: () => Promise<void>;
    refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    isLoading: true,
    login: () => { },
    logout: async () => { },
    refresh: async () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    const fetchUser = async () => {
        try {
            const res = await fetch('/api/auth/me');
            if (res.ok) {
                const data = await res.json();
                setUser(data.user);
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error('Auth check error', error);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    const logout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
        } catch (e) {
            console.error('Logout error', e);
        }
        setUser(null);
        localStorage.removeItem('user'); // Ensure local storage is also cleared
        router.push('/login');
        router.refresh();
    };

    const refresh = async () => {
        await fetchUser();
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login: () => { }, logout, refresh }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
