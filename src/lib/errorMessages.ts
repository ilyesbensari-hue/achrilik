export const ERROR_MESSAGES = {
    // ========== PRODUIT - VARIANTES ==========

    size_required: (sizes: string[]) => ({
        type: 'error' as const,
        message: 'Veuillez sélectionner une taille',
        details: 'Tailles disponibles pour ce produit:',
        suggestions: sizes
    }),

    color_required: (colors: string[]) => ({
        type: 'error' as const,
        message: 'Veuillez sélectionner une couleur',
        details: 'Couleurs disponibles pour ce produit:',
        suggestions: colors
    }),

    both_required: (sizes: string[], colors: string[]) => ({
        type: 'error' as const,
        message: 'Pour ajouter cet article au panier, veuillez choisir:',
        details: '',
        suggestions: [
            `Une taille (${sizes.join(', ')})`,
            `Une couleur (${colors.join(', ')})`
        ]
    }),

    variant_out_of_stock: (size: string, color: string, alternatives: string[]) => ({
        type: 'warning' as const,
        message: 'Désolé, cette combinaison n\'est plus disponible',
        details: `Taille ${size} - Couleur ${color} (Rupture de stock)`,
        suggestions: alternatives.length > 0
            ? ['Alternatives disponibles:', ...alternatives]
            : ['Aucune alternative disponible pour le moment']
    }),

    // ========== PRODUIT - STOCK ==========

    stock_insufficient: (requested: number, available: number) => ({
        type: 'warning' as const
        ,
        message: 'Quantité non disponible',
        details: `Vous avez demandé: ${requested} article${requested > 1 ? 's' : ''}\nStock disponible: ${available} article${available > 1 ? 's' : ''}`,
        suggestions: available > 0
            ? [`Voulez-vous ajuster votre quantité à ${available} ?`]
            : ['Ce produit est actuellement en rupture de stock']
    }),

    already_in_cart: (currentQty: number) => ({
        type: 'info' as const,
        message: 'Cet article est déjà dans votre panier',
        details: `Quantité actuelle: ${currentQty}`,
        suggestions: ['Augmenter la quantité (+1)', 'Voir mon panier', 'Continuer mes achats']
    }),

    // ========== FORMULAIRE - EMAIL ==========

    email_invalid: (email: string) => ({
        type: 'error' as const,
        message: 'Format d\'email incorrect',
        details: `Vous avez saisi: "${email}"\nFormat attendu: exemple@gmail.com`,
        suggestions: [
            'Vérifiez qu\'il n\'y a pas d\'espace',
            'Le symbole @ est requis',
            'Un point (.) est nécessaire après le @'
        ]
    }),

    email_required: () => ({
        type: 'error' as const,
        message: 'Adresse email requise',
        details: 'Nous avons besoin de votre email pour suivre votre commande',
        suggestions: ['Format: exemple@email.com']
    }),

    // ========== FORMULAIRE - TÉLÉPHONE ==========

    phone_invalid: (phone: string) => ({
        type: 'error' as const,
        message: 'Numéro de téléphone incorrect',
        details: `Vous avez saisi: "${phone}"\nFormat attendu: 0678123456 (10 chiffres)`,
        suggestions: [
            '06 XX XX XX XX',
            '05 XX XX XX XX',
            '07 XX XX XX XX',
            '+213 6 XX XX XX XX'
        ]
    }),

    phone_required: () => ({
        type: 'error' as const,
        message: 'Numéro de téléphone requis',
        details: 'Le livreur vous contactera sur ce numéro',
        suggestions: ['Format: 06XXXXXXXX (10 chiffres)']
    }),

    // ========== FORMULAIRE - CHAMPS OBLIGATOIRES ==========

    required_fields_missing: (fields: string[]) => ({
        type: 'error' as const,
        message: 'Informations manquantes pour continuer',
        details: 'Champs requis:',
        suggestions: fields.map(f => `${f} requis`)
    }),

    address_required: () => ({
        type: 'error' as const,
        message: 'Adresse de livraison requise',
        details: 'Informations manquantes:',
        suggestions: [
            'Rue et numéro',
            'Code postal',
            'Ville',
            'Wilaya'
        ]
    }),

    // ========== MOT DE PASSE ==========

    password_weak: (missing: string[]) => ({
        type: 'warning' as const,
        message: 'Mot de passe non sécurisé',
        details: 'Votre mot de passe doit contenir:',
        suggestions: [
            missing.includes('length') ? '❌ Au moins 8 caractères' : '✅ Au moins 8 caractères',
            missing.includes('uppercase') ? '❌ Au moins 1 lettre majuscule (A-Z)' : '✅ Au moins 1 lettre majuscule',
            missing.includes('number') ? '❌ Au moins 1 chiffre (0-9)' : '✅ Au moins 1 chiffre',
            missing.includes('special') ? '❌ Au moins 1 caractère spécial (!@#$%...)' : '✅ Au moins 1 caractère spécial'
        ]
    }),

    // ========== PAIEMENT ==========

    payment_failed: (reason: string) => ({
        type: 'error' as const,
        message: 'Paiement refusé',
        details: `Raison: ${reason}`,
        suggestions: [
            'Vérifiez le solde de votre compte',
            'Utilisez une autre carte bancaire',
            'Choisissez le paiement à la livraison'
        ]
    }),

    payment_timeout: () => ({
        type: 'warning' as const,
        message: 'Le paiement a expiré',
        details: 'Vous avez dépassé le temps imparti',
        suggestions: [
            'Veuillez recommencer le processus de paiement',
            'Votre panier a été sauvegardé'
        ]
    }),

    // ========== LIVRAISON ==========

    delivery_zone_unavailable: (wilaya: string, available: string[]) => ({
        type: 'warning' as const,
        message: 'Livraison non disponible dans votre zone',
        details: `Adresse saisie: ${wilaya}`,
        suggestions: [
            'Zones de livraison actuelles:',
            ...available,
            '',
            '📧 Contactez-nous pour une livraison spéciale:',
            'WhatsApp: +213 XXX XXX XXX',
            'Email: support@achrilik.com'
        ]
    }),

    delivery_address_incomplete: (missing: string[]) => ({
        type: 'error' as const,
        message: 'Adresse de livraison incomplète',
        details: 'Informations manquantes:',
        suggestions: missing
    }),

    // ========== GÉNÉRAL ==========

    network_error: () => ({
        type: 'error' as const,
        message: 'Erreur de connexion',
        details: 'Impossible de se connecter au serveur',
        suggestions: [
            'Vérifiez votre connexion Internet',
            'Réessayez dans quelques instants',
            'Si le problème persiste, contactez le support'
        ]
    }),

    server_error: () => ({
        type: 'error' as const,
        message: 'Erreur serveur (500)',
        details: 'Une erreur inattendue s\'est produite',
        suggestions: [
            'Veuillez réessayer dans quelques instants',
            'Si le problème persiste, contactez le support'
        ]
    }),

    not_found: (resource: string) => ({
        type: 'error' as const,
        message: `${resource} introuvable`,
        details: 'La ressource demandée n\'existe pas ou a été supprimée',
        suggestions: [
            'Vérifiez l\'URL',
            'Retournez à l\'accueil',
            'Utilisez la recherche pour trouver ce que vous cherchez'
        ]
    })
};

// Helper pour créer des messages personnalisés
export function createCustomError(
    type: 'error' | 'warning' | 'info' | 'success',
    message: string,
    details?: string,
    suggestions?: string[]
) {
    return { type, message, details, suggestions };
}
