/**
 * formatPrice — centralized currency formatter for Achrilik
 * Always renders: 6 000 DA  (space-separated thousands, no decimals)
 */
export function formatPrice(amount: number | null | undefined): string {
    if (amount == null || isNaN(amount)) return '— DA';
    return new Intl.NumberFormat('fr-DZ', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount) + ' DA';
}

/** Format discount percentage */
export function formatDiscount(original: number, discounted: number): string {
    if (!original || !discounted || discounted >= original) return '';
    const pct = Math.round(((original - discounted) / original) * 100);
    return `-${pct}%`;
}
