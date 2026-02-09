// Helper to calculate free delivery status for each store in cart

interface CartItem {
    id: string;
    productId: string;
    variantId: string;
    cartQuantity: number;
    Product: {
        id: string;
        title: string;
        price: number;
        storeId: string;
        Store: {
            id: string;
            name: string;
            city: string | null;
            offersFreeDelivery?: boolean;
            freeDeliveryThreshold?: number | null;
        };
    };
}

export interface StoreCartData {
    storeId: string;
    storeName: string;
    storeCity: string | null;
    totalAmount: number;
    offersFreeDelivery: boolean;
    freeDeliveryThreshold: number | null;
    amountToFreeDelivery: number | null; // Null if already met or not offered
    percentageToThreshold: number;
}

export function calculateFreeDeliveryStatus(cartItems: CartItem[]): StoreCartData[] {
    // Group items by store
    const storeMap = new Map<string, {
        store: CartItem['Product']['Store'];
        totalAmount: number;
    }>();

    cartItems.forEach(item => {
        const storeId = item.Product.storeId;
        const itemTotal = item.Product.price * item.cartQuantity;

        if (storeMap.has(storeId)) {
            const existing = storeMap.get(storeId)!;
            existing.totalAmount += itemTotal;
        } else {
            storeMap.set(storeId, {
                store: item.Product.Store,
                totalAmount: itemTotal
            });
        }
    });

    // Calculate free delivery status for each store
    const result: StoreCartData[] = [];

    storeMap.forEach(({ store, totalAmount }, storeId) => {
        const offersFreeDelivery = store.offersFreeDelivery || false;
        const threshold = store.freeDeliveryThreshold || null;

        let amountToFreeDelivery: number | null = null;
        let percentageToThreshold = 0;

        if (offersFreeDelivery && threshold && totalAmount < threshold) {
            amountToFreeDelivery = threshold - totalAmount;
            percentageToThreshold = (totalAmount / threshold) * 100;
        } else if (offersFreeDelivery && threshold && totalAmount >= threshold) {
            // Already met threshold
            percentageToThreshold = 100;
        }

        result.push({
            storeId,
            storeName: store.name,
            storeCity: store.city,
            totalAmount,
            offersFreeDelivery,
            freeDeliveryThreshold: threshold,
            amountToFreeDelivery,
            percentageToThreshold
        });
    });

    return result;
}

// Filter stores that are close to free delivery (within 3000 DA)
export function getIncentiveStores(storesData: StoreCartData[]): StoreCartData[] {
    return storesData.filter(s =>
        s.amountToFreeDelivery !== null &&
        s.amountToFreeDelivery > 0 &&
        s.amountToFreeDelivery <= 3000 // Only show if within 3000 DA
    );
}
