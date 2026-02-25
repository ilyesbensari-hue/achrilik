-- Migration: Créer structure catégorie Chaussures
-- Date: 2026-02-17
-- Description: Sépare chaussures de Vêtements avec structure Homme/Femme/Enfant

-- 1. Catégorie Top-Level "Chaussures"
INSERT INTO "Category" (id, name, slug, description, "parentId", icon, "createdAt", "updatedAt")
VALUES (
  'cat-chaussures-toplevel',
  'Chaussures',
  'chaussures',
  'Toutes nos chaussures pour Homme, Femme et Enfant',
  NULL,
  '👟',
  NOW(),
  NOW()
);

-- 2. Chaussures Homme
INSERT INTO "Category" (id, name, slug, description, "parentId", icon, "createdAt", "updatedAt")
VALUES (
  'cat-chaussures-homme',
  'Chaussures Homme',
  'chaussures-hommes',
  'Chaussures pour Homme - Baskets, Souliers, Sport',
  'cat-chaussures-toplevel',
  '👞',
  NOW(),
  NOW()
);

-- 3. Sous-catégories Homme
INSERT INTO "Category" (id, name, slug, "parentId", "createdAt", "updatedAt") VALUES
('cat-ch-h-baskets', 'Baskets', 'baskets-homme', 'cat-chaussures-homme', NOW(), NOW()),
('cat-ch-h-souliers', 'Souliers', 'souliers-homme', 'cat-chaussures-homme', NOW(), NOW()),
('cat-ch-h-sandales', 'Sandales', 'sandales-homme', 'cat-chaussures-homme', NOW(), NOW()),
('cat-ch-h-sport', 'Chaussures de Sport', 'sport-homme', 'cat-chaussures-homme', NOW(), NOW());

-- 4. Chaussures Femme
INSERT INTO "Category" (id, name, slug, description, "parentId", icon, "createdAt", "updatedAt")
VALUES (
  'cat-chaussures-femme',
  'Chaussures Femme',
  'chaussures-femmes',
  'Chaussures pour Femme - Baskets, Escarpins, Bottes',
  'cat-chaussures-toplevel',
  '👠',
  NOW(),
  NOW()
);

-- 5. Sous-catégories Femme
INSERT INTO "Category" (id, name, slug, "parentId", "createdAt", "updatedAt") VALUES
('cat-ch-f-baskets', 'Baskets', 'baskets-femme', 'cat-chaussures-femme', NOW(), NOW()),
('cat-ch-f-escarpins', 'Escarpins', 'escarpins-femme', 'cat-chaussures-femme', NOW(), NOW()),
('cat-ch-f-sandales', 'Sandales', 'sandales-femme', 'cat-chaussures-femme', NOW(), NOW()),
('cat-ch-f-bottes', 'Bottes & Bottines', 'bottes-femme', 'cat-chaussures-femme', NOW(), NOW());

-- 6. Chaussures Enfant
INSERT INTO "Category" (id, name, slug, description, "parentId", icon, "createdAt", "updatedAt")
VALUES (
  'cat-chaussures-enfant',
  'Chaussures Enfant',
  'chaussures-enfants',
  'Chaussures pour Enfant et Bébé',
  'cat-chaussures-toplevel',
  '👶',
  NOW(),
  NOW()
);

-- 7. Trouver produits chaussures actuels (pour vérification)
-- SELECT id, title, "categoryId" 
-- FROM "Product" 
-- WHERE LOWER(title) LIKE '%chaussure%' 
--    OR LOWER(title) LIKE '%basket%'
--    OR LOWER(title) LIKE '%soulier%'
--    OR LOWER(title) LIKE '%sandale%';

-- 8. Déplacer le produit "Basket" existant vers Baskets Homme
-- (À exécuter après vérification de l'ID du produit)
-- UPDATE "Product" 
-- SET "categoryId" = 'cat-ch-h-baskets'
-- WHERE id = 'b2d977a44d09c8010445fecfa1a8fac6';
