-- Add Accessories category and subcategories
-- Run this with: psql $DATABASE_URL -f add_accessories_categories.sql

-- Insert parent category: Accessoires
INSERT INTO "Category" (id, name, slug, "parentId", "createdAt")
VALUES (
    gen_random_uuid()::text,
    'Accessoires',
    'accessoires',
    NULL,
    NOW()
) ON CONFLICT (slug) DO NOTHING;

-- Get the Accessoires category ID
DO $$
DECLARE
    accessories_id text;
BEGIN
    SELECT id INTO accessories_id FROM "Category" WHERE slug = 'accessoires';
    
    -- Insert subcategories
    INSERT INTO "Category" (id, name, slug, "parentId", "createdAt")
    VALUES
        (gen_random_uuid()::text, 'Casques', 'casques', accessories_id, NOW()),
        (gen_random_uuid()::text, 'Maroquinerie', 'maroquinerie', accessories_id, NOW()),
        (gen_random_uuid()::text, 'Ceintures', 'ceintures', accessories_id, NOW()),
        (gen_random_uuid()::text, 'Gants', 'gants', accessories_id, NOW()),
        (gen_random_uuid()::text, 'Autres Accessoires', 'autres-accessoires', accessories_id, NOW())
    ON CONFLICT (slug) DO NOTHING;
END $$;

-- Verify
SELECT c1.name as "Catégorie", c2.name as "Sous-catégorie"
FROM "Category" c1
LEFT JOIN "Category" c2 ON c2."parentId" = c1.id
WHERE c1.slug = 'accessoires'
ORDER BY c2.name;
