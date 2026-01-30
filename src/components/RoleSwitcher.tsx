"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Role } from '@prisma/client';
import { hasRole, getRoleDisplayName, getRoleIcon, getRoleDashboardPath } from '@/lib/roles';

interface User {
    id: string;
    name: string | null;
    email: string;
    roles: Role[];
    activeRole: Role;
}

export default function RoleSwitcher() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Get user from localStorage or API
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
    }, []);

    const switchRole = async (newRole: Role) => {
        if (!user) return;

        try {
            const res = await fetch('/api/auth/switch-role', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: newRole })
            });

            if (res.ok) {
                const data = await res.json();
                setUser(data.user);
                localStorage.setItem('user', JSON.stringify(data.user));
                setIsOpen(false);

                // Redirect to role dashboard
                router.push(getRoleDashboardPath(newRole));
            }
        } catch (error) {
            console.error('Error switching role:', error);
        }
    };

    if (!user || user.roles.length <= 1) {
        return null; // Don't show if user has only one role
    }

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
                <span className="text-lg">{getRoleIcon(user.activeRole)}</span>
                <span className="text-sm font-medium text-gray-700">
                    {getRoleDisplayName(user.activeRole)}
                </span>
                <svg
                    className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Dropdown */}
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                        <div className="px-4 py-3 border-b border-gray-200">
                            <p className="text-xs font-medium text-gray-500 uppercase">Changer de rôle</p>
                        </div>
                        <div className="py-2">
                            {user.roles.map((role) => (
                                <button
                                    key={role}
                                    onClick={() => switchRole(role)}
                                    className={`w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${role === user.activeRole ? 'bg-green-50 text-green-700' : 'text-gray-700'
                                        }`}
                                >
                                    <span className="text-lg">{getRoleIcon(role)}</span>
                                    <span className="flex-1 text-left font-medium">{getRoleDisplayName(role)}</span>
                                    {role === user.activeRole && (
                                        <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
