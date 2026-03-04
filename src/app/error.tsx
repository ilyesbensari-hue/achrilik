'use client'

import * as Sentry from "@sentry/nextjs"
import { useEffect } from 'react'
import { useTranslation } from '@/hooks/useTranslation'

export default function ErrorBoundary({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    const { tr } = useTranslation();

    useEffect(() => {
        Sentry.captureException(error)
    }, [error])

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
                <div className="mb-4">
                    <svg className="mx-auto h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {tr('error_title')}
                </h2>

                <p className="text-gray-600 mb-6">
                    {tr('error_desc')}
                </p>

                <div className="space-y-3">
                    <button
                        onClick={() => reset()}
                        className="w-full bg-[#006233] hover:bg-[#005029] text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                    >
                        {tr('error_retry')}
                    </button>

                    <button
                        onClick={() => window.location.href = '/'}
                        className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-4 rounded-lg transition-colors"
                    >
                        {tr('error_home')}
                    </button>
                </div>

                {error.digest && (
                    <p className="mt-4 text-xs text-gray-500">
                        {tr('error_code')}{error.digest}
                    </p>
                )}
            </div>
        </div>
    )
}
