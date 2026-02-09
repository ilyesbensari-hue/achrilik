-- Step 2: Ajouter nouveaux champs et migrer données
BEGIN;

-- Ajouter nouveaux champs
ALTER TABLE "Order" 
  ADD COLUMN IF NOT EXISTS "statusHistory" JSONB,
  ADD COLUMN IF NOT EXISTS "merchantNotes" TEXT,
  ADD COLUMN IF NOT EXISTS "deliveryNotes" TEXT;

-- Migrer les anciennes valeurs vers les nouvelles
UPDATE "Order" SET status = 'READY_FOR_PICKUP' WHERE status = 'READY';
UPDATE "Order" SET status = 'OUT_FOR_DELIVERY' WHERE status = 'SHIPPED';

-- Initialiser statusHistory
UPDATE "Order"
SET "statusHistory" = jsonb_build_array(
  jsonb_build_object(
    'from', NULL,
    'to', status::text,
    'at', "createdAt",
    'by', "userId",
    'note', 'Migration initiale'
  )
)
WHERE "statusHistory" IS NULL;

COMMIT;
