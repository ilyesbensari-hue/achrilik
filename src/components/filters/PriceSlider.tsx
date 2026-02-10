'use client';

import { useState } from 'react';

interface PriceSliderProps {
    value: [number, number];
    min?: number;
    max?: number;
    step?: number;
    onChange: (range: [number, number]) => void;
}

export default function PriceSlider({
    value,
    min = 0,
    max = 50000,
    step = 100,
    onChange
}: PriceSliderProps) {
    const [localValue, setLocalValue] = useState(value);

    const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newMin = Math.min(parseInt(e.target.value), localValue[1] - step);
        const newRange: [number, number] = [newMin, localValue[1]];
        setLocalValue(newRange);
        onChange(newRange);
    };

    const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newMax = Math.max(parseInt(e.target.value), localValue[0] + step);
        const newRange: [number, number] = [localValue[0], newMax];
        setLocalValue(newRange);
        onChange(newRange);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-gray-700">💰 Prix</h4>
                <div className="text-sm font-semibold text-[#006233]">
                    {localValue[0].toLocaleString()} - {localValue[1].toLocaleString()} DA
                </div>
            </div>

            {/* Dual Range Slider */}
            <div className="relative h-2 bg-gray-200 rounded-full">
                {/* Active range highlight */}
                <div
                    className="absolute h-full bg-[#006233] rounded-full"
                    style={{
                        left: `${(localValue[0] / max) * 100}%`,
                        right: `${100 - (localValue[1] / max) * 100}%`,
                    }}
                />

                {/* Min slider */}
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={localValue[0]}
                    onChange={handleMinChange}
                    className="absolute w-full h-2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#006233] [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg"
                />

                {/* Max slider */}
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={localValue[1]}
                    onChange={handleMaxChange}
                    className="absolute w-full h-2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#006233] [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg"
                />
            </div>

            {/* Quick presets */}
            <div className="flex gap-2 flex-wrap">
                {[
                    { label: '< 1000 DA', range: [0, 1000] as [number, number] },
                    { label: '1-5K DA', range: [1000, 5000] as [number, number] },
                    { label: '5-15K DA', range: [5000, 15000] as [number, number] },
                    { label: '15K+ DA', range: [15000, max] as [number, number] },
                ].map(preset => (
                    <button
                        key={preset.label}
                        onClick={() => {
                            setLocalValue(preset.range);
                            onChange(preset.range);
                        }}
                        className="text-xs px-3 py-1 rounded-full border border-gray-300 hover:border-[#006233] hover:bg-green-50 transition"
                    >
                        {preset.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
