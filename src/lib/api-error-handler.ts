import { NextResponse } from 'next/server';

/**
 * Custom API error class with status code
 */
export class APIError extends Error {
    constructor(public statusCode: number, message: string) {
        super(message);
        this.name = 'APIError';
    }
}

/**
 * Centralized error handler for all API routes
 * Provides consistent error responses and logging
 */
export function handleAPIError(error: unknown): NextResponse {
    console.error('API Error:', error);

    // Known API errors with status codes
    if (error instanceof APIError) {
        return NextResponse.json(
            { error: error.message },
            { status: error.statusCode }
        );
    }

    // Prisma/Database errors
    if (error && typeof error === 'object' && 'code' in error) {
        const prismaError = error as any;

        // Unique constraint violation
        if (prismaError.code === 'P2002') {
            return NextResponse.json(
                { error: 'Cette ressource existe déjà' },
                { status: 409 }
            );
        }

        // Record not found
        if (prismaError.code === 'P2025') {
            return NextResponse.json(
                { error: 'Ressource introuvable' },
                { status: 404 }
            );
        }

        // Foreign key constraint failed
        if (prismaError.code === 'P2003') {
            return NextResponse.json(
                { error: 'Référence invalide' },
                { status: 400 }
            );
        }

        // Database connection error
        if (prismaError.code === 'P1001' || prismaError.code === 'P1002') {
            return NextResponse.json(
                { error: 'Service temporairement indisponible' },
                { status: 503 }
            );
        }
    }

    // Generic error - never expose internal details
    return NextResponse.json(
        { error: 'Une erreur interne s\'est produite' },
        { status: 500 }
    );
}

/**
 * Async error handler wrapper for API routes
 * Usage: export async function POST(req) { return withErrorHandler(async () => { ... }) }
 */
export async function withErrorHandler<T>(
    handler: () => Promise<T>
): Promise<NextResponse | T> {
    try {
        return await handler();
    } catch (error) {
        return handleAPIError(error);
    }
}

/**
 * Validation helper - throws APIError if condition fails
 */
export function validate(condition: boolean, message: string, statusCode: number = 400): void {
    if (!condition) {
        throw new APIError(statusCode, message);
    }
}
