import posthog from 'posthog-js'

// Unified analytics tracking - sends to both Posthog and Google Analytics
export const trackEvent = (event: string, properties?: Record<string, any>) => {
    // Posthog
    if (typeof window !== 'undefined' && posthog) {
        posthog.capture(event, properties)
    }

    // Google Analytics
    if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', event, properties)
    }
}

// E-commerce specific events
export const trackProductView = (productId: string, productName: string, price: number, category?: string) => {
    trackEvent('view_item', {
        productId,
        productName,
        price,
        category,
    })
}

export const trackAddToCart = (productId: string, productName: string, price: number, quantity: number = 1) => {
    trackEvent('add_to_cart', {
        productId,
        productName,
        price,
        quantity,
        value: price * quantity,
    })
}

export const trackRemoveFromCart = (productId: string, productName: string) => {
    trackEvent('remove_from_cart', {
        productId,
        productName,
    })
}

export const trackBeginCheckout = (total: number, itemCount: number) => {
    trackEvent('begin_checkout', {
        total,
        itemCount,
    })
}

export const trackPurchase = (
    orderId: string,
    total: number,
    items: Array<{ productId: string; productName: string; price: number; quantity: number }>
) => {
    trackEvent('purchase', {
        transaction_id: orderId,
        value: total,
        currency: 'DZD',
        items,
    })
}

export const trackSearch = (searchTerm: string, resultCount?: number) => {
    trackEvent('search', {
        search_term: searchTerm,
        result_count: resultCount,
    })
}

export const trackLogin = (method: string = 'email') => {
    trackEvent('login', { method })
}

export const trackSignup = (method: string = 'email') => {
    trackEvent('sign_up', { method })
}

export const trackShare = (contentType: string, itemId: string) => {
    trackEvent('share', {
        content_type: contentType,
        item_id: itemId,
    })
}

// Seller-specific events
export const trackProductCreated = (productId: string, productName: string) => {
    trackEvent('product_created', {
        productId,
        productName,
    })
}

export const trackOrderStatusChanged = (orderId: string, oldStatus: string, newStatus: string) => {
    trackEvent('order_status_changed', {
        orderId,
        oldStatus,
        newStatus,
    })
}
