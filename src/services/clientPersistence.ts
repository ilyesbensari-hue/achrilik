// Types
export interface ClientAddress {
    id: string;
    type: 'principale' | 'travail' | 'autre';
    destinataire?: string;
    rue: string;
    complement?: string;
    code_postal: string;
    ville: string;
    wilaya: string;
    instructions?: string;
    telephone?: string;
    isDefault: boolean;
}

export interface ClientInfo {
    prenom?: string;
    nom?: string;
    email: string;
    telephone?: string;
    adresses?: ClientAddress[];
    preferences?: {
        tailles_habituelles?: {
            hauts?: string;
            bas?: string;
            chaussures?: string;
        };
        newsletter?: boolean;
        notifications_sms?: boolean;
    };
}

// Storage Keys
const STORAGE_KEYS = {
    EMAIL: 'client_email',
    PHONE: 'client_telephone',
    LAST_ADDRESS: 'client_last_address',
    DRAFT: 'checkout_draft',
    PREFERENCES: 'client_preferences'
} as const;

/**
 * Service de persistance des données client
 * Gère localStorage, sessionStorage et sync avec DB
 */
export class ClientPersistenceService {

    /**
     * Sauvegarder informations client localement (localStorage)
     */
    static saveLocal(data: Partial<ClientInfo>): void {
        try {
            if (data.email) {
                localStorage.setItem(STORAGE_KEYS.EMAIL, data.email);
            }

            if (data.telephone) {
                localStorage.setItem(STORAGE_KEYS.PHONE, data.telephone);
            }

            if (data.adresses && data.adresses.length > 0) {
                const defaultAddr = data.adresses.find(a => a.isDefault) || data.adresses[0];
                localStorage.setItem(STORAGE_KEYS.LAST_ADDRESS, JSON.stringify(defaultAddr));
            }

            if (data.preferences) {
                localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(data.preferences));
            }
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    }

    /**
     * Récupérer informations client depuis localStorage
     */
    static getLocal(): Partial<ClientInfo> | null {
        try {
            const email = localStorage.getItem(STORAGE_KEYS.EMAIL);

            if (!email) return null;

            const telephone = localStorage.getItem(STORAGE_KEYS.PHONE);
            const addressStr = localStorage.getItem(STORAGE_KEYS.LAST_ADDRESS);
            const preferencesStr = localStorage.getItem(STORAGE_KEYS.PREFERENCES);

            return {
                email,
                telephone: telephone || undefined,
                adresses: addressStr ? [JSON.parse(addressStr)] : undefined,
                preferences: preferencesStr ? JSON.parse(preferencesStr) : undefined
            };
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return null;
        }
    }

    /**
     * Sauvegarder brouillon de formulaire (sessionStorage)
     */
    static saveDraft(formData: any): void {
        try {
            sessionStorage.setItem(STORAGE_KEYS.DRAFT, JSON.stringify({
                data: formData,
                timestamp: Date.now()
            }));
        } catch (error) {
            console.error('Error saving draft:', error);
        }
    }

    /**
     * Récupérer brouillon (expire après 1 heure)
     */
    static getDraft(): any | null {
        try {
            const draftStr = sessionStorage.getItem(STORAGE_KEYS.DRAFT);
            if (!draftStr) return null;

            const draft = JSON.parse(draftStr);
            const age = Date.now() - draft.timestamp;

            // Expire après 1 heure
            if (age > 3600000) {
                sessionStorage.removeItem(STORAGE_KEYS.DRAFT);
                return null;
            }

            return draft.data;
        } catch (error) {
            console.error('Error reading draft:', error);
            return null;
        }
    }

    /**
     * Nettoyer brouillon
     */
    static clearDraft(): void {
        try {
            sessionStorage.removeItem(STORAGE_KEYS.DRAFT);
        } catch (error) {
            console.error('Error clearing draft:', error);
        }
    }

    /**
     * Nettoyer toutes les données locales
     */
    static clearAll(): void {
        try {
            Object.values(STORAGE_KEYS).forEach(key => {
                localStorage.removeItem(key);
                sessionStorage.removeItem(key);
            });
        } catch (error) {
            console.error('Error clearing storage:', error);
        }
    }

    /**
     * Sauvegarder en base de données
     */
    static async saveToDatabase(data: ClientInfo): Promise<void> {
        try {
            const response = await fetch('/api/client/save-info', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error saving to database:', error);
            throw error;
        }
    }

    /**
     * Charger depuis base de données
     */
    static async loadFromDatabase(email: string): Promise<ClientInfo | null> {
        try {
            const response = await fetch(`/api/client/info?email=${encodeURIComponent(email)}`);

            if (!response.ok) {
                if (response.status === 404) return null;
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error loading from database:', error);
            return null;
        }
    }
}

/**
 * Helpers de validation
 */
export const ValidationHelpers = {

    isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    isValidPhone(phone: string): boolean {
        // Nettoyer le numéro
        const cleaned = phone.replace(/[\s\-\(\)]/g, '');

        // Formats acceptés:
        // 06XXXXXXXX, 05XXXXXXXX, 07XXXXXXXX (10 chiffres)
        // +213XXXXXXXXX (12 chiffres avec indicatif)
        const phoneRegex = /^(0[567]\d{8}|\+213[567]\d{8})$/;
        return phoneRegex.test(cleaned);
    },

    cleanPhone(phone: string): string {
        // Enlever espaces, tirets, parenthèses
        return phone.replace(/[\s\-\(\)]/g, '');
    },

    formatPhone(phone: string): string {
        const cleaned = this.cleanPhone(phone);

        // Format: 06 XX XX XX XX
        if (cleaned.length === 10 && cleaned.startsWith('0')) {
            return cleaned.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
        }

        // Format: +213 X XX XX XX XX
        if (cleaned.length === 13 && cleaned.startsWith('+213')) {
            return cleaned.replace(/(\+213)(\d)(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5 $6');
        }

        return phone;
    }
};
