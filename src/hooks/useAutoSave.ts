import { useEffect, useRef } from 'react';
import { ClientPersistenceService } from '@/services/clientPersistence';

/**
 * Hook pour auto-save toutes les 5 secondes
 * Sauvegarde dans sessionStorage avec expiration 1h
 * 
 * @param formData - Données du formulaire à sauvegarder
 * @param enabled - Activer/désactiver l'auto-save
 * 
 * @example
 * const { loadDraft, clearDraft } = useAutoSave(formData, true);
 * 
 * // Au montage du composant
 * useEffect(() => {
 *   const draft = loadDraft();
 *   if (draft) {
 *     // Proposer restauration
 *   }
 * }, []);
 */
export function useAutoSave(formData: any, enabled: boolean = true) {
    const lastSavedRef = useRef<string>('');
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!enabled) return;

        // Clear timer précédent
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }

        // Auto-save toutes les 5 secondes
        timerRef.current = setInterval(() => {
            const currentData = JSON.stringify(formData);

            // Ne sauvegarder que si changement détecté
            if (currentData !== lastSavedRef.current) {
                if (process.env.NODE_ENV === 'development') {
                    console.log('[AutoSave] Brouillon sauvegardé à', new Date().toLocaleTimeString());
                }
                ClientPersistenceService.saveDraft(formData);
                lastSavedRef.current = currentData;
            }
        }, 5000); // 5 secondes

        // Cleanup au démontage
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [formData, enabled]);

    /**
     * Récupérer brouillon depuis sessionStorage
     * Expire automatiquement après 1 heure
     */
    const loadDraft = (): any | null => {
        return ClientPersistenceService.getDraft();
    };

    /**
     * Nettoyer le brouillon
     */
    const clearDraft = () => {
        ClientPersistenceService.clearDraft();
    };

    return {
        loadDraft,
        clearDraft
    };
}
