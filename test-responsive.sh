#!/bin/bash

# Achrilik Responsive Audit Script
# Tests tous les viewports et génère un rapport

set -e

echo "🔍 Achrilik Responsive Audit"
echo "=============================="
echo ""

# Configuration
PROJECT_ROOT="/Users/ilyes/.gemini/antigravity/scratch/dz-shop"
REPORT_FILE="$PROJECT_ROOT/responsive-audit-report.txt"
URL="http://localhost:3000"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if server is running
echo "1️⃣  Checking dev server..."
if ! curl -s "$URL" > /dev/null; then
    echo -e "${RED}❌ Server not running at $URL${NC}"
    echo "   Run: npm run dev"
    exit 1
fi
echo -e "${GREEN}✅ Server running${NC}"
echo ""

# # Initialize report
echo "Achrilik Responsive Audit Report" > "$REPORT_FILE"
echo "Generated: $(date)" >> "$REPORT_FILE"
echo "========================================" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Test viewport meta tag
echo "2️⃣  Testing Viewport Meta Tag..."
VIEWPORT_CHECK=$(curl -s "$URL" | grep -o 'viewport' | wc -l)
if [ "$VIEWPORT_CHECK" -gt 0 ]; then
    echo -e "${GREEN}✅ Viewport meta tag found${NC}"
    echo "✅ Viewport meta tag: PRESENT" >> "$REPORT_FILE"
else
    echo -e "${RED}❌ Viewport meta tag missing!${NC}"
    echo "❌ Viewport meta tag: MISSING (CRITICAL BUG)" >> "$REPORT_FILE"
fi
echo "" >> "$REPORT_FILE"

# Check for mobile-first classes
echo "3️⃣  Analyzing Tailwind classes..."
echo ""
echo "Checking responsive patterns..." >> "$REPORT_FILE"

# Count md: prefixes (desktop-first indicator)
MD_COUNT=$(grep -r "className.*md:" "$PROJECT_ROOT/src/components/home" | wc -l | tr -d ' ')
echo "   md: breakpoint usage: $MD_COUNT occurrences"
echo "- md: breakpoint: $MD_COUNT uses" >> "$REPORT_FILE"

# Count lg: prefixes
LG_COUNT=$(grep -r "className.*lg:" "$PROJECT_ROOT/src/components/home" | wc -l | tr -d ' ')
echo "   lg: breakpoint usage: $LG_COUNT occurrences"
echo "- lg: breakpoint: $LG_COUNT uses" >> "$REPORT_FILE"

# Count xl: prefixes
XL_COUNT=$(grep -r "className.*xl:" "$PROJECT_ROOT/src/components/home" | wc -l | tr -d ' ')
echo "   xl: breakpoint usage: $XL_COUNT occurrences"
echo "- xl: breakpoint: $XL_COUNT uses" >> "$REPORT_FILE"

# Count 2xl: prefixes (new additions)
XL2_COUNT=$(grep -r "className.*2xl:" "$PROJECT_ROOT/src/components/home" | wc -l | tr -d ' ')
echo "   2xl: breakpoint usage: $XL2_COUNT occurrences (NEW)"
echo "- 2xl: breakpoint: $XL2_COUNT uses (NEW ADDITIONS)" >> "$REPORT_FILE"

echo -e "${GREEN}✅ Responsive classes analyzed${NC}"
echo "" >> "$REPORT_FILE"

# Check for common mobile bugs
echo "4️⃣  Checking for common mobile bugs..."
echo ""
echo "Common Mobile Bug Scan:" >> "$REPORT_FILE"

# Check for min-w-max (can cause overflow)
MIN_W_COUNT=$(grep -r "min-w-max" "$PROJECT_ROOT/src/components/home" | wc -l | tr -d ' ')
if [ "$MIN_W_COUNT" -gt 0 ]; then
    echo -e "   ${YELLOW}⚠️  Found $MIN_W_COUNT min-w-max (potential overflow)${NC}"
    echo "⚠️  min-w-max found: $MIN_W_COUNT (Review for overflow)" >> "$REPORT_FILE"
else
    echo -e "   ${GREEN}✅ No problematic min-w-max${NC}"
    echo "✅ min-w-max: Not found" >> "$REPORT_FILE"
fi

# Check for fixed widths without responsive variants
FIXED_W_COUNT=$(grep -r "w-\[.*px\]" "$PROJECT_ROOT/src/components/home" | grep -v "md:" | wc -l | tr -d ' ')
if [ "$FIXED_W_COUNT" -gt 0 ]; then
    echo -e "   ${YELLOW}⚠️  Found $FIXED_W_COUNT fixed widths without responsive variants${NC}"
    echo "⚠️  Fixed widths: $FIXED_W_COUNT (Review mobile compatibility)" >> "$REPORT_FILE"
else
    echo -e "   ${GREEN}✅ No problematic fixed widths${NC}"
    echo "✅ Fixed widths: Responsive variants present" >> "$REPORT_FILE"
fi

echo "" >> "$REPORT_FILE"

# Check BottomNav visibility
echo "5️⃣  Verifying mobile-only components..."
BOTTOM_NAV_HIDDEN=$(grep -r "md:hidden" "$PROJECT_ROOT/src/components/home/BottomNav.tsx" | wc -l | tr -d ' ')
if [ "$BOTTOM_NAV_HIDDEN" -gt 0 ]; then
    echo -e "   ${GREEN}✅ BottomNav has md:hidden${NC}"
    echo "✅ BottomNav: Correctly hidden on desktop (md:hidden)" >> "$REPORT_FILE"
else
    echo -e "   ${RED}❌ BottomNav missing md:hidden!${NC}"
    echo "❌ BottomNav: Missing md:hidden (will show on desktop)" >> "$REPORT_FILE"
fi
echo "" >> "$REPORT_FILE"

# Component-specific checks
echo "6️⃣  Component-Specific Analysis..."
echo ""
echo "Component Details:" >> "$REPORT_FILE"

# HeroVideoBanner
HERO_HEIGHTS=$(grep -o "h-\[[0-9]*px\]" "$PROJECT_ROOT/src/components/home/HeroVideoBanner.tsx" | wc -l | tr -d ' ')
echo "   Hero Banner responsive heights: $HERO_HEIGHTS variants"
echo "- HeroVideoBanner: $HERO_HEIGHTS height variants" >> "$REPORT_FILE"

# CategoryCircles
CAT_SIZES=$(grep -o "w-[0-9]*\|w-\[[0-9]*rem\]" "$PROJECT_ROOT/src/components/home/CategoryCircles.tsx" | wc -l | tr -d ' ')
echo "   Category Circles size variants: $CAT_SIZES"
echo "- CategoryCircles: $CAT_SIZES size variants" >> "$REPORT_FILE"

# ClothingProductSections
GRID_COLS=$(grep -o "grid-cols-[0-9]" "$PROJECT_ROOT/src/components/home/ClothingProductSections.tsx" | wc -l | tr -d ' ')
echo "   Product Grid column variants: $GRID_COLS"
echo "- ClothingProductSections: $GRID_COLS grid variants" >> "$REPORT_FILE"

echo -e "${GREEN}✅ Component analysis complete${NC}"
echo "" >> "$REPORT_FILE"

# Summary
echo ""
echo "7️⃣  Generating Summary..."
echo ""
echo "========================================" >> "$REPORT_FILE"
echo "SUMMARY" >> "$REPORT_FILE"
echo "========================================" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Calculate score
SCORE=0
MAX_SCORE=5

[ "$VIEWPORT_CHECK" -gt 0 ] && ((SCORE++))
[ "$BOTTOM_NAV_HIDDEN" -gt 0 ] && ((SCORE++))
[ "$MD_COUNT" -gt 30 ] && ((SCORE++))
[ "$XL2_COUNT" -gt 0 ] && ((SCORE++))
[ "$MIN_W_COUNT" -lt 3 ] && ((SCORE++))

PERCENTAGE=$((SCORE * 100 / MAX_SCORE))

echo "Responsive Score: $SCORE/$MAX_SCORE ($PERCENTAGE%)" >> "$REPORT_FILE"
echo ""

if [ "$PERCENTAGE" -ge 80 ]; then
    echo -e "${GREEN}✅ OVERALL STATUS: PASS ($PERCENTAGE%)${NC}"
    echo "Overall Status: ✅ PASS" >> "$REPORT_FILE"
elif [ "$PERCENTAGE" -ge 60 ]; then
    echo -e "${YELLOW}⚠️  OVERALL STATUS: WARNING ($PERCENTAGE%)${NC}"
    echo "Overall Status: ⚠️  WARNING" >> "$REPORT_FILE"
else
    echo -e "${RED}❌ OVERALL STATUS: FAIL ($PERCENTAGE%)${NC}"
    echo "Overall Status: ❌ FAIL" >> "$REPORT_FILE"
fi

echo "" >> "$REPORT_FILE"
echo "Critical Items:" >> "$REPORT_FILE"
[ "$VIEWPORT_CHECK" -eq 0 ] && echo "- ❌ Add viewport meta tag" >> "$REPORT_FILE"
[ "$BOTTOM_NAV_HIDDEN" -eq 0 ] && echo "- ❌ Hide BottomNav on desktop" >> "$REPORT_FILE"
[ "$MIN_W_COUNT" -gt 3 ] && echo "- ⚠️  Review min-w-max usage" >> "$REPORT_FILE"

echo "" >> "$REPORT_FILE"
echo "Enhancements Applied:" >> "$REPORT_FILE"
[ "$XL2_COUNT" -gt 0 ] && echo "- ✅ 2xl breakpoints added" >> "$REPORT_FILE"
[ "$HERO_HEIGHTS" -gt 2 ] && echo "- ✅ Hero Banner responsive heights" >> "$REPORT_FILE"
[ "$GRID_COLS" -gt 5 ] && echo "- ✅ Product Grid multiple breakpoints" >> "$REPORT_FILE"

# Final output
echo ""
echo "=========================================="
echo "📄 Report saved to: $REPORT_FILE"
echo "=========================================="
echo ""

# Display report
cat "$REPORT_FILE"

echo ""
echo "📸 Next Steps:"
echo "   1. Open browser DevTools (Cmd+Shift+M)"
echo "   2. Test viewports: 375×667, 768×1024, 1920×1080, 2560×1440"
echo "   3. Take screenshots for each viewport"
echo "   4. Run Lighthouse audit"
echo ""

exit 0
