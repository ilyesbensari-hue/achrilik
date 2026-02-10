interface CheckoutStepperProps {
    currentStep: 1 | 2 | 3;
}

export default function CheckoutStepper({ currentStep }: CheckoutStepperProps) {
    const steps = [
        { number: 1, label: 'Contact' },
        { number: 2, label: 'Livraison' },
        { number: 3, label: 'Confirmation' },
    ];

    return (
        <div className="flex items-center justify-between mb-8 px-4">
            {steps.map((step, index) => (
                <div key={step.number} className="flex items-center flex-1">
                    {/* Step Circle */}
                    <div className="flex flex-col items-center">
                        <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${step.number <= currentStep
                                    ? 'bg-[#006233] text-white shadow-lg scale-110'
                                    : 'bg-gray-200 text-gray-500'
                                }`}
                        >
                            {step.number < currentStep ? '✓' : step.number}
                        </div>
                        <span
                            className={`text-xs mt-2 font-semibold transition-colors ${step.number === currentStep
                                    ? 'text-[#006233]'
                                    : step.number < currentStep
                                        ? 'text-gray-600'
                                        : 'text-gray-400'
                                }`}
                        >
                            {step.label}
                        </span>
                    </div>

                    {/* Connector Line */}
                    {index < steps.length - 1 && (
                        <div
                            className={`h-1 flex-1 mx-2 rounded transition-all ${step.number < currentStep
                                    ? 'bg-[#006233]'
                                    : 'bg-gray-200'
                                }`}
                        />
                    )}
                </div>
            ))}
        </div>
    );
}
