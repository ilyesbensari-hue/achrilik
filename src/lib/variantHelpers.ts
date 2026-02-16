/**
 * Helper function to get size options based on product category
 * Adapts size selection according to product type (clothing, shoes, bags, etc.)
 */

export interface SizeOption {
    value: string;
    label: string;
}

export interface SizeConfig {
    options: SizeOption[];
    showDimensions: boolean; // Show L×W×H inputs for bags
    sizeLabel: string; // "Taille", "Pointure", or "Taille (optionnel)"
    required: boolean;
}

/**
 * Determines size configuration based on category slug
 */
export function getSizeConfig(categorySlug?: string, categoryName?: string): SizeConfig {
    if (!categorySlug && !categoryName) {
        // Default: clothing sizes
        return {
            options: [
                { value: 'XS', label: 'XS' },
                { value: 'S', label: 'S' },
                { value: 'M', label: 'M' },
                { value: 'L', label: 'L' },
                { value: 'XL', label: 'XL' },
                { value: 'XXL', label: 'XXL' },
            ],
            showDimensions: false,
            sizeLabel: 'Taille',
            required: true,
        };
    }

    // Normalize slugs: remove trailing hyphens and lowercase
    const slug = (categorySlug?.toLowerCase() || '').replace(/-+$/g, '');
    const name = categoryName?.toLowerCase() || '';
    const combined = `${slug} ${name}`;

    // ==========================================
    // ÉLECTRONIQUE & TECH (NO SIZES!)
    // ==========================================
    if (
        combined.includes('electronique') ||
        combined.includes('électronique') ||
        combined.includes('tech') ||
        combined.includes('batterie') ||
        combined.includes('accessoire electronique') ||
        combined.includes('accessoire électronique') ||
        combined.includes('ordinateur') ||
        combined.includes('telephone') ||
        combined.includes('téléphone') ||
        combined.includes('tablette') ||
        combined.includes('casque audio') ||
        combined.includes('ecouteur') ||
        combined.includes('écouteur') ||
        combined.includes('chargeur')
    ) {
        return {
            options: [], // NO SIZE OPTIONS AT ALL
            showDimensions: false,
            sizeLabel: '',
            required: false, // Size is NOT required for electronics
        };
    }

    // ==========================================
    // CHAUSSURES (Shoes)
    // ==========================================
    if (combined.includes('chaussure')) {
        // Chaussures Femme
        if (combined.includes('femme') || combined.includes('female')) {
            return {
                options: [
                    { value: '36', label: '36' },
                    { value: '37', label: '37' },
                    { value: '38', label: '38' },
                    { value: '39', label: '39' },
                    { value: '40', label: '40' },
                    { value: '41', label: '41' },
                    { value: '42', label: '42' },
                ],
                showDimensions: false,
                sizeLabel: 'Pointure',
                required: true,
            };
        }

        // Chaussures Homme
        if (combined.includes('homme') || combined.includes('male')) {
            return {
                options: [
                    { value: '39', label: '39' },
                    { value: '40', label: '40' },
                    { value: '41', label: '41' },
                    { value: '42', label: '42' },
                    { value: '43', label: '43' },
                    { value: '44', label: '44' },
                    { value: '45', label: '45' },
                    { value: '46', label: '46' },
                ],
                showDimensions: false,
                sizeLabel: 'Pointure',
                required: true,
            };
        }

        // Chaussures Enfant/Bébé
        if (combined.includes('enfant') || combined.includes('bebe') || combined.includes('bébé')) {
            return {
                options: [
                    { value: '20', label: '20' },
                    { value: '21', label: '21' },
                    { value: '22', label: '22' },
                    { value: '23', label: '23' },
                    { value: '24', label: '24' },
                    { value: '25', label: '25' },
                    { value: '26', label: '26' },
                    { value: '27', label: '27' },
                    { value: '28', label: '28' },
                    { value: '29', label: '29' },
                    { value: '30', label: '30' },
                    { value: '31', label: '31' },
                    { value: '32', label: '32' },
                    { value: '33', label: '33' },
                    { value: '34', label: '34' },
                    { value: '35', label: '35' },
                ],
                showDimensions: false,
                sizeLabel: 'Pointure',
                required: true,
            };
        }
    }

    // ==========================================
    // SACS & ACCESSOIRES (Bags) - NOT TECH
    // ==========================================
    if (
        (combined.includes('sac') ||
            combined.includes('valise') ||
            combined.includes('bagagerie') ||
            combined.includes('maroquinerie')) &&
        !combined.includes('electronique') &&
        !combined.includes('électronique')
    ) {
        return {
            options: [
                { value: 'Unique', label: 'Taille Unique' },
                { value: 'Petit', label: 'Petit' },
                { value: 'Moyen', label: 'Moyen' },
                { value: 'Grand', label: 'Grand' },
            ],
            showDimensions: true, // Enable L×W×H inputs
            sizeLabel: 'Taille (optionnel)',
            required: false,
        };
    }

    // ==========================================
    // VÊTEMENTS BÉBÉ
    // ==========================================
    if (combined.includes('bebe') || combined.includes('bébé')) {
        return {
            options: [
                { value: '0-3M', label: '0-3 mois' },
                { value: '3-6M', label: '3-6 mois' },
                { value: '6-12M', label: '6-12 mois' },
                { value: '12-18M', label: '12-18 mois' },
                { value: '18-24M', label: '18-24 mois' },
            ],
            showDimensions: false,
            sizeLabel: 'Taille',
            required: true,
        };
    }

    // ==========================================
    // VÊTEMENTS ENFANT
    // ==========================================
    if (combined.includes('enfant')) {
        return {
            options: [
                { value: '2A', label: '2 ans' },
                { value: '3A', label: '3 ans' },
                { value: '4A', label: '4 ans' },
                { value: '5A', label: '5 ans' },
                { value: '6A', label: '6 ans' },
                { value: '8A', label: '8 ans' },
                { value: '10A', label: '10 ans' },
                { value: '12A', label: '12 ans' },
                { value: '14A', label: '14 ans' },
            ],
            showDimensions: false,
            sizeLabel: 'Taille',
            required: true,
        };
    }

    // ==========================================
    // VÊTEMENTS ADULTES (Default)
    // ==========================================
    return {
        options: [
            { value: 'XS', label: 'XS' },
            { value: 'S', label: 'S' },
            { value: 'M', label: 'M' },
            { value: 'L', label: 'L' },
            { value: 'XL', label: 'XL' },
            { value: 'XXL', label: 'XXL' },
        ],
        showDimensions: false,
        sizeLabel: 'Taille',
        required: true,
    };
}

/**
 * Format dimensions for display
 * Example: "30×20×10 cm"
 */
export function formatDimensions(length?: number | null, width?: number | null, height?: number | null): string {
    if (!length && !width && !height) return '';

    const parts = [length, width, height].filter(d => d !== null && d !== undefined);
    if (parts.length === 0) return '';

    return `${parts.join('×')} cm`;
}

/**
 * Check if variant has dimensions instead of size
 */
export function hasDimensions(variant: { length?: number | null; width?: number | null; height?: number | null }): boolean {
    return !!(variant.length || variant.width || variant.height);
}
