#!/bin/bash

# Script to automatically replace alert() calls with toast in admin files
# This helps speed up the systematic replacement across 40+ files

FILES_TO_UPDATE=(
  "src/app/admin/vendors/page.tsx"
  "src/app/admin/banners/page.tsx"  
  "src/app/admin/delivery-config/page.tsx"
  "src/app/admin/badges/page.tsx"
  "src/app/admin/settings/page.tsx"
  "src/app/admin/settings/commission/page.tsx"
  "src/app/admin/commissions/page.tsx"
  "src/app/admin/fashion-editor/page.tsx"
  "src/app/admin/emails/page.tsx"
  "src/app/admin/delivery-fees/page.tsx"
)

echo "🔍 Checking remaining alert() usage in admin files..."

for file in "${FILES_TO_UPDATE[@]}"; do
  if [ -f "$file" ]; then
    count=$(grep -c "alert(" "$file" || echo "0")
    if [ "$count" -gt 0 ]; then
      echo "📝 $file: $count alert() calls found"
    fi
  fi
done

echo ""
echo "ℹ️  Manual replacements still required for complex cases."
echo "✅ Use multi_replace_file_content tool for each file."
