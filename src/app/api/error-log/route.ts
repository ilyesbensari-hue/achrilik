import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandler } from '@/lib/api-error-handler';

/**
 * Error logging API endpoint
 * Stores client-side errors for monitoring
 */
export async function POST(request: NextRequest) {
    return withErrorHandler(async () => {
        const body = await request.json();

        const errorLog = {
            timestamp: body.timestamp || new Date().toISOString(),
            message: body.message,
            stack: body.stack,
            componentStack: body.componentStack,
            url: body.url,
            userAgent: request.headers.get('user-agent'),
        };

        // Log to console (in production, send to external service like Sentry)
        console.error('Client Error:', errorLog);

        // TODO: Send to external monitoring service
        // await sendToSentry(errorLog);

        return NextResponse.json({ success: true });
    });
}
