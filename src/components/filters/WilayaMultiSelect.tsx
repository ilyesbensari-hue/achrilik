'use client';

import { useState } from 'react';

interface Wilaya {
    code: string;
    name: string;
}

// 58 wilayas algériennes
const ALGERIAN_WILAYAS: Wilaya[] = [
    { code: '01', name: 'Adrar' },
    { code: '02', name: 'Chlef' },
    { code: '03', name: 'Laghouat' },
    { code: '04', name: 'Oum El Bouaghi' },
    { code: '05', name: 'Batna' },
    { code: '06', name: 'Béjaïa' },
    { code: '07', name: 'Biskra' },
    { code: '08', name: 'Béchar' },
    { code: '09', name: 'Blida' },
    { code: '10', name: 'Bouira' },
    { code: '11', name: 'Tamanrasset' },
    { code: '12', name: 'Tébessa' },
    { code: '13', name: 'Tlemcen' },
    { code: '14', name: 'Tiaret' },
    { code: '15', name: 'Tizi Ouzou' },
    { code: '16', name: 'Alger' },
    { code: '17', name: 'Djelfa' },
    { code: '18', name: 'Jijel' },
    { code: '19', name: 'Sétif' },
    { code: '20', name: 'Saïda' },
    { code: '21', name: 'Skikda' },
    { code: '22', name: 'Sidi Bel Abbès' },
    { code: '23', name: 'Annaba' },
    { code: '24', name: 'Guelma' },
    { code: '25', name: 'Constantine' },
    { code: '26', name: 'Médéa' },
    { code: '27', name: 'Mostaganem' },
    { code: '28', name: "M'Sila" },
    { code: '29', name: 'Mascara' },
    { code: '30', name: 'Ouargla' },
    { code: '31', name: 'Oran' },
    { code: '32', name: 'El Bayadh' },
    { code: '33', name: 'Illizi' },
    { code: '34', name: 'Bordj Bou Arreridj' },
    { code: '35', name: 'Boumerdès' },
    { code: '36', name: 'El Tarf' },
    { code: '37', name: 'Tindouf' },
    { code: '38', name: 'Tissemsilt' },
    { code: '39', name: 'El Oued' },
    { code: '40', name: 'Khenchela' },
    { code: '41', name: 'Souk Ahras' },
    { code: '42', name: 'Tipaza' },
    { code: '43', name: 'Mila' },
    { code: '44', name: 'Aïn Defla' },
    { code: '45', name: 'Naâma' },
    { code: '46', name: 'Aïn Témouchent' },
    { code: '47', name: 'Ghardaïa' },
    { code: '48', name: 'Relizane' },
    { code: '49', name: 'Timimoun' },
    { code: '50', name: 'Bordj Badji Mokhtar' },
    { code: '51', name: 'Ouled Djellal' },
    { code: '52', name: 'Béni Abbès' },
    { code: '53', name: 'In Salah' },
    { code: '54', name: 'In Guezzam' },
    { code: '55', name: 'Touggourt' },
    { code: '56', name: 'Djanet' },
    { code: '57', name: "El M'Ghair" },
    { code: '58', name: 'El Meniaa' },
];

interface WilayaMultiSelectProps {
    selected: string[];
    onChange: (wilayas: string[]) => void;
}

export default function WilayaMultiSelect({ selected, onChange }: WilayaMultiSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredWilayas = ALGERIAN_WILAYAS.filter(w =>
        w.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const toggleWilaya = (wilayaName: string) => {
        if (selected.includes(wilayaName)) {
            onChange(selected.filter(w => w !== wilayaName));
        } else {
            onChange([...selected, wilayaName]);
        }
    };

    const selectAll = () => {
        onChange(ALGERIAN_WILAYAS.map(w => w.name));
    };

    const clearAll = () => {
        onChange([]);
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-gray-700">📍 Wilayas</h4>
                {selected.length > 0 && (
                    <span className="text-xs bg-[#006233] text-white px-2 py-1 rounded-full font-bold">
                        {selected.length}
                    </span>
                )}
            </div>

            {/* Dropdown Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-4 py-3 bg-white border-2 border-gray-300 rounded-lg hover:border-[#006233] transition"
            >
                <span className="text-sm text-gray-700 truncate">
                    {selected.length === 0
                        ? 'Toutes les wilayas'
                        : selected.length === 1
                            ? selected[0]
                            : `${selected.length} wilayas sélectionnées`}
                </span>
                <svg
                    className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <div className="border-2 border-gray-200 rounded-lg bg-white shadow-lg">
                    {/* Search + Actions */}
                    <div className="p-3 border-b border-gray-200 space-y-2">
                        <input
                            type="text"
                            placeholder="Rechercher une wilaya..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006233]"
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={selectAll}
                                className="flex-1 text-xs px-3 py-1.5 bg-green-50 text-[#006233] rounded font-semibold hover:bg-green-100 transition"
                            >
                                Tout sélectionner
                            </button>
                            <button
                                onClick={clearAll}
                                className="flex-1 text-xs px-3 py-1.5 bg-red-50 text-red-600 rounded font-semibold hover:bg-red-100 transition"
                            >
                                Tout déselectionner
                            </button>
                        </div>
                    </div>

                    {/* Wilaya List */}
                    <div className="max-h-64 overflow-y-auto p-2">
                        {filteredWilayas.length === 0 ? (
                            <p className="text-sm text-gray-500 text-center py-4">
                                Aucune wilaya trouvée
                            </p>
                        ) : (
                            <div className="space-y-1">
                                {filteredWilayas.map(wilaya => (
                                    <label
                                        key={wilaya.code}
                                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer transition"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selected.includes(wilaya.name)}
                                            onChange={() => toggleWilaya(wilaya.name)}
                                            className="w-4 h-4 text-[#006233] border-gray-300 rounded focus:ring-[#006233]"
                                        />
                                        <span className="text-sm text-gray-700">
                                            {wilaya.code} - {wilaya.name}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
