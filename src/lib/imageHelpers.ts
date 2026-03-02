/**
 * imageHelpers.ts
 * Utilitaires pour normaliser les URLs d'images produit.
 *
 * Certaines images en DB sont stockées sous forme de tableau JSON stringifié :
 *   ["https://images.unsplash.com/photo-xyz"]
 * au lieu de la simple string attendue :
 *   https://images.unsplash.com/photo-xyz
 *
 * Ces helpers centralisent la correction de ce format cassé.
 */

const PLACEHOLDER = '/placeholder-product.png';

/**
 * Sanitise une URL d'image unique.
 * Si l'URL ressemble à un tableau JSON (['...']), on l'extrait.
 * Si c'est vide / null / undefined, on retourne le placeholder.
 */
export function sanitizeImageUrl(url: string | null | undefined): string {
    if (!url || url.trim() === '') return PLACEHOLDER;

    const trimmed = url.trim();

    // Format cassé : JSON array stringifié -> ["https://..."] ou ['https://...']
    if (trimmed.startsWith('[')) {
        try {
            const parsed = JSON.parse(trimmed);
            if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'string') {
                return parsed[0].trim() || PLACEHOLDER;
            }
        } catch {
            // JSON invalide, on continue avec l'URL brute
        }
    }

    return trimmed;
}

/**
 * Transforme la colonne `images` (string comma-separated, ou JSON array stringifié)
 * en tableau d'URLs normalisées.
 *
 * Formats gérés :
 *   "https://a.com/img1.jpg,https://a.com/img2.jpg"
 *   '["https://a.com/img1.jpg","https://a.com/img2.jpg"]'
 *   "https://a.com/img1.jpg"
 */
export function parseImages(imagesField: string | null | undefined): string[] {
    if (!imagesField || imagesField.trim() === '') return [PLACEHOLDER];

    const trimmed = imagesField.trim();

    // Format JSON array stringifié
    if (trimmed.startsWith('[')) {
        try {
            const parsed = JSON.parse(trimmed);
            if (Array.isArray(parsed)) {
                const urls = parsed
                    .filter((u): u is string => typeof u === 'string' && u.trim() !== '')
                    .map((u) => u.trim());
                return urls.length > 0 ? urls : [PLACEHOLDER];
            }
        } catch {
            // Pas un JSON valide, on continue
        }
    }

    // Format comma-separated standard
    const urls = trimmed
        .split(',')
        .map((u) => u.trim())
        .filter((u) => u !== '');

    return urls.length > 0 ? urls : [PLACEHOLDER];
}

/**
 * Raccourci : retourne la première image normalisée d'un champ `images`.
 * Équivaut à parseImages(field)[0].
 */
export function firstImage(imagesField: string | null | undefined): string {
    return parseImages(imagesField)[0];
}
