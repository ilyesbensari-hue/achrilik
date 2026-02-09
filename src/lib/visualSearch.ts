// IMPORTANT: TensorFlow.js est importé dynamiquement pour éviter les crashes
// La recherche visuelle est désactivée par défaut
let model: any | null = null;

/**
 * Charge le modèle MobileNet (une seule fois) - avec lazy loading
 * DÉSACTIVÉ PAR DÉFAUT pour éviter les crashes navigateur
 */
export async function loadModel(): Promise<any> {
    // Feature flag: désactiver si pas explicitement activé
    if (typeof window === 'undefined') {
        console.warn('[VisualSearch] Server-side - returning null');
        return null;
    }

    if (!process.env.NEXT_PUBLIC_ENABLE_VISUAL_SEARCH || process.env.NEXT_PUBLIC_ENABLE_VISUAL_SEARCH !== 'true') {
        console.warn('[VisualSearch] Feature disabled via NEXT_PUBLIC_ENABLE_VISUAL_SEARCH');
        return null;
    }

    if (model) return model;

    if (process.env.NODE_ENV === 'development') {
        console.log('[VisualSearch] Loading TensorFlow.js and MobileNet (lazy)...');
    }

    try {
        // Lazy import pour éviter de charger au démarrage
        const [tf, mobilenet] = await Promise.all([
            import('@tensorflow/tfjs'),
            import('@tensorflow-models/mobilenet')
        ]);

        model = await mobilenet.load();
        if (process.env.NODE_ENV === 'development') {
            console.log('[VisualSearch] MobileNet model loaded successfully!');
        }

        return model;
    } catch (error) {
        console.error('[VisualSearch] Failed to load model:', error);
        return null;
    }
}

/**
 * Extrait les features d'une image
 * @param imageElement - Element HTML Image
 * @returns Vecteur de features (1024 dimensions)
 */
export async function extractImageFeatures(
    imageElement: HTMLImageElement
): Promise<number[]> {
    const loadedModel = await loadModel();

    if (!loadedModel) {
        console.error('[VisualSearch] Model not available - cannot extract features');
        throw new Error('Visual search is disabled. Please enable NEXT_PUBLIC_ENABLE_VISUAL_SEARCH');
    }

    // Extraire les features (activation de la dernière couche avant classification)
    const activation = loadedModel.infer(imageElement, true);

    // Convertir en array
    const features = await activation.data();

    // Nettoyer la mémoire
    activation.dispose();

    return Array.from(features);
}

/**
 * Calcule la similarité cosine entre deux vecteurs
 * @param vecA - Premier vecteur de features
 * @param vecB - Deuxième vecteur de features
 * @returns Score de similarité (0-1, 1 = identique)
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) {
        throw new Error('Vectors must have same length');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }

    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);

    if (normA === 0 || normB === 0) {
        return 0;
    }

    return dotProduct / (normA * normB);
}

/**
 * Trouve les produits les plus similaires
 * @param queryFeatures - Features de l'image uploadée
 * @param productFeatures - Map des features des produits {productId: features}
 * @param topK - Nombre de résultats à retourner
 * @returns Array de {productId, similarity} triés par similarité
 */
export function findSimilarProducts(
    queryFeatures: number[],
    productFeatures: Map<string, number[]>,
    topK: number = 10
): Array<{ productId: string; similarity: number }> {
    const similarities: Array<{ productId: string; similarity: number }> = [];

    // Calculer similarité avec chaque produit
    for (const [productId, features] of productFeatures.entries()) {
        const similarity = cosineSimilarity(queryFeatures, features);
        similarities.push({ productId, similarity });
    }

    // Trier par similarité décroissante
    similarities.sort((a, b) => b.similarity - a.similarity);

    // Retourner top K
    return similarities.slice(0, topK);
}

/**
 * Charge une image depuis une URL ou File
 * @param source - URL ou File object
 * @returns Promise<HTMLImageElement>
 */
export function loadImage(source: string | File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';

        img.onload = () => resolve(img);
        img.onerror = reject;

        if (typeof source === 'string') {
            img.src = source;
        } else {
            const reader = new FileReader();
            reader.onload = (e) => {
                img.src = e.target?.result as string;
            };
            reader.onerror = reject;
            reader.readAsDataURL(source);
        }
    });
}
