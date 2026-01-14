"use client";

import { useState, useRef } from 'react';

interface ImageUploadProps {
    onImagesChange: (urls: string[]) => void;
    maxImages?: number;
    initialImages?: string[];
}

export default function ImageUpload({ onImagesChange, maxImages = 5, initialImages = [] }: ImageUploadProps) {
    const [images, setImages] = useState<string[]>(initialImages);
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const uploadFile = async (file: File): Promise<string | null> => {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                const error = await res.json();
                alert(error.error || 'Erreur upload');
                return null;
            }

            const data = await res.json();
            return data.url;
        } catch (error) {
            console.error('Upload error:', error);
            alert('Erreur lors de l\'upload');
            return null;
        }
    };

    const handleFiles = async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        const remainingSlots = maxImages - images.length;
        if (remainingSlots <= 0) {
            alert(`Maximum ${maxImages} images autorisées`);
            return;
        }

        const filesToUpload = Array.from(files).slice(0, remainingSlots);
        setUploading(true);

        const uploadedUrls: string[] = [];
        for (const file of filesToUpload) {
            const url = await uploadFile(file);
            if (url) uploadedUrls.push(url);
        }

        const newImages = [...images, ...uploadedUrls];
        setImages(newImages);
        onImagesChange(newImages);
        setUploading(false);
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFiles(e.dataTransfer.files);
        }
    };

    const removeImage = (index: number) => {
        const newImages = images.filter((_, i) => i !== index);
        setImages(newImages);
        onImagesChange(newImages);
    };

    return (
        <div className="space-y-4">
            {/* Upload Zone */}
            <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${dragActive
                    ? 'border-[#006233] bg-[#e8f5f0]'
                    : 'border-gray-300 hover:border-gray-400'
                    } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={(e) => handleFiles(e.target.files)}
                    className="hidden"
                />

                <div className="space-y-3">
                    <div className="text-5xl">📸</div>
                    <div>
                        <p className="text-lg font-semibold text-gray-700">
                            {uploading ? 'Upload en cours...' : 'Glissez vos images ici'}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                            ou cliquez pour sélectionner ({images.length}/{maxImages})
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading || images.length >= maxImages}
                        className="btn btn-secondary mt-2"
                    >
                        {uploading ? 'Upload...' : 'Choisir des images'}
                    </button>
                    <p className="text-xs text-gray-400 mt-2">
                        JPEG, PNG, WebP ou GIF • Max 5MB par image
                    </p>
                </div>
            </div>

            {/* Preview Grid */}
            {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {images.map((url, index) => (
                        <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border-2 border-gray-200">
                            <img
                                src={url}
                                alt={`Upload ${index + 1}`}
                                className="w-full h-full object-cover"
                            />
                            <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-lg"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                            {index === 0 && (
                                <div className="absolute bottom-2 left-2 bg-[#006233] text-white text-xs px-2 py-1 rounded">
                                    Photo principale
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
