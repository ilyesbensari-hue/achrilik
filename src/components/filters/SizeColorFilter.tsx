'use client';

interface SizeColorFilterProps {
    selectedSizes: string[];
    selectedColors: string[];
    availableSizes?: string[];
    availableColors?: string[];
    onSizeChange: (sizes: string[]) => void;
    onColorChange: (colors: string[]) => void;
}

const DEFAULT_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '36', '38', '40', '42', '44', '46'];
const DEFAULT_COLORS = [
    { name: 'Noir', value: 'black', hex: '#000000' },
    { name: 'Blanc', value: 'white', hex: '#FFFFFF' },
    { name: 'Rouge', value: 'red', hex: '#EF4444' },
    { name: 'Bleu', value: 'blue', hex: '#3B82F6' },
    { name: 'Vert', value: 'green', hex: '#10B981' },
    { name: 'Jaune', value: 'yellow', hex: '#FBBF24' },
    { name: 'Rose', value: 'pink', hex: '#EC4899' },
    { name: 'Gris', value: 'gray', hex: '#6B7280' },
    { name: 'Marron', value: 'brown', hex: '#92400E' },
    { name: 'Beige', value: 'beige', hex: '#D4A574' },
];

export default function SizeColorFilter({
    selectedSizes,
    selectedColors,
    availableSizes = DEFAULT_SIZES,
    availableColors = DEFAULT_COLORS.map(c => c.value),
    onSizeChange,
    onColorChange,
}: SizeColorFilterProps) {
    const toggleSize = (size: string) => {
        if (selectedSizes.includes(size)) {
            onSizeChange(selectedSizes.filter(s => s !== size));
        } else {
            onSizeChange([...selectedSizes, size]);
        }
    };

    const toggleColor = (color: string) => {
        if (selectedColors.includes(color)) {
            onColorChange(selectedColors.filter(c => c !== color));
        } else {
            onColorChange([...selectedColors, color]);
        }
    };

    const displayColors = DEFAULT_COLORS.filter(c => availableColors.includes(c.value));

    return (
        <div className="space-y-6">
            {/* Sizes */}
            <div>
                <h4 className="text-sm font-bold text-gray-700 mb-3">📏 Tailles</h4>
                <div className="flex flex-wrap gap-2">
                    {availableSizes.map(size => (
                        <button
                            key={size}
                            onClick={() => toggleSize(size)}
                            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${selectedSizes.includes(size)
                                    ? 'bg-[#006233] text-white shadow-md scale-105'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {size}
                        </button>
                    ))}
                </div>
                {selectedSizes.length > 0 && (
                    <button
                        onClick={() => onSizeChange([])}
                        className="text-xs text-red-600 hover:text-red-700 font-semibold mt-2"
                    >
                        ✕ Effacer la sélection
                    </button>
                )}
            </div>

            {/* Colors */}
            <div>
                <h4 className="text-sm font-bold text-gray-700 mb-3">🎨 Couleurs</h4>
                <div className="flex flex-wrap gap-3">
                    {displayColors.map(color => (
                        <button
                            key={color.value}
                            onClick={() => toggleColor(color.value)}
                            className={`group relative flex flex-col items-center gap-1 transition-transform ${selectedColors.includes(color.value) ? 'scale-110' : 'hover:scale-105'
                                }`}
                            title={color.name}
                        >
                            <div
                                className={`w-10 h-10 rounded-full border-2 transition-all ${selectedColors.includes(color.value)
                                        ? 'border-[#006233] ring-4 ring-green-200'
                                        : 'border-gray-300 group-hover:border-gray-500'
                                    }`}
                                style={{
                                    backgroundColor: color.hex,
                                    boxShadow: color.value === 'white' ? 'inset 0 0 0 1px #e5e7eb' : undefined
                                }}
                            >
                                {selectedColors.includes(color.value) && (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <svg className="w-5 h-5 text-white drop-shadow" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                            <span className="text-xs text-gray-600 font-medium">{color.name}</span>
                        </button>
                    ))}
                </div>
                {selectedColors.length > 0 && (
                    <button
                        onClick={() => onColorChange([])}
                        className="text-xs text-red-600 hover:text-red-700 font-semibold mt-2"
                    >
                        ✕ Effacer la sélection
                    </button>
                )}
            </div>
        </div>
    );
}
