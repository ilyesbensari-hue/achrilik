"use client";

import { useState, useEffect } from 'react';
import Toast from './Toast';

interface ToastMessage {
    id: string;
    type: 'success' | 'error' | 'info';
    message: string;
    action?: {
        label: string;
        onClick: () => void;
    };
}

export default function ToastContainer() {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    useEffect(() => {
        // Listen for custom toast events
        const handleToast = (e: CustomEvent) => {
            const newToast: ToastMessage = {
                id: Date.now().toString(),
                ...e.detail
            };
            setToasts(prev => [...prev, newToast]);

            // Auto-remove after 5s
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== newToast.id));
            }, 5000);
        };

        window.addEventListener('show-toast' as any, handleToast);
        return () => window.removeEventListener('show-toast' as any, handleToast);
    }, []);

    return (
        <div className="fixed top-20 right-4 z-[100] space-y-2 max-w-sm">
            {toasts.map(toast => (
                <Toast
                    key={toast.id}
                    type={toast.type}
                    message={toast.message}
                    onClose={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                    action={toast.action}
                />
            ))}
        </div>
    );
}
