import { useState, useEffect } from 'react';

interface CheckoutFormData {
    // Step 1: Contact
    email: string;
    prenom: string;
    nom: string;
    telephone: string;

    // Step 2: Delivery
    deliveryMethod: 'DELIVERY' | 'PICKUP';
    address: string;
    city: string;
    wilaya: string;
    latitude: number | null;
    longitude: number | null;

    // Step 3: Payment
    paymentMethod: 'CASH' | 'CIB' | 'DAHABIA';
}

interface UseCheckoutFormProps {
    initialUser: any;
    cart: any[];
}

export function useCheckoutForm({ initialUser, cart }: UseCheckoutFormProps) {
    const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initialize form data with user info
    const [formData, setFormData] = useState<CheckoutFormData>(() => {
        const [prenom, ...nomParts] = (initialUser?.name || '').split(' ');

        return {
            // Step 1
            email: initialUser?.email || '',
            prenom: prenom || '',
            nom: nomParts.join(' ') || '',
            telephone: initialUser?.phone || '',

            // Step 2
            deliveryMethod: 'DELIVERY',
            address: initialUser?.address || '',
            city: initialUser?.city || '',
            wilaya: 'Oran',
            latitude: initialUser?.latitude || null,
            longitude: initialUser?.longitude || null,

            // Step 3
            paymentMethod: 'CASH',
        };
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [deliveryFee, setDeliveryFee] = useState(500);
    const [deliveryFeeDetails, setDeliveryFeeDetails] = useState<any>(null);

    // Update single field
    const updateField = (field: keyof CheckoutFormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        // Clear error for this field
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    // Validation Step 1: Contact
    const validateStep1 = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.email) {
            newErrors.email = "L'email est obligatoire";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "L'email n'est pas valide";
        }

        if (!formData.prenom) newErrors.prenom = "Le prénom est obligatoire";
        if (!formData.nom) newErrors.nom = "Le nom est obligatoire";

        if (!formData.telephone) {
            newErrors.telephone = "Le numéro de téléphone est obligatoire";
        } else if (!/^(0)(5|6|7)[0-9]{8}$/.test(formData.telephone)) {
            newErrors.telephone = "Numéro invalide (format: 0XXXXXXXXX)";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Validation Step 2: Delivery
    const validateStep2 = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (formData.deliveryMethod === 'DELIVERY') {
            if (!formData.address) newErrors.address = "L'adresse de livraison est obligatoire";
            if (!formData.city) newErrors.city = "La commune est obligatoire";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Navigation
    const goNext = () => {
        if (currentStep === 1 && validateStep1()) {
            setCurrentStep(2);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (currentStep === 2 && validateStep2()) {
            setCurrentStep(3);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const goBack = () => {
        if (currentStep > 1) {
            setCurrentStep((currentStep - 1) as 1 | 2 | 3);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const goToStep = (step: 1 | 2 | 3) => {
        setCurrentStep(step);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Calculate delivery fee when cart or method changes
    useEffect(() => {
        if (cart.length > 0 && formData.deliveryMethod === 'DELIVERY') {
            fetch('/api/calculate-delivery-fee', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cart,
                    destinationWilaya: 'Oran'
                })
            })
                .then(res => res.json())
                .then(result => {
                    setDeliveryFee(result.totalFee);
                    setDeliveryFeeDetails(result);
                })
                .catch(error => {
                    console.error('Error calculating delivery fee:', error);
                    setDeliveryFee(500); // Fallback
                });
        }
    }, [cart, formData.deliveryMethod]);

    // Submit order
    const submitOrder = async () => {
        setIsSubmitting(true);

        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: initialUser.id,
                    cart,
                    deliveryMethod: formData.deliveryMethod,
                    paymentMethod: formData.paymentMethod,
                    name: `${formData.prenom} ${formData.nom}`.trim(),
                    phone: formData.telephone,
                    email: formData.email,
                    address: formData.address,
                    wilaya: formData.wilaya,
                    city: formData.city,
                    deliveryLatitude: formData.latitude,
                    deliveryLongitude: formData.longitude
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Erreur lors de la commande');
            }

            // Success!
            alert("✅ Commande confirmée avec succès ! Vous allez être redirigé vers vos commandes.");

            // Clear Cart
            localStorage.removeItem('cart');

            // Redirect
            window.location.href = '/profile';

        } catch (error: any) {
            console.error('Submit error:', error);
            alert(error.message || "Une erreur est survenue. Veuillez réessayer.");
            setIsSubmitting(false);
        }
    };

    return {
        currentStep,
        formData,
        errors,
        deliveryFee,
        deliveryFeeDetails,
        isSubmitting,
        updateField,
        validateStep1,
        validateStep2,
        goNext,
        goBack,
        goToStep,
        submitOrder,
    };
}
