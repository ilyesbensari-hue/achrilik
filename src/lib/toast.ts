// Helper function to show toast notifications
export function showToast(
    message: string,
    type: 'success' | 'error' | 'info' = 'success',
    action?: { label: string; onClick: () => void }
) {
    const event = new CustomEvent('show-toast', {
        detail: { message, type, action }
    });
    window.dispatchEvent(event);
}
