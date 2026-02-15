'use client';

import { useState } from 'react';
import Image from 'next/image';
import Lightbox from 'yet-another-react-lightbox';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import 'yet-another-react-lightbox/styles.css';

interface ProductImageGalleryProps {
    images: string[]; // Array of image URLs
    productTitle: string;
}

export default function ProductImageGallery({ images, productTitle }: ProductImageGalleryProps) {
    const [selectedImage, setSelectedImage] = useState(0);
    const [lightboxOpen, setLightboxOpen] = useState(false);

    // Transform images to lightbox slides format
    const slides = images.map(img => ({ src: img }));

    return (
        <div className="space-y-4">
            {/* Main Image - Clickable to open lightbox */}
            <div
                className="aspect-square bg-gray-100 rounded-2xl overflow-hidden cursor-zoom-in group relative"
                onClick={() => {
                    setLightboxOpen(true);
                }}
            >
                <Image
                    src={images[selectedImage]}
                    alt={productTitle}
                    width={800}
                    height={800}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    priority
                />

                {/* Zoom hint overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full font-bold text-gray-900 shadow-lg">
                        🔍 Cliquez pour zoomer
                    </div>
                </div>
            </div>

            {/* Thumbnail Gallery */}
            {images.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                    {images.map((img, idx) => (
                        <button
                            key={idx}
                            onClick={() => setSelectedImage(idx)}
                            className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${selectedImage === idx
                                ? 'border-[#006233] ring-4 ring-green-200 scale-105'
                                : 'border-gray-200 hover:border-gray-400 hover:scale-105'
                                }`}
                        >
                            <Image
                                src={img}
                                alt={`${productTitle} ${idx + 1}`}
                                width={200}
                                height={200}
                                loading="lazy"
                                className="w-full h-full object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}

            {/* Lightbox Modal */}
            <Lightbox
                open={lightboxOpen}
                close={() => setLightboxOpen(false)}
                index={selectedImage}
                slides={slides}
                plugins={[Zoom]}
                zoom={{
                    maxZoomPixelRatio: 3,
                    scrollToZoom: true,
                }}
                carousel={{
                    finite: images.length <= 1,
                }}
                controller={{
                    closeOnBackdropClick: true,
                }}
                on={{
                    view: ({ index }) => setSelectedImage(index),
                }}
            />
        </div>
    );
}
