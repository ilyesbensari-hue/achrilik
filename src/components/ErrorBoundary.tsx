'use client';

import { Component, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: any) {
        // Log error for monitoring
        console.error('Error caught by boundary:', error, errorInfo);

        // Send to error logging API (non-blocking)
        if (typeof window !== 'undefined') {
            fetch('/api/error-log', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: error.message,
                    stack: error.stack,
                    componentStack: errorInfo.componentStack,
                    timestamp: new Date().toISOString(),
                    url: window.location.href
                })
            }).catch(() => {
                // Silently fail if logging API is down
            });
        }
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback || (
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="text-center max-w-md px-6">
                        <div className="text-6xl mb-4">😔</div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            Oups, une erreur s&apos;est produite
                        </h1>
                        <p className="text-gray-600 mb-6">
                            Nous avons été notifiés du problème.
                            Veuillez rafraîchir la page ou retourner à l&apos;accueil.
                        </p>
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={() => window.location.reload()}
                                className="btn btn-primary"
                            >
                                Rafraîchir la page
                            </button>
                            <a
                                href="/"
                                className="btn btn-outline"
                            >
                                Retour à l&apos;accueil
                            </a>
                        </div>
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details className="mt-6 text-left">
                                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                                    Détails de l&apos;erreur (dev only)
                                </summary>
                                <pre className="mt-2 text-xs bg-gray-100 p-4 rounded overflow-auto max-h-48">
                                    {this.state.error.stack}
                                </pre>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
