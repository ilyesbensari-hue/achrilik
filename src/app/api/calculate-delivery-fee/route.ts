import { NextRequest, NextResponse } from 'next/server';
import { calculateDeliveryFee } from '@/lib/deliveryFeeCalculator';

/**
 * API Route: Calculate delivery fees
 * 
 * Moved from client-side to server-side to avoid Prisma browser error
 */
export async function POST(request: NextRequest) {
    try {
        const { cart, destinationWilaya } = await request.json();

        // Validate input
        if (!cart || !Array.isArray(cart)) {
            return NextResponse.json(
                { error: 'Invalid cart data' },
                { status: 400 }
            );
        }

        if (!destinationWilaya) {
            return NextResponse.json(
                { error: 'Destination wilaya is required' },
                { status: 400 }
            );
        }

        // Calculate fees using server-side Prisma
        const result = await calculateDeliveryFee(cart, destinationWilaya);

        return NextResponse.json(result);
    } catch (error) {
        console.error('Delivery fee calculation error:', error);
        return NextResponse.json(
            {
                error: 'Failed to calculate delivery fee',
                totalFee: 500, // Fallback
                feeByStore: [],
                hasOutsideOranProducts: false
            },
            { status: 500 }
        );
    }
}
