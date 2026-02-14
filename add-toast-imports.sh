#!/bin/bash
# Quick toast migration script for remaining admin files
# This adds toast import to files that don't have it yet

cd /Users/ilyes/.gemini/antigravity/scratch/dz-shop

FILES=(
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

echo "🔧 Adding toast imports to files..."

for file in "${FILES[@]}"; do
  # Check if file exists and doesn't already have toast import
  if [ -f "$file" ] && ! grep -q "import toast from 'react-hot-toast'" "$file"; then
    # Find the line number after "use client" and first import
    # Add toast import after existing imports
    sed -i '' '/^import.*from/a\
import toast from '\''react-hot-toast'\'';
' "$file" 2>/dev/null || echo "⚠️  Skipped $file (may need manual import)"
    echo "✅ Added toast import to $file"
  else
    echo "⏭️  Skipped $file (not found or already has toast)"
  fi
done

echo ""
echo "✨ Import phase complete!"
echo "📝 Manual alert() → toast.success/error replacement still needed"
