import { MetadataRoute } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://achrilik.com'

    // Static pages
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1.0,
        },
        {
            url: `${baseUrl}/categories`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/stores`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/become-seller`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.6,
        },
    ]

    try {
        // Get all approved products
        const products = await prisma.product.findMany({
            where: { status: 'APPROVED' },
            select: {
                id: true,
                createdAt: true,
            },
            take: 1000, // Limit for performance
        })

        const productPages: MetadataRoute.Sitemap = products.map((product) => ({
            url: `${baseUrl}/products/${product.id}`,
            lastModified: product.createdAt,
            changeFrequency: 'weekly' as const,
            priority: 0.7,
        }))

        // Get all categories
        const categories = await prisma.category.findMany({
            select: {
                slug: true,
                id: true,
            },
        })

        const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
            url: `${baseUrl}/categories/${category.slug}`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        }))

        // Get all stores (public ones)
        const stores = await prisma.store.findMany({
            select: {
                id: true,
                createdAt: true,
            },
            take: 500,
        })

        const storePages: MetadataRoute.Sitemap = stores.map((store) => ({
            url: `${baseUrl}/stores/${store.id}`,
            lastModified: store.createdAt,
            changeFrequency: 'weekly' as const,
            priority: 0.6,
        }))

        return [...staticPages, ...categoryPages, ...productPages, ...storePages]
    } catch (error) {
        console.error('Error generating sitemap:', error)
        return staticPages
    } finally {
        await prisma.$disconnect()
    }
}
