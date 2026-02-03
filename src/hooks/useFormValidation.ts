import { useState, useEffect } from 'react';
import { ERROR_MESSAGES } from '@/lib/errorMessages';
import { ValidationHelpers } from '@/services/clientPersistence';

interface FieldValidation {
    isValid: boolean;
    error?: {
        type: 'error' | 'warning';
        message: string;
        details?: string;
        suggestions?: string[];
    };
}

/**
 * Hook pour validation de formulaire en temps réel
 */
export function useFormValidation() {
    const [errors, setErrors] = useState<Record<string, any>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    /**
     * Valider email
     */
    const validateEmail = (email: string): FieldValidation => {
        if (!email || email.trim() === '') {
            return {
                isValid: false,
                error: ERROR_MESSAGES.email_required()
            };
        }

        if (!ValidationHelpers.isValidEmail(email)) {
            return {
                isValid: false,
                error: ERROR_MESSAGES.email_invalid(email)
            };
        }

        return { isValid: true };
    };

    /**
     * Valider téléphone
     */
    const validatePhone = (phone: string): FieldValidation => {
        if (!phone || phone.trim() === '') {
            return {
                isValid: false,
                error: ERROR_MESSAGES.phone_required()
            };
        }

        const cleaned = ValidationHelpers.cleanPhone(phone);
        if (!ValidationHelpers.isValidPhone(cleaned)) {
            return {
                isValid: false,
                error: ERROR_MESSAGES.phone_invalid(phone)
            };
        }

        return { isValid: true };
    };

    /**
     * Valider champ requis
     */
    const validateRequired = (value: string, fieldName: string): FieldValidation => {
        if (!value || value.trim() === '') {
            return {
                isValid: false,
                error: {
                    type: 'error',
                    message: `${fieldName} est requis`,
                    suggestions: [`Veuillez renseigner ${fieldName.toLowerCase()}`]
                }
            };
        }

        return { isValid: true };
    };

    /**
     * Valider un champ spécifique
     */
    const validateField = (name: string, value: any): FieldValidation => {
        switch (name) {
            case 'email':
                return validateEmail(value);

            case 'telephone':
            case 'phone':
                return validatePhone(value);

            case 'prenom':
                return validateRequired(value, 'Le prénom');

            case 'nom':
                return validateRequired(value, 'Le nom');

            case 'rue':
            case 'address':
                return validateRequired(value, 'L\'adresse');

            case 'ville':
            case 'city':
                return validateRequired(value, 'La ville');

            case 'code_postal':
            case 'zipcode':
                return validateRequired(value, 'Le code postal');

            case 'wilaya':
                return validateRequired(value, 'La wilaya');

            default:
                return { isValid: true };
        }
    };

    /**
     * Handler pour onBlur
     */
    const handleBlur = (name: string, value: any) => {
        // Marquer comme touché
        setTouched(prev => ({ ...prev, [name]: true }));

        // Valider
        const validation = validateField(name, value);

        if (!validation.isValid && validation.error) {
            setErrors(prev => ({ ...prev, [name]: validation.error }));
        } else {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    /**
     * Handler pour onChange
     */
    const handleChange = (name: string, value: any) => {
        // Si le champ a déjà été touché, valider en temps réel
        if (touched[name]) {
            const validation = validateField(name, value);

            if (!validation.isValid && validation.error) {
                setErrors(prev => ({ ...prev, [name]: validation.error }));
            } else {
                setErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors[name];
                    return newErrors;
                });
            }
        }
    };

    /**
     * Valider tout le formulaire
     */
    const validateAll = (formData: Record<string, any>, requiredFields: string[]): boolean => {
        const newErrors: Record<string, any> = {};
        let isValid = true;

        requiredFields.forEach(field => {
            const validation = validateField(field, formData[field]);
            if (!validation.isValid && validation.error) {
                newErrors[field] = validation.error;
                isValid = false;
            }
        });

        setErrors(newErrors);

        // Marquer tous les champs comme touchés
        const allTouched: Record<string, boolean> = {};
        requiredFields.forEach(field => {
            allTouched[field] = true;
        });
        setTouched(allTouched);

        return isValid;
    };

    /**
     * Réinitialiser validation
     */
    const resetValidation = () => {
        setErrors({});
        setTouched({});
    };

    /**
     * Auto-correction (format téléphone, etc.)
     */
    const autoCorrect = (name: string, value: string): string => {
        if (name === 'telephone' || name === 'phone') {
            const cleaned = ValidationHelpers.cleanPhone(value);
            if (ValidationHelpers.isValidPhone(cleaned)) {
                return ValidationHelpers.formatPhone(cleaned);
            }
        }

        if (name === 'email') {
            return value.trim().toLowerCase();
        }

        if (name === 'prenom' || name === 'nom') {
            // Capitaliser première lettre
            return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
        }

        return value;
    };

    return {
        errors,
        touched,
        validateField,
        validateEmail,
        validatePhone,
        validateRequired,
        validateAll,
        handleBlur,
        handleChange,
        resetValidation,
        autoCorrect,
        hasErrors: Object.keys(errors).length > 0
    };
}
