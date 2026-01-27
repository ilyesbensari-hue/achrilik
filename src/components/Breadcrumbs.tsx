
import Link from 'next/link';
import { Fragment } from 'react';

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
    return (
        <nav className="mb-3 flex items-center gap-2 text-sm text-gray-600 flex-wrap">
            <Link href="/" className="hover:text-gray-900 transition-colors">
                Accueil
            </Link>

            {items.map((item, index) => (
                <Fragment key={index}>
                    <span className="text-gray-400">/</span>
                    {item.href ? (
                        <Link href={item.href} className="hover:text-gray-900 transition-colors">
                            {item.label}
                        </Link>
                    ) : (
                        <span className="text-gray-900 font-medium">
                            {item.label}
                        </span>
                    )}
                </Fragment>
            ))}
        </nav>
    );
}
