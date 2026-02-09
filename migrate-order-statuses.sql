-- Migration SQL pour mapper anciens statuts vers nouveaux
-- À exécuter APRÈS la migration Prisma

-- READY → READY_FOR_PICKUP
UPDATE "Order" 
SET status = 'READY_FOR_PICKUP' 
WHERE status = 'READY';

-- SHIPPED → OUT_FOR_DELIVERY
UPDATE "Order" 
SET status = 'OUT_FOR_DELIVERY' 
WHERE status = 'SHIPPED';

-- Initialiser statusHistory pour les commandes existantes
UPDATE "Order"
SET "statusHistory" = jsonb_build_array(
  jsonb_build_object(
    'from', NULL,
    'to', status,
    'at', "createdAt",
    'by', "userId"
  )
)
WHERE "statusHistory" IS NULL;
