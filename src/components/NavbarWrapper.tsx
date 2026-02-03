'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/home/BottomNav';

export default function NavbarWrapper() {
    const pathname = usePathname();
    const isHomepage = pathname === '/';

    return (
        <>
            {/* Always show Navbar */}
            <Navbar />

            {/* Hide global BottomNav on homepage (homepage has its own) */}
            {!isHomepage && <BottomNav />}
        </>
    );
}
