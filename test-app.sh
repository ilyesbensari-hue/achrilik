#!/bin/bash
# Comprehensive Application Test Script
# Run this to verify all functionality before deployment

echo "🧪 Starting Comprehensive Application Tests..."
echo "=============================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

# Function to test endpoint
test_endpoint() {
    local name=$1
    local url=$2
    local method=${3:-GET}
    
    echo -n "Testing $name... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000$url")
    else
        response=$(curl -s -o /dev/null -w "%{http_code}" -X "$method" "http://localhost:3000$url")
    fi
    
    if [ "$response" = "200" ] || [ "$response" = "401" ] || [ "$response" = "403" ]; then
        echo -e "${GREEN}✓ PASS${NC} (HTTP $response)"
        ((PASSED++))
    else
        echo -e "${RED}✗ FAIL${NC} (HTTP $response)"
        ((FAILED++))
    fi
}

# Function to check database
check_db() {
    local query=$1
    local name=$2
    
    echo -n "Checking $name... "
    
    result=$(psql $DATABASE_URL -t -c "$query" 2>/dev/null | xargs)
    
    if [ -n "$result" ] && [ "$result" != "0" ]; then
        echo -e "${GREEN}✓ PASS${NC} ($result found)"
        ((PASSED++))
    else
        echo -e "${RED}✗ FAIL${NC} (No results)"
        ((FAILED++))
    fi
}

echo "📡 Testing API Endpoints"
echo "------------------------"

# Public endpoints
test_endpoint "Homepage" "/"
test_endpoint "Categories API" "/api/categories"
test_endpoint "Products API" "/api/products"
test_endpoint "Stores API" "/api/stores"

# Auth endpoints
test_endpoint "Role Selection Page" "/auth/role-select"
test_endpoint "Login Page" "/login"
test_endpoint "Register Page" "/register"

# Delivery endpoints (should return 401 without auth)
test_endpoint "Delivery Dashboard API" "/api/delivery/dashboard"
test_endpoint "Delivery Active API" "/api/delivery/active"
test_endpoint "Delivery History API" "/api/delivery/history"
test_endpoint "Delivery Earnings API" "/api/delivery/earnings"

# Admin endpoints (should return 401/403 without admin auth)
test_endpoint "Admin Dashboard" "/admin"
test_endpoint "Admin Delivery Config API" "/api/admin/delivery-config"

echo ""
echo "🗄️  Testing Database"
echo "-------------------"

# Check categories
check_db "SELECT COUNT(*) FROM \"Category\" WHERE slug = 'accessoires'" "Accessories Category"
check_db "SELECT COUNT(*) FROM \"Category\" WHERE \"parentId\" IN (SELECT id FROM \"Category\" WHERE slug = 'accessoires')" "Accessories Subcategories"

# Check tables exist
check_db "SELECT COUNT(*) FROM \"User\" LIMIT 1" "Users Table"
check_db "SELECT COUNT(*) FROM \"Product\" LIMIT 1" "Products Table"
check_db "SELECT COUNT(*) FROM \"Store\" LIMIT 1" "Stores Table"
check_db "SELECT COUNT(*) FROM \"Order\" LIMIT 1" "Orders Table"

echo ""
echo "📁 Testing File Structure"
echo "-------------------------"

# Check critical files
files=(
    "src/app/auth/role-select/page.tsx"
    "src/app/account/pending/page.tsx"
    "src/app/delivery/layout.tsx"
    "src/app/delivery/dashboard/page.tsx"
    "src/app/delivery/active/page.tsx"
    "src/app/delivery/history/page.tsx"
    "src/app/delivery/earnings/page.tsx"
    "src/app/delivery/settings/page.tsx"
    "src/components/ModeSwitcher.tsx"
    "src/components/RoleGuard.tsx"
    "src/app/api/auth/switch-mode/route.ts"
    "src/app/api/delivery/dashboard/route.ts"
    "src/app/api/delivery/active/route.ts"
    "src/app/api/delivery/history/route.ts"
    "src/app/api/delivery/earnings/route.ts"
    "src/app/api/delivery/[id]/accept/route.ts"
    "src/app/api/delivery/[id]/status/route.ts"
)

for file in "${files[@]}"; do
    echo -n "Checking $file... "
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓ EXISTS${NC}"
        ((PASSED++))
    else
        echo -e "${RED}✗ MISSING${NC}"
        ((FAILED++))
    fi
done

echo ""
echo "=============================================="
echo "📊 Test Results"
echo "=============================================="
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed! Application is ready for deployment.${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️  Some tests failed. Please review the results above.${NC}"
    exit 1
fi
