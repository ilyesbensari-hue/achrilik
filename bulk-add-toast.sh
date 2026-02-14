#!/bin/bash
# Batch toast migration for remaining admin files
# This will add toast import to all files that need it

cd /Users/ilyes/.gemini/antigravity/scratch/dz-shop

FILES=(
  "src/app/admin/badges/page.tsx"
  "src/app/admin/settings/page.tsx"
  "src/app/admin/settings/commission/page.tsx"
  "src/app/admin/commissions/page.tsx"
  "src/app/admin/fashion-editor/page.tsx"
  "src/app/admin/emails/page.tsx"
  "src/app/admin/delivery-fees/page.tsx"
)

echo "📦 Adding toast import to remaining files..."
for file in "${FILES[@]}"; do
  if [ -f "$file" ] && ! grep -q "import toast from 'react-hot-toast'" "$file"; then
    # Find first import line andadd toast after it
   sed -i '' "2a\\
import toast from 'react-hot-toast';
" "$file" 2>/dev/null && echo "✅ $file" || echo "⚠️  $file"
  fi
done

echo ""
echo "✅ Toast imports added - now replace alert() calls manually"
