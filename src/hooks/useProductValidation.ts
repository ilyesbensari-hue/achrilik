import { useState } from 'react';
import { ERROR_MESSAGES } from '@/lib/errorMessages';

interface ProductVariant {
    size?: string;
    color?: string;
}

interface Product {
    id: string;
    name: string;
    sizes: Array<{ id: string; name: string; stock: number }>;
    colors: Array<{ id: string; name: string; stock: number }>;
    stock: number;
}

interface ValidationError {
    type: 'error' | 'warning' | 'info' | 'success';
    message: string;
    details?: string;
    suggestions?: string[];
}

export function useProductValidation(product: Product) {
    const [error, setError] = useState<ValidationError | null>(null);

    const validateAddToCart = (
        selectedVariant: ProductVariant,
        quantity: number
    ): boolean => {
        // Vérifier si taille ET couleur sont requises
        const needsSize = product.sizes && product.sizes.length > 0;
        const needsColor = product.colors && product.colors.length > 0;

        const hasSizeSelected = !!selectedVariant.size;
        const hasColorSelected = !!selectedVariant.color;

        // CAS 1: Les deux manquent
        if (needsSize && needsColor && !hasSizeSelected && !hasColorSelected) {
            const sizeNames = product.sizes.map(s => s.name);
            const colorNames = product.colors.map(c => c.name);
            setError(ERROR_MESSAGES.both_required(sizeNames, colorNames));
            return false;
        }

        // CAS 2: Taille manquante
        if (needsSize && !hasSizeSelected) {
            const sizeNames = product.sizes.map(s => s.name);
            setError(ERROR_MESSAGES.size_required(sizeNames));
            return false;
        }

        // CAS 3: Couleur manquante
        if (needsColor && !hasColorSelected) {
            const colorNames = product.colors.map(c => c.name);
            setError(ERROR_MESSAGES.color_required(colorNames));
            return false;
        }

        // CAS 4: Vérifier stock de la variante spécifique
        const variantStock = getVariantStock(selectedVariant);

        if (variantStock === 0) {
            // Trouver alternatives
            const alternatives = findAlternatives(selectedVariant);
            setError(ERROR_MESSAGES.variant_out_of_stock(
                selectedVariant.size || '',
                selectedVariant.color || '',
                alternatives
            ));
            return false;
        }

        // CAS 5: Quantité supérieure au stock
        if (quantity > variantStock) {
            setError(ERROR_MESSAGES.stock_insufficient(quantity, variantStock));
            return false;
        }

        // Tout est OK
        setError(null);
        return true;
    };

    const getVariantStock = (variant: ProductVariant): number => {
        // Si pas de variantes, retourner stock global
        if (!product.sizes.length && !product.colors.length) {
            return product.stock;
        }

        // Logique simplifiée: retourner le stock minimum entre taille et couleur
        let stock = product.stock;

        if (variant.size) {
            const sizeObj = product.sizes.find(s => s.name === variant.size);
            if (sizeObj) stock = Math.min(stock, sizeObj.stock);
        }

        if (variant.color) {
            const colorObj = product.colors.find(c => c.name === variant.color);
            if (colorObj) stock = Math.min(stock, colorObj.stock);
        }

        return stock;
    };

    const findAlternatives = (variant: ProductVariant): string[] => {
        const alternatives: string[] = [];

        // Chercher avec même taille, couleur différente
        if (variant.size && product.colors.length > 0) {
            product.colors.forEach(color => {
                if (color.name !== variant.color && color.stock > 0) {
                    alternatives.push(`Taille ${variant.size} - Couleur ${color.name} (${color.stock} en stock)`);
                }
            });
        }

        // Chercher avec même couleur, taille différente
        if (variant.color && product.sizes.length > 0) {
            product.sizes.forEach(size => {
                if (size.name !== variant.size && size.stock > 0) {
                    alternatives.push(`Taille ${size.name} - Couleur ${variant.color} (${size.stock} en stock)`);
                }
            });
        }

        return alternatives.slice(0, 3); // Max 3 alternatives
    };

    const clearError = () => setError(null);

    return {
        error,
        validateAddToCart,
        clearError,
        getVariantStock
    };
}
