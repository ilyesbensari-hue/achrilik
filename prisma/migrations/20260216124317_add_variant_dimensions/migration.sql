/*
  Warnings:

  - The values [READY] on the enum `OrderStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `quality` on the `Product` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "OrderStatus_new" AS ENUM ('PENDING', 'PAYMENT_PENDING', 'CONFIRMED', 'AT_MERCHANT', 'READY_FOR_PICKUP', 'WITH_DELIVERY_AGENT', 'OUT_FOR_DELIVERY', 'SHIPPED', 'DELIVERED', 'RETURNED', 'CANCELLED');
ALTER TABLE "Order" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Order" ALTER COLUMN "status" TYPE "OrderStatus_new" USING ("status"::text::"OrderStatus_new");
ALTER TYPE "OrderStatus" RENAME TO "OrderStatus_old";
ALTER TYPE "OrderStatus_new" RENAME TO "OrderStatus";
DROP TYPE "OrderStatus_old";
ALTER TABLE "Order" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterTable
ALTER TABLE "Delivery" ADD COLUMN     "agentPaid" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "agentPaidAt" TIMESTAMP(3),
ADD COLUMN     "agentPaymentNote" TEXT,
ADD COLUMN     "deliveryFee" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "actualDeliveryFee" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "commissionPaid" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "commissionPaidAt" TIMESTAMP(3),
ADD COLUMN     "commissionPaymentNote" TEXT,
ADD COLUMN     "customerDeliveryFee" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "deliveryNotes" TEXT,
ADD COLUMN     "freeDeliveryApplied" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "merchantNotes" TEXT,
ADD COLUMN     "platformCommission" DOUBLE PRECISION,
ADD COLUMN     "platformCommissionRate" DOUBLE PRECISION,
ADD COLUMN     "statusHistory" JSONB,
ADD COLUMN     "subtotal" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "quality",
ADD COLUMN     "storageWilaya" TEXT,
ADD COLUMN     "storageZone" TEXT;

-- AlterTable
ALTER TABLE "Store" ADD COLUMN     "freeDeliveryThreshold" INTEGER,
ADD COLUMN     "offersFreeDelivery" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Variant" ADD COLUMN     "height" DOUBLE PRECISION,
ADD COLUMN     "length" DOUBLE PRECISION,
ADD COLUMN     "width" DOUBLE PRECISION,
ALTER COLUMN "size" DROP NOT NULL;

-- CreateTable
CREATE TABLE "PlatformSettings" (
    "id" TEXT NOT NULL,
    "commissionRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,
    "previousRate" DOUBLE PRECISION,

    CONSTRAINT "PlatformSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemConfig" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT,

    CONSTRAINT "SystemConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PlatformSettings_updatedAt_idx" ON "PlatformSettings"("updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "SystemConfig_key_key" ON "SystemConfig"("key");

-- CreateIndex
CREATE INDEX "SystemConfig_key_idx" ON "SystemConfig"("key");
