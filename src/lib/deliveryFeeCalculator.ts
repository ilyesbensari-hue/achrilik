import { prisma } from '@/lib/prisma';

interface DeliveryFeeConfig {
    id: string;
    fromCity: string;
    toWilaya: string;
    baseFee: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

interface CartItem {
    storeId: string;
    price: number;
    quantity: number;
    productId?: string;
    variantId?: string;
}

/**
 * Calcule les frais de livraison pour une commande
 * Basé sur la ville de stockage des produits et la wilaya de destination
 */
export async function calculateDeliveryFee(
    cart: CartItem[],
    destinationWilaya: string
): Promise<{
    totalFee: number;
    feeByStore: Array<{
        storeId: string;
        storeName: string;
        storageCity: string | null;
        fee: number;
        freeDeliveryApplied?: boolean;
        thresholdReached?: boolean;
    }>;
    hasOutsideOranProducts: boolean;
}> {
    const DEFAULT_FEE = 500; // Frais par défaut si aucune config trouvée

    // Grouper le panier par magasin et calculer totaux
    const storeIds = [...new Set(cart.map(item => item.storeId))].filter(Boolean);
    const storeTotals = new Map<string, number>();

    cart.forEach(item => {
        const total = item.price * item.quantity;
        storeTotals.set(item.storeId, (storeTotals.get(item.storeId) || 0) + total);
    });

    if (storeIds.length === 0) {
        return {
            totalFee: DEFAULT_FEE,
            feeByStore: [],
            hasOutsideOranProducts: false
        };
    }

    // Récupérer les magasins avec ville de stockage ET paramètres livraison gratuite
    const stores = await prisma.store.findMany({
        where: { id: { in: storeIds } },
        select: {
            id: true,
            name: true,
            storageCity: true,
            offersFreeDelivery: true,
            freeDeliveryThreshold: true
        }
    });

    // Récupérer toutes les configurations de frais actives
    const feeConfigs = await prisma.deliveryFeeConfig.findMany({
        where: { isActive: true }
    });

    const feeByStore: Array<{
        storeId: string;
        storeName: string;
        storageCity: string | null;
        fee: number;
        freeDeliveryApplied?: boolean;
        thresholdReached?: boolean;
    }> = [];
    let totalFee = 0;
    let hasOutsideOranProducts = false;

    for (const store of stores) {
        const storageCity = store.storageCity || 'Oran'; // Par défaut Oran si non spécifié
        const storeTotal = storeTotals.get(store.id) || 0;

        if (storageCity !== 'Oran') {
            hasOutsideOranProducts = true;
        }

        // 🚚 CHECK FREE DELIVERY FIRST
        const qualifiesForFreeDelivery =
            store.offersFreeDelivery &&
            store.freeDeliveryThreshold &&
            storeTotal >= store.freeDeliveryThreshold;

        if (qualifiesForFreeDelivery) {
            // ✅ Livraison GRATUITE - Frais = 0
            feeByStore.push({
                storeId: store.id,
                storeName: store.name,
                storageCity: store.storageCity,
                fee: 0,
                freeDeliveryApplied: true,
                thresholdReached: true
            });
            // totalFee += 0 (pas de frais)
            continue;
        }

        // Sinon, calculer frais normaux
        let fee: number | null = null;
        const exactConfig = feeConfigs.find(
            (config) => config.fromCity === storageCity && config.toWilaya === destinationWilaya
        );

        if (exactConfig) {
            fee = exactConfig.baseFee;
        } else {
            // Chercher une configuration "Autre" comme fallback
            const fallbackConfig = feeConfigs.find(
                (config) => config.fromCity === storageCity && config.toWilaya === 'Autre'
            );

            if (fallbackConfig) {
                fee = fallbackConfig.baseFee;
            }
        }

        // Si aucune configuration, utiliser frais par défaut
        const storeFee = fee !== null ? fee : DEFAULT_FEE;

        feeByStore.push({
            storeId: store.id,
            storeName: store.name,
            storageCity: store.storageCity,
            fee: storeFee,
            freeDeliveryApplied: false
        });

        totalFee += storeFee;
    }

    return {
        totalFee,
        feeByStore,
        hasOutsideOranProducts
    };
}

/**
 * Obtenir les frais pour une route spécifique (utilisé dans l'interface)
 */
export async function getDeliveryFeeForRoute(
    fromCity: string,
    toWilaya: string
): Promise<number> {
    const DEFAULT_FEE = 500;

    try {
        // Chercher configuration exacte
        const exactConfig = await prisma.deliveryFeeConfig.findUnique({
            where: {
                fromCity_toWilaya: {
                    fromCity,
                    toWilaya
                }
            }
        });

        if (exactConfig && exactConfig.isActive) {
            return exactConfig.baseFee;
        }

        // Fallback sur "Autre"
        const fallbackConfig = await prisma.deliveryFeeConfig.findUnique({
            where: {
                fromCity_toWilaya: {
                    fromCity,
                    toWilaya: 'Autre'
                }
            }
        });

        if (fallbackConfig && fallbackConfig.isActive) {
            return fallbackConfig.baseFee;
        }

        return DEFAULT_FEE;
    } catch (error) {
        console.error('Error fetching delivery fee:', error);
        return DEFAULT_FEE;
    }
}

/**
 * Calculer les frais de livraison pour une boutique et wilaya (utilisé lors création delivery)
 */
export async function getDeliveryFeeForStoreAndWilaya(
    storeId: string | null,
    destinationWilaya: string | null
): Promise<number> {
    const DEFAULT_FEE = 500;

    if (!storeId || !destinationWilaya) {
        return DEFAULT_FEE;
    }

    try {
        // Récupérer la ville de stockage du magasin
        const store = await prisma.store.findUnique({
            where: { id: storeId },
            select: { storageCity: true }
        });

        if (!store) {
            return DEFAULT_FEE;
        }

        const fromCity = store.storageCity || 'Oran';

        // Utiliser la fonction existante
        return await getDeliveryFeeForRoute(fromCity, destinationWilaya);
    } catch (error) {
        console.error('Error calculating delivery fee for store:', error);
        return DEFAULT_FEE;
    }
}
