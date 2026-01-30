"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface RoleGuardProps {
    children: React.ReactNode;
    allowedRoles: string[]; // ['BUYER', 'SELLER', 'DELIVERY_AGENT', 'ADMIN']
    requireMode?: 'buyer' | 'seller'; // For sellers who can switch modes
    fallbackUrl?: string;
}

export default function RoleGuard({
    children,
    allowedRoles,
    requireMode,
    fallbackUrl = '/auth/role-select'
}: RoleGuardProps) {
    const [authorized, setAuthorized] = useState(false);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        checkAccess();
    }, []);

    const checkAccess = () => {
        try {
            // Get user from localStorage
            const userStr = localStorage.getItem('user');
            if (!userStr) {
                router.push(fallbackUrl);
                return;
            }

            const user = JSON.parse(userStr);
            const userRoles = user.role?.split(',') || [];

            // Check if user has any of the allowed roles
            const hasRole = allowedRoles.some(role => userRoles.includes(role));

            if (!hasRole) {
                console.warn('Access denied: User does not have required role');
                router.push(fallbackUrl);
                return;
            }

            // If requireMode is specified, check active mode
            if (requireMode) {
                const activeMode = localStorage.getItem('userMode') || 'buyer';

                if (activeMode !== requireMode) {
                    console.warn(`Access denied: Required mode ${requireMode}, but user is in ${activeMode} mode`);

                    // Redirect based on current mode
                    const redirectUrl = activeMode === 'seller' ? '/seller/dashboard' : '/shop';
                    router.push(redirectUrl);
                    return;
                }
            }

            setAuthorized(true);
        } catch (error) {
            console.error('Error checking access:', error);
            router.push(fallbackUrl);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!authorized) {
        return null;
    }

    return <>{children}</>;
}
