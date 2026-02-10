interface ContactStepProps {
    data: {
        email: string;
        prenom: string;
        nom: string;
        telephone: string;
    };
    errors: Record<string, string>;
    onChange: (field: string, value: string) => void;
    onNext: () => void;
}

export default function ContactStep({ data, errors, onChange, onNext }: ContactStepProps) {
    const hasErrors = Object.keys(errors).length > 0;
    const isComplete = data.email && data.prenom && data.nom && data.telephone;

    return (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 animate-fade-in">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    👤 Informations de contact
                </h2>
                <p className="text-gray-600 text-sm">
                    Ces informations seront utilisées pour vous contacter concernant votre commande
                </p>
            </div>

            <div className="space-y-5">
                {/* Email */}
                <div>
                    <label className="text-sm font-bold text-gray-700 mb-2 block">
                        Email <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="email"
                        name="email"
                        value={data.email}
                        onChange={(e) => onChange('email', e.target.value)}
                        placeholder="exemple@email.com"
                        className={`w-full px-4 py-3 rounded-lg border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-[#006233]/20 ${errors.email
                                ? 'border-red-500 bg-red-50'
                                : 'border-gray-200 focus:border-[#006233]'
                            }`}
                        data-has-error={!!errors.email}
                    />
                    {errors.email && (
                        <p className="text-red-600 text-sm mt-2 flex items-center gap-1.5">
                            <span>⚠️</span> {errors.email}
                        </p>
                    )}
                </div>

                {/* Prénom & Nom */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label className="text-sm font-bold text-gray-700 mb-2 block">
                            Prénom <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="prenom"
                            value={data.prenom}
                            onChange={(e) => onChange('prenom', e.target.value)}
                            placeholder="Ahmed"
                            className={`w-full px-4 py-3 rounded-lg border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-[#006233]/20 ${errors.prenom
                                    ? 'border-red-500 bg-red-50'
                                    : 'border-gray-200 focus:border-[#006233]'
                                }`}
                            data-has-error={!!errors.prenom}
                        />
                        {errors.prenom && (
                            <p className="text-red-600 text-sm mt-2 flex items-center gap-1.5">
                                <span>⚠️</span> {errors.prenom}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="text-sm font-bold text-gray-700 mb-2 block">
                            Nom <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="nom"
                            value={data.nom}
                            onChange={(e) => onChange('nom', e.target.value)}
                            placeholder="Benali"
                            className={`w-full px-4 py-3 rounded-lg border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-[#006233]/20 ${errors.nom
                                    ? 'border-red-500 bg-red-50'
                                    : 'border-gray-200 focus:border-[#006233]'
                                }`}
                            data-has-error={!!errors.nom}
                        />
                        {errors.nom && (
                            <p className="text-red-600 text-sm mt-2 flex items-center gap-1.5">
                                <span>⚠️</span> {errors.nom}
                            </p>
                        )}
                    </div>
                </div>

                {/* Téléphone */}
                <div>
                    <label className="text-sm font-bold text-gray-700 mb-2 block">
                        Numéro de téléphone <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                            🇩🇿
                        </span>
                        <input
                            type="tel"
                            name="telephone"
                            value={data.telephone}
                            onChange={(e) => onChange('telephone', e.target.value)}
                            placeholder="0661234567"
                            className={`w-full pl-12 pr-4 py-3 rounded-lg border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-[#006233]/20 ${errors.telephone
                                    ? 'border-red-500 bg-red-50'
                                    : 'border-gray-200 focus:border-[#006233]'
                                }`}
                            data-has-error={!!errors.telephone}
                        />
                    </div>
                    {errors.telephone ? (
                        <p className="text-red-600 text-sm mt-2 flex items-center gap-1.5">
                            <span>⚠️</span> {errors.telephone}
                        </p>
                    ) : (
                        <p className="text-gray-500 text-xs mt-2">
                            Format: 0XXXXXXXXX (ex: 0661234567)
                        </p>
                    )}
                </div>
            </div>

            {/* Info Box */}
            <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <span className="text-xl flex-shrink-0">🔒</span>
                    <div>
                        <p className="text-sm font-semibold text-green-900 mb-1">
                            Vos informations sont sécurisées
                        </p>
                        <p className="text-xs text-green-700">
                            Nous utilisons ces informations uniquement pour traiter votre commande.
                            Aucune donnée ne sera partagée avec des tiers.
                        </p>
                    </div>
                </div>
            </div>

            {/* Next Button */}
            <div className="mt-8 flex justify-end">
                <button
                    onClick={onNext}
                    disabled={!isComplete}
                    className={`px-8 py-4 rounded-xl font-bold text-lg transition-all flex items-center gap-2 ${isComplete
                            ? 'bg-[#006233] text-white hover:bg-[#00753D] shadow-lg hover:shadow-xl'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                >
                    Continuer
                    <span className="text-xl">→</span>
                </button>
            </div>

            {/* Error Summary */}
            {hasErrors && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm font-semibold text-red-900 mb-1">
                        ⚠️ Veuillez corriger les erreurs ci-dessus
                    </p>
                    <p className="text-xs text-red-700">
                        {Object.keys(errors).length} champ{Object.keys(errors).length > 1 ? 's' : ''} nécessite{Object.keys(errors).length > 1 ? 'nt' : ''} votre attention
                    </p>
                </div>
            )}
        </div>
    );
}
