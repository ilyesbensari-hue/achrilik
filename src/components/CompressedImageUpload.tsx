'use client';

import { useState } from 'react';
import { compressMultipleImages, getAdaptiveCompressionOptions } from '@/lib/imageCompressor';

interface Props {
    onImagesCompressed: (files: File[]) => void;
    maxFiles?: number;
    accept?: string;
    disabled?: boolean;
}

export default function CompressedImageUpload({
    onImagesCompressed,
    maxFiles = 10,
    accept = 'image/*',
    disabled = false
}: Props) {
    const [compressing, setCompressing] = useState(false);
    const [progress, setProgress] = useState({ current: 0, total: 0, fileName: '' });
    const [stats, setStats] = useState<{ originalSize: number; compressedSize: number } | null>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || []);

        if (selectedFiles.length === 0) return;

        if (selectedFiles.length > maxFiles) {
            alert(`Maximum ${maxFiles} images autorisées`);
            e.target.value = ''; // Reset input
            return;
        }

        setCompressing(true);
        setStats(null);

        try {
            // Calculer taille originale
            const originalSize = selectedFiles.reduce((sum, f) => sum + f.size, 0);

            // Compresser avec options adaptatives
            const compressionOptions = getAdaptiveCompressionOptions();

            const compressed = await compressMultipleImages(
                selectedFiles,
                compressionOptions,
                (current, total, fileName) => {
                    setProgress({ current, total, fileName });
                }
            );

            // Calculer taille compressée
            const compressedSize = compressed.reduce((sum, f) => sum + f.size, 0);

            setStats({ originalSize, compressedSize });
            onImagesCompressed(compressed);

            // Reset input pour permettre re-sélection du même fichier
            e.target.value = '';
        } catch (error) {
            console.error('Erreur compression:', error);
            alert('Erreur lors de la compression des images');
        } finally {
            setCompressing(false);
            setProgress({ current: 0, total: 0, fileName: '' });
        }
    };

    const formatBytes = (bytes: number): string => {
        return (bytes / 1024 / 1024).toFixed(2);
    };

    const calculateReduction = (): number => {
        if (!stats) return 0;
        return ((1 - stats.compressedSize / stats.originalSize) * 100);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-center w-full">
                <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${compressing || disabled
                        ? 'bg-gray-100 border-gray-300 cursor-not-allowed'
                        : 'bg-gray-50 border-gray-300 hover:bg-gray-100 hover:border-violet-500'
                    }`}>
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        {compressing ? (
                            <>
                                <svg className="w-10 h-10 mb-3 text-violet-500 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <p className="text-sm text-gray-600">Compression...</p>
                            </>
                        ) : (
                            <>
                                <svg className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                <p className="mb-2 text-sm text-gray-500">
                                    <span className="font-semibold">Cliquez pour upload</span> ou glissez-déposez
                                </p>
                                <p className="text-xs text-gray-500">PNG, JPG, WEBP (max {maxFiles} images)</p>
                            </>
                        )}
                    </div>
                    <input
                        type="file"
                        className="hidden"
                        accept={accept}
                        multiple
                        onChange={handleFileChange}
                        disabled={compressing || disabled}
                    />
                </label>
            </div>

            {compressing && (
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                            {progress.fileName.length > 30
                                ? `...${progress.fileName.slice(-27)}`
                                : progress.fileName}
                        </span>
                        <span className="font-semibold text-violet-600">
                            {progress.current}/{progress.total}
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-violet-600 h-2 rounded-full transition-all duration-300"
                            style={{
                                width: `${(progress.current / progress.total) * 100}%`
                            }}
                        />
                    </div>
                </div>
            )}

            {stats && !compressing && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between text-sm">
                        <div>
                            <p className="text-gray-600">Taille originale</p>
                            <p className="font-semibold text-gray-900">{formatBytes(stats.originalSize)} MB</p>
                        </div>
                        <div className="text-center">
                            <p className="text-gray-600">Réduction</p>
                            <p className="font-bold text-green-600 text-lg">-{calculateReduction().toFixed(0)}%</p>
                        </div>
                        <div className="text-right">
                            <p className="text-gray-600">Taille compressée</p>
                            <p className="font-semibold text-green-700">{formatBytes(stats.compressedSize)} MB</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
