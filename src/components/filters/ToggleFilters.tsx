'use client';

interface ToggleFiltersProps {
    freeDelivery: boolean;
    clickAndCollect: boolean;
    minRating: number;
    onChange: (key: string, value: boolean | number) => void;
}

export default function ToggleFilters({
    freeDelivery,
    clickAndCollect,
    minRating,
    onChange,
}: ToggleFiltersProps) {
    return (
        <div className="space-y-4">
            <h4 className="text-sm font-bold text-gray-700">⚙️ Options</h4>

            {/* Free Delivery Toggle */}
            <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                    <input
                        type="checkbox"
                        checked={freeDelivery}
                        onChange={(e) => onChange('freeDelivery', e.target.checked)}
                        className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-green-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#006233]"></div>
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">🚚</span>
                        <span className="text-sm font-semibold text-gray-900 group-hover:text-[#006233] transition">
                            Livraison gratuite uniquement
                        </span>
                    </div>
                </div>
            </label>

            {/* Click & Collect Toggle */}
            <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                    <input
                        type="checkbox"
                        checked={clickAndCollect}
                        onChange={(e) => onChange('clickAndCollect', e.target.checked)}
                        className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-green-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#006233]"></div>
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">🏪</span>
                        <span className="text-sm font-semibold text-gray-900 group-hover:text-[#006233] transition">
                            Click & Collect disponible
                        </span>
                    </div>
                </div>
            </label>

            {/* Min Seller Rating */}
            <div className="pt-2">
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <span className="text-xl">⭐</span>
                    Note vendeur minimale
                </label>
                <select
                    value={minRating}
                    onChange={(e) => onChange('minRating', parseFloat(e.target.value))}
                    className="w-full px-4 py-2.5 text-sm border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006233] focus:border-[#006233] bg-white cursor-pointer hover:border-gray-400 transition"
                >
                    <option value="0">Toutes les notes</option>
                    <option value="2">⭐⭐ 2★ et plus</option>
                    <option value="3">⭐⭐⭐ 3★ et plus</option>
                    <option value="4">⭐⭐⭐⭐ 4★ et plus</option>
                    <option value="4.5">⭐⭐⭐⭐⭐ 4.5★ uniquement</option>
                </select>
            </div>
        </div>
    );
}
