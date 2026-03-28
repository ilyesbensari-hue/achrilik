'use client';

import dynamic from 'next/dynamic';

// Load lazily client-side only (no SSR)
const RecentlyViewed = dynamic(
    () => import('@/components/home/RecentlyViewed'),
    { ssr: false }
);

export default function RecentlyViewedWrapper() {
    return <RecentlyViewed />;
}
