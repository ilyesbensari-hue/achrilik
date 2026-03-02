import { prisma } from '@/lib/prisma';

/**
 * Get product status based on store verification
 * Products from verified stores are auto-approved
 */
export async function getProductStatus(storeId: string): Promise<'APPROVED' | 'PENDING'> {
    try {
        const store = await prisma.store.findUnique({
            where: { id: storeId },
            select: { verified: true }
        });

        // Auto-approve if store is verified
        return store?.verified ? 'APPROVED' : 'PENDING';
    } catch (error) {
        console.error('[getProductStatus] Error:', error);
        return 'PENDING'; // Default to pending if error
    }
}

/**
 * Valide le nom d'un produit et retourne une liste d'avertissements.
 * Détecte les fautes courantes, noms de test, longueurs anormales.
 */
export function validateProductName(name: string): string[] {
    const warnings: string[] = [];

    if (!name || name.trim() === '') {
        warnings.push('Le nom du produit est vide.');
        return warnings;
    }

    const KNOWN_TYPOS: Array<{ wrong: RegExp; correct: string }> = [
        { wrong: /Pontalon/i, correct: 'Pantalon' },
        { wrong: /Chausuure/i, correct: 'Chaussure' },
        { wrong: /Chausurre/i, correct: 'Chaussure' },
        { wrong: /Tshirt/i, correct: 'T-Shirt' },
        { wrong: /t shirt/i, correct: 'T-Shirt' },
        { wrong: /\bPortefeille\b/i, correct: 'Portefeuille' },
        { wrong: /\bCasaquette\b/i, correct: 'Casquette' },
    ];

    for (const typo of KNOWN_TYPOS) {
        if (typo.wrong.test(name)) {
            warnings.push(`Faute probable : "${name.match(typo.wrong)?.[0]}" → "${typo.correct}"`);
        }
    }

    if (name.startsWith('[TEST]') || name.toLowerCase().startsWith('[test]')) {
        warnings.push('Produit de test détecté (préfixe [TEST]).');
    }

    if (name.trim().length < 3) {
        warnings.push(`Nom trop court (${name.trim().length} chars, min 3).`);
    }

    if (name.trim().length > 120) {
        warnings.push(`Nom trop long (${name.trim().length} chars, max 120 recommandé).`);
    }

    return warnings;
}
