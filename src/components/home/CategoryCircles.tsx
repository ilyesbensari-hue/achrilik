'use client';

import { Tag, TrendingUp, Sparkles, Shirt, Briefcase, Watch, User } from 'lucide-react';
import Link from 'next/link';

export default function CategoryCircles() {
    // Homepage category circles - synced with main categories
    const sections = [
        // Special sections first
        {
            slug: 'promos',
            name: 'Promos',
            icon: Tag,
            bgColor: 'bg-red-100',
            iconColor: 'text-red-600',
            href: '/categories/promotions'
        },
        {
            slug: 'best-sellers',
            name: 'Best Sellers',
            icon: TrendingUp,
            bgColor: 'bg-orange-100',
            iconColor: 'text-orange-600',
            href: '/best-sellers'
        },
        {
            slug: 'nouveautes',
            name: 'Nouveautés',
            icon: Sparkles,
            bgColor: 'bg-purple-100',
            iconColor: 'text-purple-600',
            href: '/nouveautes'
        },
        // Main categories
        {
            slug: 'femme',
            name: 'Femme',
            icon: User,
            bgColor: 'bg-pink-100',
            iconColor: 'text-pink-600',
            href: '/categories/femmes'
        },
        {
            slug: 'homme',
            name: 'Homme',
            icon: Shirt,
            bgColor: 'bg-blue-100',
            iconColor: 'text-blue-600',
            href: '/categories/hommes'
        },
        {
            slug: 'enfant',
            name: 'Enfant',
            icon: User,
            bgColor: 'bg-green-100',
            iconColor: 'text-green-600',
            href: '/categories/enfants'
        },
        {
            slug: 'maroquinerie',
            name: 'Maroquinerie',
            icon: Briefcase,
            bgColor: 'bg-amber-100',
            iconColor: 'text-amber-700',
            href: '/categories/maroquinerie'
        },
        {
            slug: 'accessoires',
            name: 'Accessoires',
            icon: Watch,
            bgColor: 'bg-cyan-100',
            iconColor: 'text-cyan-600',
            href: '/categories/accessoires'
        },
        {
            slug: 'electronique',
            name: 'Électronique',
            icon: Watch, // Using Watch as placeholder, will use proper icon
            bgColor: 'bg-indigo-100',
            iconColor: 'text-indigo-600',
            href: '/categories/electronique'
        },
    ];

    return (
        <div className="mb-8 px-4 md:px-8 lg:px-12 xl:px-16">
            <div className="flex md:grid md:grid-cols-6 lg:grid-cols-9 gap-5 md:gap-8 overflow-x-auto md:overflow-visible pb-6 md:pb-0 pt-2 px-1 scrollbar-hide md:max-w-7xl md:mx-auto">
                {sections.map((section) => {
                    const Icon = section.icon;
                    return (
                        <Link
                            href={section.href}
                            key={section.slug}
                            className="flex flex-col items-center gap-2.5 group flex-shrink-0 md:flex-shrink min-w-[76px] md:min-w-0"
                        >
                            <div className={`w-[72px] h-[72px] md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-2xl md:rounded-[20px] lg:rounded-3xl ${section.bgColor} flex items-center justify-center transform transition-all duration-300 group-hover:scale-105 group-active:scale-95 shadow-[0_4px_12px_-4px_rgba(0,0,0,0.05)] group-hover:shadow-[0_12px_24px_-8px_rgba(0,0,0,0.12)] ring-1 ring-black/5 group-hover:ring-black/10`}>
                                <Icon className={`h-8 w-8 md:h-9 md:w-9 lg:h-11 lg:w-11 ${section.iconColor} drop-shadow-sm`} strokeWidth={1.5} />
                            </div>
                            <span className="text-[11px] md:text-xs lg:text-sm font-medium text-gray-600 text-center leading-tight tracking-[0.01em] group-hover:text-gray-900 transition-colors">
                                {section.name}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
