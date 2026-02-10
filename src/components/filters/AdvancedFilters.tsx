'use client';

import { useState, useEffect } from 'react';
import PriceSlider from './PriceSlider';
import SizeColorFilter from './SizeColorFilter';
import WilayaMultiSelect from './WilayaMultiSelect';
import ToggleFilters from './ToggleFilters';

export interface FilterState {
    priceRange: [number, number];
    sizes: string[];
    colors: string[];
    wilayas: string[];
    freeDelivery: boolean;
    clickAndCollect: boolean;
    minSellerRating: number;
}

interface AdvancedFiltersProps {
    onChange: (filters: FilterState) => void;
    initialFilters?: Partial<FilterState>;
}

const DEFAULT_FILTERS: FilterState = {
    priceRange: [0, 50000],
    sizes: [],
    colors: [],
    wilayas: [],
    freeDelivery: false,
    clickAndCollect: false,
    minSellerRating: 0,
};

export default function AdvancedFilters({ onChange, initialFilters = {} }: AdvancedFiltersProps) {
    const [filters, setFilters] = useState<FilterState>({
        ...DEFAULT_FILTERS,
        ...initialFilters,
    });

    const [activeFiltersCount, setActiveFiltersCount] = useState(0);

    // Count active filters
    useEffect(() => {
        let count = 0;
        if (filters.priceRange[0] > 0 || filters.priceRange[1] < 50000) count++;
        if (filters.sizes.length > 0) count++;
        if (filters.colors.length > 0) count++;
        if (filters.wilayas.length > 0) count++;
        if (filters.freeDelivery) count++;
        if (filters.clickAndCollect) count++;
        if (filters.minSellerRating > 0) count++;
        setActiveFiltersCount(count);
    }, [filters]);

    // Notify parent on filter changes
    useEffect(() => {
        onChange(filters);
    }, [filters, onChange]);

    const handlePriceChange = (range: [number, number]) => {
        setFilters(prev => ({ ...prev, priceRange: range }));
    };

    const handleSizeChange = (sizes: string[]) => {
        setFilters(prev => ({ ...prev, sizes }));
    };

    const handleColorChange = (colors: string[]) => {
        setFilters(prev => ({ ...prev, colors }));
    };

    const handleWilayaChange = (wilayas: string[]) => {
        setFilters(prev => ({ ...prev, wilayas }));
    };

    const handleToggleChange = (key: string, value: boolean | number) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const resetAllFilters = () => {
        setFilters(DEFAULT_FILTERS);
    };

    return (
        <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-sm sticky top-24">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="font-black text-xl text-gray-900 flex items-center gap-2">
                        🎯 Filtres
                    </h3>
                    {activeFiltersCount > 0 && (
                        <span className="bg-[#006233] text-white text-sm font-bold px-3 py-1 rounded-full">
                            {activeFiltersCount}
                        </span>
                    )}
                </div>
                {activeFiltersCount > 0 && (
                    <button
                        onClick={resetAllFilters}
                        className="text-sm text-red-600 hover:text-red-700 font-semibold underline"
                    >
                        ✕ Réinitialiser tous les filtres
                    </button>
                )}
            </div>

            {/* Filter Sections */}
            <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                {/* Price Range */}
                <PriceSlider
                    value={filters.priceRange}
                    onChange={handlePriceChange}
                />

                <div className="border-t border-gray-200 pt-6" />

                {/* Size & Color */}
                <SizeColorFilter
                    selectedSizes={filters.sizes}
                    selectedColors={filters.colors}
                    onSizeChange={handleSizeChange}
                    onColorChange={handleColorChange}
                />

                <div className="border-t border-gray-200 pt-6" />

                {/* Wilayas */}
                <WilayaMultiSelect
                    selected={filters.wilayas}
                    onChange={handleWilayaChange}
                />

                <div className="border-t border-gray-200 pt-6" />

                {/* Toggles */}
                <ToggleFilters
                    freeDelivery={filters.freeDelivery}
                    clickAndCollect={filters.clickAndCollect}
                    minRating={filters.minSellerRating}
                    onChange={handleToggleChange}
                />
            </div>
        </div>
    );
}
