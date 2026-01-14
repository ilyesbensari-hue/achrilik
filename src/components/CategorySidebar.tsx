'use client';

import CategoryList from './CategoryList';

export default function CategorySidebar() {
    return (
        <aside className="hidden lg:block flex-shrink-0 sticky top-[100px] h-fit min-w-[280px] w-[280px]">
            <div className="rounded-2xl overflow-hidden w-full shadow-lg" style={{
                background: 'linear-gradient(to bottom, #006233, #004d28)',
            }}>
                {/* Header */}
                <div className="p-6 text-white border-b border-white/20">
                    <h3 className="font-bold text-center text-xl">Catégories</h3>
                </div>

                {/* Categories List */}
                <div className="p-4">
                    <CategoryList variant="sidebar" />
                </div>
            </div>
        </aside>
    );
}
