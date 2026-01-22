import React from 'react';

interface JsonLdProps {
    data: Record<string, any>;
}

/**
 * JSON-LD Structured Data Component
 * Helps search engines understand the content better
 */
export default function JsonLd({ data }: JsonLdProps) {
    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
    );
}

// Helper functions to generate common schema types

export function generateOrganizationSchema(baseUrl: string) {
    return {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "Achrilik",
        url: baseUrl,
        logo: `${baseUrl}/logo.png`,
        description: "Marketplace mode et tendance en Algérie",
        address: {
            "@type": "PostalAddress",
            addressCountry: "DZ",
        },
        sameAs: [
            // TODO: Add social media links when available
        ],
    };
}

export function generateProductSchema(product: any, baseUrl: string) {
    return {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.title,
        description: product.description,
        image: product.images?.split(',')[0] || `${baseUrl}/placeholder.jpg`,
        offers: {
            "@type": "Offer",
            price: product.price,
            priceCurrency: "DZD",
            availability: product.status === 'APPROVED' ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            url: `${baseUrl}/products/${product.id}`,
        },
        brand: {
            "@type": "Brand",
            name: product.store?.name || "Achrilik",
        },
    };
}

export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.name,
            item: item.url,
        })),
    };
}

export function generateLocalBusinessSchema(store: any, baseUrl: string) {
    const schema: any = {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        name: store.name,
        image: `${baseUrl}/store-placeholder.jpg`,
        url: `${baseUrl}/stores/${store.id}`,
    };

    if (store.description) {
        schema.description = store.description;
    }

    if (store.address) {
        schema.address = {
            "@type": "PostalAddress",
            streetAddress: store.address,
            addressLocality: store.city || "",
            addressCountry: "DZ",
        };
    }

    if (store.latitude && store.longitude) {
        schema.geo = {
            "@type": "GeoCoordinates",
            latitude: store.latitude,
            longitude: store.longitude,
        };
    }

    if (store.phone) {
        schema.telephone = store.phone;
    }

    if (store.hours) {
        schema.openingHours = store.hours;
    }

    return schema;
}
