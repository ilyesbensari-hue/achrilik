import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const id = (await params).id;
        console.log('Fetching store with ID:', id);

        const store = await prisma.store.findUnique({
            where: { id },
            include: {
                Product: {
                    include: {
                        Review: {
                            include: {
                                User: {
                                    select: {
                                        name: true,
                                        email: true // Optional, maybe just name
                                    }
                                }
                            },
                            orderBy: { createdAt: 'desc' }
                        }
                    }
                },
                User: {
                    select: {
                        name: true,
                        email: true,
                        phone: true
                    }
                }
            },
        });

        if (!store) {
            return NextResponse.json({ error: 'Store not found' }, { status: 404 });
        }

        return NextResponse.json(store);
    } catch (error) {
        console.error('Failed to fetch store:', error);
        return NextResponse.json({ error: 'Failed to fetch store' }, { status: 500 });
    }
}
