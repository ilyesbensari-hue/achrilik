import { useState, useEffect } from 'react';
import {
    ClientInfo,
    ClientPersistenceService
} from '@/services/clientPersistence';

/**
 * Hook pour gérer les informations client
 * - Charge depuis DB si connecté
 * - Sinon charge depuis localStorage
 * - Sauvegarde automatique
 * - Gestion du brouillon
 */
export function useClientInfo() {
    const [clientInfo, setClientInfo] = useState<ClientInfo | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Charger les informations au montage
    useEffect(() => {
        loadClientInfo();
    }, []);

    /**
     * Charger informations client
     * 1. Vérifier si utilisateur connecté → charger depuis DB
     * 2. Sinon vérifier localStorage
     */
    const loadClientInfo = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // 1. Vérifier si utilisateur connecté
            const user = await getCurrentUser();

            if (user && user.email) {
                // Charger depuis DB
                const dbInfo = await ClientPersistenceService.loadFromDatabase(user.email);
                if (dbInfo) {
                    setClientInfo(dbInfo);
                    // Sync avec localStorage pour accès rapide
                    ClientPersistenceService.saveLocal(dbInfo);
                    setIsLoading(false);
                    return;
                }
            }

            // 2. Sinon, charger depuis localStorage
            const localInfo = ClientPersistenceService.getLocal();

            if (localInfo && localInfo.email) {
                // Essayer de charger version complète depuis DB
                const dbInfo = await ClientPersistenceService.loadFromDatabase(localInfo.email);
                setClientInfo(dbInfo || localInfo as ClientInfo);
            }

            setIsLoading(false);
        } catch (err) {
            console.error('Error loading client info:', err);
            setError('Erreur lors du chargement des informations');
            setIsLoading(false);
        }
    };

    /**
     * Sauvegarder informations client
     */
    const saveClientInfo = async (data: Partial<ClientInfo>) => {
        try {
            setError(null);

            // Sauvegarder localement immédiatement
            ClientPersistenceService.saveLocal(data);

            // Mettre à jour l'état
            setClientInfo(prev => ({ ...prev, ...data } as ClientInfo));

            // Si utilisateur connecté, sauvegarder en DB
            const user = await getCurrentUser();
            if (user && data.email) {
                await ClientPersistenceService.saveToDatabase(data as ClientInfo);
            }

            return true;
        } catch (err) {
            console.error('Error saving client info:', err);
            setError('Erreur lors de la sauvegarde');
            throw err;
        }
    };

    /**
     * Nettoyer toutes les données
     */
    const clearClientInfo = () => {
        ClientPersistenceService.clearAll();
        setClientInfo(null);
    };

    return {
        clientInfo,
        isLoading,
        error,
        saveClientInfo,
        reloadClientInfo: loadClientInfo,
        clearClientInfo
    };
}

/**
 * Helper pour obtenir l'utilisateur connecté
 */
async function getCurrentUser(): Promise<{ email: string } | null> {
    try {
        const response = await fetch('/api/auth/me');
        if (!response.ok) return null;

        const data = await response.json();

        // Format de réponse: { user: { email, name, id, ... } }
        if (data.user && data.user.email) {
            return { email: data.user.email };
        }

        return null;
    } catch (error) {
        console.error('Error getting current user:', error);
        return null;
    }
}

