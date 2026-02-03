'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';

interface LogoProps {
    className?: string;
    width?: number;
    height?: number;
    showText?: boolean; // For future use if splittable
}

export default function Logo({ className = '', width = 120, height = 40 }: LogoProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <div
            className={`relative group flex items-center justify-center select-none cursor-pointer ${className}`}
            style={{
                perspective: '1000px'
            }}
        >
            {/* Main Logo Container with Levitation */}
            <div
                className={`relative transition-all duration-500 ease-out transform ${mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
                style={{
                    animation: 'logo-float 6s ease-in-out infinite'
                }}
            >
                {/* Glow Effect behind logo (subtle) */}
                <div
                    className="absolute inset-0 bg-green-500/0 blur-2xl rounded-full group-hover:bg-green-500/10 transition-colors duration-700"
                    style={{
                        transform: 'scale(0.8)',
                    }}
                />

                {/* The Logo Image - With subtle border for visibility */}
                <div className="relative z-10 transition-transform duration-300 group-hover:scale-105 group-active:scale-95 bg-white rounded-lg p-1 border border-gray-100 shadow-sm">
                    <Image
                        src="/logo-achrilik.png"
                        alt="Achrilik - اشريليك"
                        width={width}
                        height={height}
                        className="object-contain transition-all duration-300"
                        priority
                    />

                    {/* Shimmer Overlay (Masked to image bounds roughly via overflow-hidden on parent if possible, but here we just use a gleam on top) */}
                    {/* Since it's a transparent PNG, a simpler approach for "shine" is a white radial gradient passing over */}
                    <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-700"
                        style={{
                            background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.4) 45%, rgba(255,255,255,0.0) 50%, transparent 54%)',
                            backgroundSize: '200% 100%',
                            animation: 'logo-shine-slide 3s infinite'
                        }}
                    />
                </div>
            </div>

            {/* Inline Styles for Keyframes */}
            <style jsx global>{`
                @keyframes logo-float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-4px); }
                }
                @keyframes logo-shine-slide {
                    0% { background-position: 100% 0; }
                    100% { background-position: -100% 0; }
                }
            `}</style>
        </div>
    );
}
