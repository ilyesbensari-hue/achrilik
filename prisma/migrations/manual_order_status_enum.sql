-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'READY', 'SHIPPED', 'DELIVERED', 'CANCELLED');

-- AlterTable: Add cancellationReason column
ALTER TABLE "Order" ADD COLUMN "cancellationReason" TEXT;

-- AlterTable: Add temporary column for new status
ALTER TABLE "Order" ADD COLUMN "status_new" "OrderStatus";

-- Migrate existing data
UPDATE "Order" SET "status_new" = 
  CASE 
    WHEN "status" = 'PENDING' THEN 'PENDING'::"OrderStatus"
    WHEN "status" = 'CONFIRMED' THEN 'CONFIRMED'::"OrderStatus"
    WHEN "status" = 'READY' THEN 'READY'::"OrderStatus"
    WHEN "status" = 'DELIVERED' THEN 'DELIVERED'::"OrderStatus"
    WHEN "status" = 'CANCELLED' THEN 'CANCELLED'::"OrderStatus"
    ELSE 'PENDING'::"OrderStatus"
  END;

-- Set default for new column
ALTER TABLE "Order" ALTER COLUMN "status_new" SET DEFAULT 'PENDING'::"OrderStatus";
ALTER TABLE "Order" ALTER COLUMN "status_new" SET NOT NULL;

-- Drop old column and rename new column
ALTER TABLE "Order" DROP COLUMN "status";
ALTER TABLE "Order" RENAME COLUMN "status_new" TO "status";
