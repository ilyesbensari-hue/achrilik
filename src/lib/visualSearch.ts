import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';

let model: mobilenet.MobileNet | null = null;

/**
 * Charge le modèle MobileNet (une seule fois)
 */
export async function loadModel(): Promise<mobilenet.MobileNet> {
    if (model) return model;

    console.log('Loading MobileNet model...');
    model = await mobilenet.load();
    console.log('MobileNet model loaded!');

    return model;
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
