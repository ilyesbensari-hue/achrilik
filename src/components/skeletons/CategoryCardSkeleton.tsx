export default function CategoryCardSkeleton() {
    return (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
            {/* Image skeleton */}
            <div className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300" />

            {/* Text skeleton */}
            <div className="p-4 space-y-2">
                <div className="h-5 bg-gray-200 rounded w-2/3 mx-auto" />
                <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto" />
            </div>
        </div>
    );
}
