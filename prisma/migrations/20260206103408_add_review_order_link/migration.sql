/*
  Warnings:

  - A unique constraint covering the columns `[userId,productId]` on the table `Review` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Banner" ADD COLUMN     "buttonText_ar" TEXT,
ADD COLUMN     "subtitle_ar" TEXT,
ADD COLUMN     "title_ar" TEXT;

-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "orderId" TEXT;

-- CreateTable
CREATE TABLE "DeliveryFeeConfig" (
    "id" TEXT NOT NULL,
    "fromCity" VARCHAR(100) NOT NULL,
    "toWilaya" VARCHAR(100) NOT NULL,
    "baseFee" INTEGER NOT NULL DEFAULT 500,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeliveryFeeConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DeliveryFeeConfig_fromCity_idx" ON "DeliveryFeeConfig"("fromCity");

-- CreateIndex
CREATE INDEX "DeliveryFeeConfig_toWilaya_idx" ON "DeliveryFeeConfig"("toWilaya");

-- CreateIndex
CREATE UNIQUE INDEX "DeliveryFeeConfig_fromCity_toWilaya_key" ON "DeliveryFeeConfig"("fromCity", "toWilaya");

-- CreateIndex
CREATE INDEX "Review_orderId_idx" ON "Review"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "Review_userId_productId_key" ON "Review"("userId", "productId");

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
