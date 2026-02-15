/**
 * Calculate seller payout from an order
 * 
 * Takes into account:
 * - Platform commission (currently 0%, configurable)
 * - Free delivery cost (if seller offered free delivery)
 */

interface OrderPayoutData {
    id: string;
    subtotal: number | null;
    total: number;
    freeDeliveryApplied: boolean | null;
    actualDeliveryFee: number | null;
    customerDeliveryFee: number | null;
}

interface PayoutBreakdown {
    revenue: number;           // Seller's base revenue from products
    commission: number;        // Platform commission amount
    deliveryFee: number;       // Delivery fee seller must pay (if free delivery offered)
    payout: number;           // Final payout to seller
    commissionRate: number;    // Commission rate applied
}

/**
 * Calculate payout for a seller from an order
 * 
 * @param order Order data including subtotal and delivery fees
 * @param commissionRate Platform commission rate (0-1, default 0 for launch)
 * @returns Breakdown of payout calculation
 */
export function calculateSellerPayout(
    order: OrderPayoutData,
    commissionRate: number = 0 // 0% for launch, can be 0.10 for 10%
): PayoutBreakdown {
    // Revenue = subtotal (products only) or total if subtotal not set
    const revenue = order.subtotal || order.total;

    // Platform commission
    const commission = revenue * commissionRate;

    // Delivery fee that seller must pay
    // If freeDeliveryApplied = true, seller pays the actualDeliveryFee to the delivery agent
    // If freeDeliveryApplied = false, customer paid, so seller doesn't pay
    const deliveryFee = order.freeDeliveryApplied && order.actualDeliveryFee
        ? order.actualDeliveryFee
        : 0;

    // Final payout to seller
    const payout = revenue - commission - deliveryFee;

    return {
        revenue,
        commission,
        deliveryFee,
        payout,
        commissionRate
    };
}

/**
 * Calculate delivery agent earning from an order
 * 
 * @param order Order data
 * @returns Amount delivery agent should receive
 */
export function calculateDeliveryAgentEarning(order: OrderPayoutData): number {
    // Delivery agent always gets the actualDeliveryFee (500 DA standard)
    // Whether it comes from customer or seller depends on freeDeliveryApplied
    return order.actualDeliveryFee || 0;
}

/**
 * Example usage and tests
 */

// Example 1: Free delivery qualified (seller pays)
const order1: OrderPayoutData = {
    id: '123',
    subtotal: 8500,
    total: 8500,
    freeDeliveryApplied: true,
    actualDeliveryFee: 500,
    customerDeliveryFee: 0
};

const payout1 = calculateSellerPayout(order1, 0);
// Result:
// revenue: 8500 DA
// commission: 0 DA (0%)
// deliveryFee: 500 DA (seller pays)
// payout: 8000 DA
// 
// Delivery agent gets: 500 DA (from seller)
// Total distributed: 8000 + 500 = 8500 ✅

// Example 2: Free delivery NOT qualified (customer pays)
const order2: OrderPayoutData = {
    id: '456',
    subtotal: 5000,
    total: 5500,
    freeDeliveryApplied: false,
    actualDeliveryFee: 500,
    customerDeliveryFee: 500
};

const payout2 = calculateSellerPayout(order2, 0);
// Result:
// revenue: 5000 DA
// commission: 0 DA (0%)
// deliveryFee: 0 DA (customer paid)
// payout: 5000 DA
//
// Delivery agent gets: 500 DA (from customer)
// Customer paid: 5500 DA
// Total distributed: 5000 + 500 = 5500 ✅

// Example 3: With 10% commission (future)
const payout3 = calculateSellerPayout(order1, 0.10);
// Result:
// revenue: 8500 DA
// commission: 850 DA (10%)
// deliveryFee: 500 DA (seller pays)
// payout: 7150 DA
//
// Platform gets: 850 DA
// Delivery agent gets: 500 DA
// Seller gets: 7150 DA
// Total distributed: 850 + 500 + 7150 = 8500 ✅
