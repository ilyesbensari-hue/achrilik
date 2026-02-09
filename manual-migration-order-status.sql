-- Migration manuelle pour ajouter nouveaux statuts OrderStatus
-- SAFE: N'efface pas les données existantes

BEGIN;

-- 1. Ajouter les nouveaux statuts à l'enum existant
ALTER TYPE "OrderStatus" ADD VALUE IF NOT EXISTS 'PAYMENT_PENDING';
ALTER TYPE "OrderStatus" ADD VALUE IF NOT EXISTS 'AT_MERCHANT';
ALTER TYPE "OrderStatus" ADD VALUE IF NOT EXISTS 'READY_FOR_PICKUP';
ALTER TYPE "OrderStatus" ADD VALUE IF NOT EXISTS 'WITH_DELIVERY_AGENT';
ALTER TYPE "OrderStatus" ADD VALUE IF NOT EXISTS 'OUT_FOR_DELIVERY';
ALTER TYPE "OrderStatus" ADD VALUE IF NOT EXISTS 'RETURNED';

-- 2. Ajouter nouveaux champs à Order
ALTER TABLE "Order" 
  ADD COLUMN IF NOT EXISTS "statusHistory" JSONB,
  ADD COLUMN IF NOT EXISTS "merchantNotes" TEXT,
  ADD COLUMN IF NOT EXISTS "deliveryNotes" TEXT;

-- 3. Migrer les anciennes valeurs vers les nouvelles
UPDATE "Order" SET status = 'READY_FOR_PICKUP' WHERE status = 'READY';
UPDATE "Order" SET status = 'OUT_FOR_DELIVERY' WHERE status = 'SHIPPED';

-- 4. Initialiser statusHistory pour les commandes existantes
UPDATE "Order"
SET "statusHistory" = jsonb_build_array(
  jsonb_build_object(
    'from', NULL,
    'to', status,
    'at', "createdAt",
    'by', "userId",
    'note', 'Migration initiale'
  )
)
WHERE "statusHistory" IS NULL;

COMMIT;

-- NOTE: Les anciennes valeurs READY et SHIPPED resteront dans l'enum
-- mais ne seront plus utilisées. Prisma generate les ignorera.
