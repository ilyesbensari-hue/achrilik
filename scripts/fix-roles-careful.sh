#!/bin/bash
# More careful approach: replace user.role checks ONE API route at a time

echo "🔧 Fixing user.role in API routes systematically..."

# Fix admin auth checks - more targeted sed
find src/app/api -name "*.ts" -type f -print0 | while IFS= read -r -d '' file; do
  if grep -q "user\.role" "$file"; then
    echo "Fixing: $file"
    
    # Add import if hasRole is going to be used
    if ! grep -q "import.*hasRole" "$file"; then
      sed -i '' '1a\
import { hasRole, hasAnyRole } from "@/lib/role-helpers";
' "$file"
    fi
    
    # Replace user.role checks
    sed -i '' \
      -e "s/user\.role !== 'ADMIN'/!hasRole(user, 'ADMIN')/g" \
      -e "s/user\.role === 'ADMIN'/hasRole(user, 'ADMIN')/g" \
      -e "s/user\.role !== 'SELLER'/!hasRole(user, 'SELLER')/g" \
      -e "s/user\.role === 'SELLER'/hasRole(user, 'SELLER')/g" \
      -e "s/user\.role !== 'BUYER'/!hasRole(user, 'BUYER')/g" \
      -e "s/user\.role === 'BUYER'/hasRole(user, 'BUYER')/g" \
      -e "s/user\.role !== 'DELIVERY_AGENT'/!hasRole(user, 'DELIVERY_AGENT')/g" \
      -e "s/user\.role === 'DELIVERY_AGENT'/hasRole(user, 'DELIVERY_AGENT')/g" \
      "$file"
  fi
done

echo "✅ API routes fixed"
