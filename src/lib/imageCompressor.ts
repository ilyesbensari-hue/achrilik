import imageCompression from 'browser-image-compression';

export interface CompressionOptions {
    maxSizeMB?: number;        // Taille max finale (défaut: 0.5 MB)
    maxWidthOrHeight?: number; // Dimension max (défaut: 1920px)
    useWebWorker?: boolean;    // Multi-thread (défaut: true)
    quality?: number;          // Qualité 0-1 (défaut: 0.8)
}

/**
 * Compresse une image côté client avant upload
 * Réduit la taille de 90% en moyenne (5 MB → 500 KB)
 */
export async function compressImage(
    file: File,
    options: CompressionOptions = {}
): Promise<File> {
    const defaultOptions = {
        maxSizeMB: 0.5,              // 500 KB max
        maxWidthOrHeight: 1920,      // 1920px max (Full HD suffisant)
        useWebWorker: true,          // Utiliser worker pour ne pas bloquer UI
        quality: 0.8,                // 80% qualité (bon compromis)
        fileType: 'image/jpeg',      // Convertir en JPEG (meilleure compression)
        ...options
    };

    try {
        const compressedFile = await imageCompression(file, defaultOptions);

        console.log('✅ Image compressée:', {
            original: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
            compressed: `${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`,
            reduction: `${((1 - compressedFile.size / file.size) * 100).toFixed(0)}%`
        });

        return compressedFile;
    } catch (error) {
        console.error('❌ Erreur compression image:', error);
        // Retourner fichier original si échec
        return file;
    }
}

/**
 * Compresse plusieurs images en parallèle avec callback de progression
 */
export async function compressMultipleImages(
    files: File[],
    options?: CompressionOptions,
    onProgress?: (current: number, total: number, currentFile: string) => void
): Promise<File[]> {
    const compressed: File[] = [];

    for (let i = 0; i < files.length; i++) {
        const file = files[i];

        if (onProgress) {
            onProgress(i + 1, files.length, file.name);
        }

        const compressedFile = await compressImage(file, options);
        compressed.push(compressedFile);
    }

    return compressed;
}

/**
 * Détecte la vitesse de connexion et retourne options adaptatives
 */
export function getAdaptiveCompressionOptions(): CompressionOptions {
    // Détection vitesse connexion (Network Information API)
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    const speed = connection?.downlink || 5; // Mbps (défaut: 5 si non supporté)

    // Détection mobile
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (speed < 2 || isMobile) {
        // Connexion très lente ou mobile → Compression max
        return {
            maxSizeMB: 0.3,
            maxWidthOrHeight: 1280,
            quality: 0.7
        };
    } else if (speed < 5) {
        // Connexion moyenne → Compression standard
        return {
            maxSizeMB: 0.5,
            maxWidthOrHeight: 1920,
            quality: 0.8
        };
    } else {
        // Connexion rapide → Compression légère
        return {
            maxSizeMB: 1,
            maxWidthOrHeight: 1920,
            quality: 0.9
        };
    }
}
