#!/bin/bash

# Script to replace console.log/error/warn with logger in admin files

# Files to process
FILES=(
  "src/app/admin/deliveries/page.tsx"
  "src/app/admin/AdminDashboardClient.tsx"
  "src/app/admin/categories/page.tsx"
  "src/app/admin/delivery-config/page.tsx"
  "src/app/admin/delivery-agents/page.tsx"
  "src/app/admin/delivery-agents/[id]/page.tsx"
  "src/app/admin/logs/page.tsx"
  "src/app/admin/emails/page.tsx"
  "src/app/admin/banners/page.tsx"
  "src/app/admin/settings/page.tsx"
  "src/app/admin/products/page.tsx"
)

for file in "${FILES[@]}"; do
  echo "Processing $file..."
  
  # Add logger import if not already present
  if ! grep -q "import { logger } from '@/lib/logger';" "$file"; then
    # Find the line with the last import
    last_import_line=$(grep -n "^import" "$file" | tail -1 | cut -d: -f1)
    if [ -n "$last_import_line" ]; then
      sed -i '' "${last_import_line}a\\
import { logger } from '@/lib/logger';
" "$file"
    fi
  fi
  
  # Replace console.error with logger.error
  sed -i '' -E "s/console\.error\('([^']+)'(, )?/logger.error('\1', { /g" "$file"
  sed -i '' -E 's/console\.error\("([^"]+)"(, )?/logger.error("\1", { /g' "$file"
  sed -i '' -E 's/console\.error\(([^)]+)\);/logger.error("Error", { error: \1 });/g' "$file"
  
  # Replace console.log with logger.info
  sed -i '' -E "s/console\.log\(/logger.info(/g" "$file"
  
  # Replace console.warn with logger.warn  
  sed -i '' -E "s/console\.warn\(/logger.warn(/g" "$file"
  
  echo "✓ Done: $file"
done

echo"
All files processed!"
