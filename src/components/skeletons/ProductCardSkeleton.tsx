export default function ProductCardSkeleton() {
    return (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden animate-pulse">
            {/* Image skeleton */}
            <div className="aspect-[4/5] bg-gray-200" />

            {/* Content skeleton */}
            <div className="p-3 space-y-3">
                {/* Title lines */}
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />

                {/* Price */}
                <div className="h-6 bg-gray-200 rounded w-1/3" />

                {/* Store name */}
                <div className="h-3 bg-gray-200 rounded w-2/3" />
            </div>
        </div>
    );
}
