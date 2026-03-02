/**
 * scripts/fix-product-names.ts
 *
 * Script one-shot pour corriger les fautes d'orthographe dans les noms de produits.
 * Corrige "Pontalon" → "Pantalon" (et variantes similaires).
 *
 * Usage:
 *   npx ts-node --project tsconfig.json scripts/fix-product-names.ts
 *   # ou avec tsx (plus rapide, pas besoin de compilation):
 *   npx tsx scripts/fix-product-names.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ─── Corrections à appliquer ─────────────────────────────────────────────────
// Format: { pattern (regex), replacement }
const CORRECTIONS: Array<{ pattern: RegExp; replacement: string; description: string }> = [
    {
        pattern: /Pontalon/gi,
        replacement: 'Pantalon',
        description: '"Pontalon" → "Pantalon"',
    },
    {
        pattern: /\bPontalo\b/gi,
        replacement: 'Pantalon',
        description: '"Pontalo" → "Pantalon"',
    },
    {
        pattern: /\bChausuure\b/gi,
        replacement: 'Chaussure',
        description: '"Chausuure" → "Chaussure"',
    },
    {
        pattern: /\bChausurre\b/gi,
        replacement: 'Chaussure',
        description: '"Chausurre" → "Chaussure"',
    },
    {
        pattern: /\bVêtement\s*Femm\b/gi,
        replacement: 'Vêtement Femme',
        description: '"Vêtement Femm" → "Vêtement Femme"',
    },
];

// ─── Validation helper ────────────────────────────────────────────────────────
/**
 * Valide un nom de produit et retourne une liste d'avertissements.
 * Peut être importé depuis d'autres fichiers.
 */
export function validateProductName(name: string): string[] {
    const warnings: string[] = [];

    if (!name || name.trim() === '') {
        warnings.push('Le nom du produit est vide.');
        return warnings;
    }

    // Fautes orthographiques courantes
    const KNOWN_TYPOS: Array<{ wrong: RegExp; correct: string }> = [
        { wrong: /Pontalon/i, correct: 'Pantalon' },
        { wrong: /Chausuure/i, correct: 'Chaussure' },
        { wrong: /Chausurre/i, correct: 'Chaussure' },
        { wrong: /Tshirt/i, correct: 'T-Shirt' },
        { wrong: /t shirt/i, correct: 'T-Shirt' },
        { wrong: /Robe De Soriée/i, correct: 'Robe De Soirée' },
        { wrong: /Veste a/i, correct: 'Veste à' },
        { wrong: /\bPortefeille\b/i, correct: 'Portefeuille' },
        { wrong: /\bCasaquette\b/i, correct: 'Casquette' },
    ];

    for (const typo of KNOWN_TYPOS) {
        if (typo.wrong.test(name)) {
            warnings.push(`Faute probable : "${name.match(typo.wrong)?.[0]}" → "${typo.correct}"`);
        }
    }

    // Produit de test
    if (name.startsWith('[TEST]') || name.startsWith('[test]')) {
        warnings.push('Ce produit semble être un produit de test (préfixe [TEST]).');
    }

    // Titre trop court
    if (name.trim().length < 3) {
        warnings.push(`Nom trop court (${name.trim().length} caractères, minimum 3).`);
    }

    // Titre trop long
    if (name.trim().length > 120) {
        warnings.push(`Nom trop long (${name.trim().length} caractères, maximum 120 recommandé).`);
    }

    // Tout en majuscules
    if (name === name.toUpperCase() && name.length > 2) {
        warnings.push('Nom entièrement en majuscules — considérer la capitalisation normale.');
    }

    return warnings;
}

// ─── Script principal ─────────────────────────────────────────────────────────
async function main() {
    console.log('\n🔧 Script de correction des noms de produits\n');

    // 1. Fetch all products
    const allProducts = await prisma.product.findMany({
        select: { id: true, title: true },
    });

    console.log(`📦 ${allProducts.length} produits trouvés en base.\n`);

    const toUpdate: Array<{ id: string; oldTitle: string; newTitle: string }> = [];

    for (const product of allProducts) {
        let newTitle = product.title;

        for (const correction of CORRECTIONS) {
            newTitle = newTitle.replace(correction.pattern, correction.replacement);
        }

        if (newTitle !== product.title) {
            toUpdate.push({ id: product.id, oldTitle: product.title, newTitle });
        }
    }

    if (toUpdate.length === 0) {
        console.log('✅ Aucune correction nécessaire — tous les noms sont corrects.\n');
        return;
    }

    console.log(`⚠️  ${toUpdate.length} produit(s) à corriger :\n`);
    for (const item of toUpdate) {
        console.log(`  • [${item.id}] "${item.oldTitle}" → "${item.newTitle}"`);
    }

    // 2. Confirmation
    const isDryRun = process.argv.includes('--dry-run');
    if (isDryRun) {
        console.log('\n🔬 Mode --dry-run : aucune modification appliquée.\n');
        return;
    }

    console.log('\n⏳ Application des corrections...\n');

    for (const item of toUpdate) {
        await prisma.product.update({
            where: { id: item.id },
            data: { title: item.newTitle },
        });
        console.log(`  ✅ Corrigé : "${item.oldTitle}" → "${item.newTitle}"`);
    }

    console.log(`\n🎉 ${toUpdate.length} produit(s) mis à jour avec succès !\n`);

    // 3. Validation post-correction
    console.log('📋 Validation des noms restants...\n');
    const remaining = await prisma.product.findMany({ select: { id: true, title: true } });
    let hasWarnings = false;

    for (const p of remaining) {
        const warnings = validateProductName(p.title);
        if (warnings.length > 0) {
            hasWarnings = true;
            console.log(`  ⚠️  [${p.id}] "${p.title}"`);
            warnings.forEach(w => console.log(`      → ${w}`));
        }
    }

    if (!hasWarnings) {
        console.log('✅ Tous les noms de produits sont valides.\n');
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
