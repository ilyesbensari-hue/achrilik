import { prisma } from '@/lib/prisma';

/**
 * Calcule les frais de livraison pour une commande
 * Basé sur la ville de stockage des produits et la wilaya de destination
 */
export async function calculateDeliveryFee(
    cart: Array<{ storeId: string;[key: string]: any }>,
    destinationWilaya: string
): Promise<{
    totalFee: number;
    feeByStore: Array<{
        storeId: string;
        storeName: string;
        storageCity: string | null;
        fee: number;
    }>;
    hasOutsideOranProducts: boolean;
}> {
    const DEFAULT_FEE = 500; // Frais par défaut si aucune config trouvée

    // Grouper le panier par magasin
    const storeIds = [...new Set(cart.map(item => item.storeId))].filter(Boolean);

    if (storeIds.length === 0) {
        return {
            totalFee: DEFAULT_FEE,
            feeByStore: [],
            hasOutsideOranProducts: false
        };
    }

    // Récupérer les magasins avec leur ville de stockage
    const stores = await prisma.store.findMany({
        where: { id: { in: storeIds } },
        select: {
            id: true,
            name: true,
            storageCity: true
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
    }> = [];
    let totalFee = 0;
    let hasOutsideOranProducts = false;

    for (const store of stores) {
        const storageCity = store.storageCity || 'Oran'; // Par défaut Oran si non spécifié

        if (storageCity !== 'Oran') {
            hasOutsideOranProducts = true;
        }

        // Chercher la configuration exacte fromCity → toWilaya
        let fee: number | null = null;
        const exactConfig = feeConfigs.find(
            (config: any) => config.fromCity === storageCity && config.toWilaya === destinationWilaya
        );

        if (exactConfig) {
            fee = exactConfig.baseFee;
        } else {
            // Chercher une configuration "Autre" comme fallback
            const fallbackConfig = feeConfigs.find(
                (config: any) => config.fromCity === storageCity && config.toWilaya === 'Autre'
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
            fee: storeFee
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
