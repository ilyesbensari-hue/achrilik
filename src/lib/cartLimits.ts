// Configuration et validation des limitations du panier
// Protège l'application contre la complexité excessive

export const CART_LIMITS = {
    MAX_ITEMS_PER_STORE: 8,      // Maximum articles d'une même boutique
    MAX_STORES_PER_CART: 3,      // Maximum 3 boutiques différentes
    MAX_TOTAL_ITEMS: 20,         // Sécurité globale
} as const;

export type CartValidationErrorType =
    | 'MAX_ITEMS_PER_STORE'
    | 'MAX_STORES'
    | 'MAX_TOTAL';

export interface CartValidationError {
    type: CartValidationErrorType;
    message: string;
    storeName?: string;
    currentCount: number;
    maxAllowed: number;
}

export interface CartItem {
    id: string;
    productId: string;
    variantId: string;
    storeId: string;
    storeName: string;
    quantity: number;
    price: number;
}

/**
 * Groupe les articles par boutique
 */
function groupItemsByStore(items: CartItem[]): Record<string, CartItem[]> {
    return items.reduce((acc, item) => {
        if (!acc[item.storeId]) {
            acc[item.storeId] = [];
        }
        acc[item.storeId].push(item);
        return acc;
    }, {} as Record<string, CartItem[]>);
}

/**
 * Valide le panier selon les limites définies
 * @returns Erreur si limite dépassée, null si valide
 */
export function validateCart(cartItems: CartItem[]): CartValidationError | null {
    if (cartItems.length === 0) {
        return null; // Panier vide = valide
    }

    // 1. Vérifier nombre de boutiques
    const itemsByStore = groupItemsByStore(cartItems);
    const storeCount = Object.keys(itemsByStore).length;

    if (storeCount > CART_LIMITS.MAX_STORES_PER_CART) {
        return {
            type: 'MAX_STORES',
            message: `Vous ne pouvez commander que dans ${CART_LIMITS.MAX_STORES_PER_CART} boutiques maximum par commande`,
            currentCount: storeCount,
            maxAllowed: CART_LIMITS.MAX_STORES_PER_CART
        };
    }

    // 2. Vérifier articles par boutique
    for (const [storeId, items] of Object.entries(itemsByStore)) {
        const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

        if (itemCount > CART_LIMITS.MAX_ITEMS_PER_STORE) {
            return {
                type: 'MAX_ITEMS_PER_STORE',
                message: `Maximum ${CART_LIMITS.MAX_ITEMS_PER_STORE} articles par boutique`,
                storeName: items[0].storeName,
                currentCount: itemCount,
                maxAllowed: CART_LIMITS.MAX_ITEMS_PER_STORE
            };
        }
    }

    // 3. Vérifier total global (sécurité)
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    if (totalItems > CART_LIMITS.MAX_TOTAL_ITEMS) {
        return {
            type: 'MAX_TOTAL',
            message: `Maximum ${CART_LIMITS.MAX_TOTAL_ITEMS} articles au total dans le panier`,
            currentCount: totalItems,
            maxAllowed: CART_LIMITS.MAX_TOTAL_ITEMS
        };
    }

    return null; // ✅ Panier valide
}

/**
 * Vérifie si un nouvel article peut être ajouté au panier
 */
export function canAddToCart(
    currentCart: CartItem[],
    newItem: Omit<CartItem, 'id'>
): { allowed: boolean; error?: CartValidationError } {
    // Créer panier temporaire avec le nouvel article
    const testCart: CartItem[] = [...currentCart, { ...newItem, id: 'temp' }];

    const error = validateCart(testCart);

    return {
        allowed: error === null,
        error: error || undefined
    };
}

/**
 * Calcule combien d'articles peuvent encore être ajoutés pour une boutique
 */
export function getRemainingCapacity(cart: CartItem[], storeId: string): number {
    const itemsByStore = groupItemsByStore(cart);
    const storeItems = itemsByStore[storeId] || [];
    const currentCount = storeItems.reduce((sum, item) => sum + item.quantity, 0);

    return Math.max(0, CART_LIMITS.MAX_ITEMS_PER_STORE - currentCount);
}

/**
 * Calcule combien de boutiques peuvent encore être ajoutées au panier
 */
export function getRemainingStoresCapacity(cart: CartItem[]): number {
    const itemsByStore = groupItemsByStore(cart);
    const currentStoreCount = Object.keys(itemsByStore).length;

    return Math.max(0, CART_LIMITS.MAX_STORES_PER_CART - currentStoreCount);
}
