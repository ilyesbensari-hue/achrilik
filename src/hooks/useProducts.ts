import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useProducts(category?: string) {
    const url = category ? `/api/products?category=${category}` : '/api/products'

    const { data, error, isLoading, mutate } = useSWR(url, fetcher, {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        refreshInterval: 0,
        dedupingInterval: 60000, // 1 minute
    })

    return {
        products: data,
        isLoading,
        isError: error,
        refetch: mutate,
    }
}

export function useCategories() {
    const { data, error, isLoading } = useSWR('/api/categories', fetcher, {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        refreshInterval: 0,
        dedupingInterval: 300000, // 5 minutes
    })

    return {
        categories: data,
        isLoading,
        isError: error,
    }
}

export function useProduct(id: string) {
    const { data, error, isLoading } = useSWR(id ? `/api/products/${id}` : null, fetcher, {
        revalidateOnFocus: false,
    })

    return {
        product: data,
        isLoading,
        isError: error,
    }
}
