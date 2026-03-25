"use client";

import dynamic from 'next/dynamic';

const NewsletterBanner = dynamic(() => import('./NewsletterBanner'), { ssr: false });

export default function NewsletterBannerClient() {
    return <NewsletterBanner />;
}
