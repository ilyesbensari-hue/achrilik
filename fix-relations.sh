#!/bin/bash

# Script to fix all lowercase relation accesses in client components

echo "🔧 Fixing relation name accesses in client components..."

# Files to fix
FILES=(
  "src/app/products/[id]/ProductPageClient.tsx"
  "src/app/wishlist/page.tsx"
  "src/app/sell/SellerPageClient.tsx"
  "src/app/sell/edit/[id]/page.tsx"
  "src/app/sell/products/[id]/edit/page.tsx"
  "src/app/categories/[slug]/page.tsx"
  "src/app/stores/[id]/page.tsx"
  "src/app/sell/orders/page.tsx"
  "src/app/profile/ProfileClient.tsx"
  "src/app/search/page.tsx"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "Fixing $file..."
    
    # Fix property accesses (but not variable names or object keys)
    sed -i '' 's/\.variants/.Variant/g' "$file"
    sed -i '' 's/\.reviews/.Review/g' "$file"
    sed -i '' 's/\.store/.Store/g' "$file"
    sed -i '' 's/\.category/.Category/g' "$file"
    sed -i '' 's/\.user/.User/g' "$file"
    sed -i '' 's/\.variant/.Variant/g' "$file"
    sed -i '' 's/\.product/.Product/g' "$file"
    
    echo "✅ Fixed $file"
  else
    echo "⚠️  File not found: $file"
  fi
done

echo "✨ All files fixed!"
