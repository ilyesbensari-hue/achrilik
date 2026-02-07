// Helper function to get platform commission rate
export async function getPlatformCommissionRate(): Promise<number> {
    try {
        const setting = await prisma.systemSettings.findUnique({
            where: { key: 'PLATFORM_COMMISSION_RATE' }
        });

        return setting ? parseFloat(setting.value) : 0; // Default 0% if not set
    } catch (error) {
        console.error('Error fetching commission rate:', error);
        return 0;
    }
}
