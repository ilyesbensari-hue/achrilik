"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { validateCart } from '@/lib/cartLimits';
import { useCheckoutForm } from '@/hooks/useCheckoutForm';
import CheckoutStepper from './components/CheckoutStepper';
import ContactStep from './components/steps/ContactStep';
import DeliveryStep from './components/steps/DeliveryStep';
import ConfirmationStep from './components/steps/ConfirmationStep';
import CartSummary from './components/CartSummary';

interface CheckoutClientProps {
    initialUser: any;
}

export default function CheckoutClient({ initialUser }: CheckoutClientProps) {
    const router = useRouter();
    const [cart, setCart] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [stores, setStores] = useState<any[]>([]);
    const [deliveryFee, setDeliveryFee] = useState(500);
    const [deliveryFeeDetails, setDeliveryFeeDetails] = useState<any>(null);

    // Initialize multi-step checkout hook
    const {
        currentStep,
        formData,
        errors,
        isSubmitting,
        goToNextStep,
        goToPreviousStep,
        goToStep,
        updateFormField,
        submitOrder,
    } = useCheckoutForm({ initialUser, cart });

    // Load cart and stores on mount
    useEffect(() => {
        const storedCart = JSON.parse(localStorage.getItem('cart') || '[]');

        // 🔒 Validate cart limits - Redirect if invalid
        const validationError = validateCart(storedCart);
        if (validationError && storedCart.length > 0) {
            alert(`🚫 ${validationError.message}\n\nVeuillez ajuster votre panier avant de continuer.`);
            router.push('/cart');
            return;
        }

        setCart(storedCart);
        const t = storedCart.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
        setTotal(t);

        // Fetch stores
        fetch('/api/stores/locations')
            .then(res => res.json())
            .then(data => setStores(data))
            .catch(e => console.error(e));
    }, [router]);

    // Recalculate delivery fee when cart or delivery method changes
    useEffect(() => {
        if (cart.length > 0 && formData.deliveryMethod === 'DELIVERY') {
            fetch('/api/calculate-delivery-fee', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cart,
                    destinationWilaya: 'Oran' // Fixed delivery location
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

    // If cart is empty, show empty state
    if (cart.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="bg-white p-12 rounded-3xl shadow-lg text-center max-w-md">
                    <div className="text-8xl mb-6">🛒</div>
                    <h1 className="text-3xl font-black text-gray-900 mb-4">
                        Votre panier est vide
                    </h1>
                    <p className="text-gray-600 mb-8">
                        Ajoutez des articles depuis la boutique pour commencer votre commande.
                    </p>
                    <Link
                        href="/"
                        className="inline-block bg-[#006233] text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-[#00753D] transition-all shadow-lg hover:shadow-xl"
                    >
                        ← Retour à la boutique
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50/30 to-gray-50 py-12 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/cart"
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-semibold text-sm transition-colors mb-4"
                    >
                        ← Retour au panier
                    </Link>
                    <h1 className="text-4xl font-black text-gray-900">
                        🛍️ Finaliser la commande
                    </h1>
                </div>

                {/* Progress Stepper */}
                <div className="mb-12">
                    <CheckoutStepper currentStep={currentStep} />
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Checkout Steps */}
                    <div className="lg:col-span-2">
                        {currentStep === 1 && (
                            <ContactStep
                                data={{
                                    email: formData.email,
                                    prenom: formData.prenom,
                                    nom: formData.nom,
                                    telephone: formData.telephone,
                                }}
                                errors={errors}
                                onChange={updateFormField}
                                onNext={goToNextStep}
                            />
                        )}

                        {currentStep === 2 && (
                            <DeliveryStep
                                data={{
                                    deliveryMethod: formData.deliveryMethod,
                                    address: formData.address,
                                    city: formData.city,
                                    wilaya: formData.wilaya,
                                    latitude: formData.latitude,
                                    longitude: formData.longitude,
                                }}
                                errors={errors}
                                deliveryFee={deliveryFee}
                                deliveryFeeDetails={deliveryFeeDetails}
                                stores={stores}
                                cart={cart}
                                onChange={updateFormField}
                                onBack={goToPreviousStep}
                                onNext={goToNextStep}
                            />
                        )}

                        {currentStep === 3 && (
                            <ConfirmationStep
                                data={{
                                    email: formData.email,
                                    prenom: formData.prenom,
                                    nom: formData.nom,
                                    telephone: formData.telephone,
                                    deliveryMethod: formData.deliveryMethod,
                                    address: formData.address,
                                    city: formData.city,
                                    wilaya: formData.wilaya,
                                    paymentMethod: formData.paymentMethod,
                                }}
                                cart={cart}
                                total={total}
                                deliveryFee={deliveryFee}
                                deliveryFeeDetails={deliveryFeeDetails}
                                isSubmitting={isSubmitting}
                                onBack={goToPreviousStep}
                                onSubmit={submitOrder}
                                onEditContact={() => goToStep(1)}
                                onEditDelivery={() => goToStep(2)}
                                onPaymentChange={(method) => updateFormField('paymentMethod', method)}
                            />
                        )}
                    </div>

                    {/* Right Column: Cart Summary */}
                    <div className="hidden lg:block">
                        <CartSummary
                            cart={cart}
                            total={total}
                            deliveryFee={deliveryFee}
                            deliveryMethod={formData.deliveryMethod}
                            currentStep={currentStep}
                        />
                    </div>
                </div>

                {/* Mobile cart summary (visible only on mobile, bottom of page) */}
                <div className="lg:hidden mt-8">
                    <CartSummary
                        cart={cart}
                        total={total}
                        deliveryFee={deliveryFee}
                        deliveryMethod={formData.deliveryMethod}
                        currentStep={currentStep}
                    />
                </div>
            </div>
        </div>
    );
}
