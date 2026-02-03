interface ErrorMessageProps {
    type: 'error' | 'warning' | 'info' | 'success';
    message: string;
    details?: string;
    suggestions?: string[];
    actions?: Array<{
        label: string;
        onClick: () => void;
        variant?: 'primary' | 'secondary';
    }>;
    className?: string;
}

export function ErrorMessage({
    type,
    message,
    details,
    suggestions,
    actions,
    className = ''
}: ErrorMessageProps) {
    const config = {
        error: {
            icon: '❌',
            bgColor: 'bg-red-50',
            borderColor: 'border-red-200',
            textColor: 'text-red-800',
            iconColor: 'text-red-500'
        },
        warning: {
            icon: '⚠️',
            bgColor: 'bg-amber-50',
            borderColor: 'border-amber-200',
            textColor: 'text-amber-800',
            iconColor: 'text-amber-500'
        },
        info: {
            icon: 'ℹ️',
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-200',
            textColor: 'text-blue-800',
            iconColor: 'text-blue-500'
        },
        success: {
            icon: '✅',
            bgColor: 'bg-green-50',
            borderColor: 'border-green-200',
            textColor: 'text-green-800',
            iconColor: 'text-green-500'
        }
    };

    const styles = config[type];

    return (
        <div
            className={`
        ${styles.bgColor} ${styles.borderColor} ${styles.textColor}
        border rounded-lg p-4 mb-4 flex gap-3
        ${className}
      `}
            role="alert"
        >
            {/* Icon */}
            <div className={`text-2xl flex-shrink-0 ${styles.iconColor}`}>
                {styles.icon}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                {/* Main Message */}
                <p className="font-semibold mb-1 text-sm md:text-base">
                    {message}
                </p>

                {/* Details */}
                {details && (
                    <p className="text-sm opacity-90 whitespace-pre-line mb-2">
                        {details}
                    </p>
                )}

                {/* Suggestions List */}
                {suggestions && suggestions.length > 0 && (
                    <ul className="list-disc list-inside space-y-1 text-sm mt-2">
                        {suggestions.map((suggestion, index) => (
                            <li key={index} className="opacity-90">
                                {suggestion}
                            </li>
                        ))}
                    </ul>
                )}

                {/* Action Buttons */}
                {actions && actions.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                        {actions.map((action, index) => (
                            <button
                                key={index}
                                onClick={action.onClick}
                                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${action.variant === 'primary'
                                        ? 'bg-[#C62828] text-white hover:bg-[#B71C1C]'
                                        : 'bg-white border border-gray-300 hover:bg-gray-50'
                                    }
                `}
                            >
                                {action.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
