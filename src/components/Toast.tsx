import { useEffect } from 'react';

interface ToastProps {
    message: string;
    type: 'success' | 'error' | 'info';
    onClose: () => void;
    duration?: number;
    action?: {
        label: string;
        onClick: () => void;
    };
}

export default function Toast({ message, type, onClose, duration = 5000, action }: ToastProps) {
    useEffect(() => {
        if (!message) return;

        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose, message]);

    if (!message) return null;

    const bgColors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-blue-500'
    };

    const icons = {
        success: '✅',
        error: '❌',
        info: 'ℹ️'
    };

    return (
        <div
            className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-slide-in-right text-white ${bgColors[type]} max-w-md`}
            role="alert"
            aria-live="polite"
        >
            <span className="text-xl" aria-hidden="true">{icons[type]}</span>
            <span className="font-semibold flex-1">{message}</span>
            {action && (
                <button
                    onClick={() => {
                        action.onClick();
                        onClose();
                    }}
                    className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-bold transition-colors"
                >
                    {action.label}
                </button>
            )}
            <button
                onClick={onClose}
                className="ml-2 hover:bg-white/20 rounded-full p-1 transition-colors"
                aria-label="Fermer la notification"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    );
}
