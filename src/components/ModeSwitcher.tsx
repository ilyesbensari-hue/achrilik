"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ModeSwitcherProps {
    currentMode: 'buyer' | 'seller';
    className?: string;
}

export default function ModeSwitcher({ currentMode, className = '' }: ModeSwitcherProps) {
    const [switching, setSwitching] = useState(false);
    const router = useRouter();

    const handleSwitch = async () => {
        const newMode = currentMode === 'seller' ? 'buyer' : 'seller';

        if (!confirm(`Voulez-vous passer en mode ${newMode === 'seller' ? 'Vendeur' : 'Acheteur'} ?`)) {
            return;
        }

        try {
            setSwitching(true);
            const res = await fetch('/api/auth/switch-mode', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mode: newMode })
            });

            const data = await res.json();

            if (res.ok) {
                // Update localStorage
                localStorage.setItem('userMode', newMode);

                // Show success message
                alert(`✅ ${data.message}`);

                // Redirect to appropriate page
                router.push(data.redirectTo);
                router.refresh();
            } else {
                alert(`❌ ${data.error}`);
                if (data.redirectTo) {
                    router.push(data.redirectTo);
                }
            }
        } catch (error) {
            console.error('Error switching mode:', error);
            alert('Erreur lors du changement de mode');
        } finally {
            setSwitching(false);
        }
    };

    return (
        <button
            onClick={handleSwitch}
            disabled={switching}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${currentMode === 'seller'
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                } disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        >
            {switching ? (
                <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    <span>Changement...</span>
                </>
            ) : (
                <>
                    <span className="text-lg">
                        {currentMode === 'seller' ? '🛍️' : '🏪'}
                    </span>
                    <span>
                        {currentMode === 'seller'
                            ? 'Passer en mode Acheteur'
                            : 'Passer en mode Vendeur'}
                    </span>
                </>
            )}
        </button>
    );
}
