#!/bin/bash
# Systematic fix: Replace all user.role checks with role-helper calls

echo "🔧 Fixing user.role -> roles array mismatch across all API routes..."

# Fix all admin auth checks in API routes
find src/app/api -name "*.ts" -type f -exec sed -i '' \
  -e "s/user\.role !== 'ADMIN'/!hasRole(user, 'ADMIN')/g" \
  -e "s/user\.role === 'ADMIN'/hasRole(user, 'ADMIN')/g" \
  -e "s/user\.role !== 'SELLER'/!hasRole(user, 'SELLER')/g" \
  -e "s/user\.role === 'SELLER'/hasRole(user, 'SELLER')/g" \
  -e "s/user\.role !== 'BUYER'/!hasRole(user, 'BUYER')/g" \
  -e "s/user\.role === 'BUYER'/hasRole(user, 'BUYER')/g" \
  {} +

# Add import for hasRole at the top of files that now use it
find src/app/api -name "*.ts" -type f -exec grep -l "hasRole(user" {} \; | while read file; do
  if ! grep -q "import.*hasRole" "$file"; then
    # Add import after other imports
    sed -i '' '/^import.*from/a\
import { hasRole, hasAnyRole } from "@/lib/role-helpers";
' "$file"
  fi
done

echo "✅ Fixed API routes"

# Fix components
find src/components -name "*.tsx" -type f -exec sed -i '' \
  -e "s/user\.role === 'ADMIN'/hasRole(user, 'ADMIN')/g" \
  -e "s/user\.role === 'SELLER'/hasRole(user, 'SELLER')/g" \
  -e "s/user\.role === 'BUYER'/hasRole(user, 'BUYER')/g" \
  {} +

echo "✅ Fixed components"

# Fix app pages
find src/app -name "*.tsx" -type f -exec sed -i '' \
  -e "s/user\.role !== 'ADMIN'/!hasRole(user, 'ADMIN')/g" \
  -e "s/user\.role === 'ADMIN'/hasRole(user, 'ADMIN')/g" \
  -e "s/user\.role !== 'SELLER'/!hasRole(user, 'SELLER')/g" \
  -e "s/user\.role === 'SELLER'/hasRole(user, 'SELLER')/g" \
  -e "s/user\.role !== 'DELIVERY_AGENT'/!hasRole(user, 'DELIVERY_AGENT')/g" \
  -e "s/user\.role === 'DELIVERY_AGENT'/hasRole(user, 'DELIVERY_AGENT')/g" \
  {} +

echo "✅ Fixed app pages"

echo "🎉 All user.role references updated to use hasRole helper!"
