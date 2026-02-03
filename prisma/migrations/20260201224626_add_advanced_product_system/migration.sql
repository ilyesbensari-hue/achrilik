/*
  Warnings:

  - The `status` column on the `Order` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[sku]` on the table `Variant` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `Category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Review` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Variant` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'READY', 'SHIPPED', 'DELIVERED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DeliveryStatus" AS ENUM ('PENDING', 'ACCEPTED', 'READY_TO_SHIP', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'FAILED', 'RETURNED');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('BUYER', 'SELLER', 'DELIVERY_AGENT', 'ADMIN');

-- DropForeignKey
ALTER TABLE "Category" DROP CONSTRAINT "Category_parentId_fkey";

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "description" TEXT,
ADD COLUMN     "icon" TEXT,
ADD COLUMN     "image" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "keywords" TEXT[],
ADD COLUMN     "metaDescription" TEXT,
ADD COLUMN     "metaTitle" TEXT,
ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "amountReceived" DOUBLE PRECISION,
ADD COLUMN     "cancellationReason" TEXT,
ADD COLUMN     "codAmount" DOUBLE PRECISION,
ADD COLUMN     "codReceived" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "codReceivedAmount" DOUBLE PRECISION,
ADD COLUMN     "codReceivedAt" TIMESTAMP(3),
ADD COLUMN     "deliveryPersonName" TEXT,
ADD COLUMN     "deliveryPersonPhone" TEXT,
ADD COLUMN     "deliveryStatus" "DeliveryStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "estimatedDelivery" TIMESTAMP(3),
ADD COLUMN     "isPaid" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastUpdatedAt" TIMESTAMP(3),
ADD COLUMN     "lastUpdatedBy" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "paidAt" TIMESTAMP(3),
ADD COLUMN     "paymentReceipt" TEXT,
ADD COLUMN     "sellerNotes" TEXT,
ADD COLUMN     "shippingAddress" TEXT,
ADD COLUMN     "shippingCity" TEXT,
ADD COLUMN     "shippingName" TEXT,
ADD COLUMN     "shippingPhone" TEXT,
ADD COLUMN     "shippingWilaya" TEXT,
ADD COLUMN     "storeAddress" TEXT,
ADD COLUMN     "storeCity" TEXT,
ADD COLUMN     "storeId" TEXT,
ADD COLUMN     "storeName" TEXT,
ADD COLUMN     "trackingNumber" TEXT,
ADD COLUMN     "trackingUrl" TEXT,
DROP COLUMN "status",
ADD COLUMN     "status" "OrderStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "availableSizes" TEXT[],
ADD COLUMN     "badges" TEXT[],
ADD COLUMN     "brand" TEXT,
ADD COLUMN     "careInstructions" TEXT,
ADD COLUMN     "closure" TEXT,
ADD COLUMN     "composition" TEXT,
ADD COLUMN     "countryOfManufacture" TEXT,
ADD COLUMN     "cutType" TEXT,
ADD COLUMN     "dimensions" TEXT,
ADD COLUMN     "discountPrice" DOUBLE PRECISION,
ADD COLUMN     "favoriteCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "fit" TEXT,
ADD COLUMN     "height" DOUBLE PRECISION,
ADD COLUMN     "isBestSeller" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isNew" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isTrending" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "length" TEXT,
ADD COLUMN     "material" TEXT,
ADD COLUMN     "metaDescription" TEXT,
ADD COLUMN     "metaTitle" TEXT,
ADD COLUMN     "neckline" TEXT,
ADD COLUMN     "pattern" TEXT,
ADD COLUMN     "pockets" TEXT,
ADD COLUMN     "productLength" DOUBLE PRECISION,
ADD COLUMN     "promotionLabel" TEXT,
ADD COLUMN     "quality" TEXT,
ADD COLUMN     "salesCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "sizeGuide" TEXT,
ADD COLUMN     "supplierReference" TEXT,
ADD COLUMN     "technicalSpecs" TEXT,
ADD COLUMN     "viewCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "warranty" TEXT,
ADD COLUMN     "weight" DOUBLE PRECISION,
ADD COLUMN     "width" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "helpfulCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "isVerifiedPurchase" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "photos" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "sellerResponse" TEXT,
ADD COLUMN     "sellerResponseDate" TIMESTAMP(3),
ADD COLUMN     "title" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Store" ADD COLUMN     "defaultDeliveryAgentId" TEXT,
ADD COLUMN     "verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "verifiedAt" TIMESTAMP(3),
ADD COLUMN     "verifiedBy" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "city" TEXT,
ADD COLUMN     "roles" "Role"[] DEFAULT ARRAY['BUYER']::"Role"[],
ADD COLUMN     "wilaya" TEXT;

-- AlterTable
ALTER TABLE "Variant" ADD COLUMN     "colorHex" TEXT,
ADD COLUMN     "colorImage" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isAvailable" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "priceAdjustment" DOUBLE PRECISION,
ADD COLUMN     "sku" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "Banner" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "image" TEXT NOT NULL,
    "link" TEXT,
    "buttonText" TEXT NOT NULL DEFAULT 'Voir l''offre',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Banner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeliveryAgent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "vehicleType" TEXT,
    "licenseNumber" TEXT,
    "wilayasCovered" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "totalDeliveries" INTEGER NOT NULL DEFAULT 0,
    "successRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeliveryAgent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Delivery" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "agentId" TEXT,
    "assignedAt" TIMESTAMP(3),
    "status" "DeliveryStatus" NOT NULL DEFAULT 'PENDING',
    "trackingNumber" TEXT,
    "trackingUrl" TEXT,
    "codAmount" DOUBLE PRECISION,
    "codCollected" BOOLEAN NOT NULL DEFAULT false,
    "codCollectedAt" TIMESTAMP(3),
    "codTransferred" BOOLEAN NOT NULL DEFAULT false,
    "codTransferredAt" TIMESTAMP(3),
    "agentNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Delivery_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_token_key" ON "PasswordResetToken"("token");

-- CreateIndex
CREATE INDEX "PasswordResetToken_expiresAt_idx" ON "PasswordResetToken"("expiresAt");

-- CreateIndex
CREATE INDEX "PasswordResetToken_token_idx" ON "PasswordResetToken"("token");

-- CreateIndex
CREATE INDEX "PasswordResetToken_userId_idx" ON "PasswordResetToken"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DeliveryAgent_userId_key" ON "DeliveryAgent"("userId");

-- CreateIndex
CREATE INDEX "DeliveryAgent_userId_idx" ON "DeliveryAgent"("userId");

-- CreateIndex
CREATE INDEX "DeliveryAgent_isActive_idx" ON "DeliveryAgent"("isActive");

-- CreateIndex
CREATE INDEX "DeliveryAgent_provider_idx" ON "DeliveryAgent"("provider");

-- CreateIndex
CREATE UNIQUE INDEX "Delivery_orderId_key" ON "Delivery"("orderId");

-- CreateIndex
CREATE INDEX "Delivery_orderId_idx" ON "Delivery"("orderId");

-- CreateIndex
CREATE INDEX "Delivery_agentId_idx" ON "Delivery"("agentId");

-- CreateIndex
CREATE INDEX "Delivery_status_idx" ON "Delivery"("status");

-- CreateIndex
CREATE INDEX "Category_parentId_idx" ON "Category"("parentId");

-- CreateIndex
CREATE INDEX "Category_slug_idx" ON "Category"("slug");

-- CreateIndex
CREATE INDEX "Order_isPaid_idx" ON "Order"("isPaid");

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "Order"("status");

-- CreateIndex
CREATE INDEX "Order_storeId_idx" ON "Order"("storeId");

-- CreateIndex
CREATE INDEX "Order_deliveryStatus_idx" ON "Order"("deliveryStatus");

-- CreateIndex
CREATE UNIQUE INDEX "Variant_sku_key" ON "Variant"("sku");

-- CreateIndex
CREATE INDEX "Variant_sku_idx" ON "Variant"("sku");

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Store" ADD CONSTRAINT "Store_defaultDeliveryAgentId_fkey" FOREIGN KEY ("defaultDeliveryAgentId") REFERENCES "DeliveryAgent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryAgent" ADD CONSTRAINT "DeliveryAgent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Delivery" ADD CONSTRAINT "Delivery_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "DeliveryAgent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Delivery" ADD CONSTRAINT "Delivery_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
