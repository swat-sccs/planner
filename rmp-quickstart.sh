#!/bin/bash

# Quick Start Guide for RMP Integration Testing
# Run this script to verify the RMP scraper setup

echo "================================================"
echo "RMP Integration - Quick Start & Verification"
echo "================================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: Run this script from the project root directory${NC}"
    exit 1
fi

echo -e "${YELLOW}Step 1: Checking required files...${NC}"
sleep 1

FILES=(
    "rmpscraper/scraper.py"
    "rmpscraper/requirements.txt"
    "rmpscraper/README.md"
    "Dockerfile.rmp-cron"
    "rmp-crontab_file"
    "rmp-cron-startup.sh"
    "components/RMPBadge.tsx"
    "components/RatingOverTimeGraph.tsx"
    "prisma/migrations/20241030000000_add_rmp_fields/migration.sql"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} Found: $file"
    else
        echo -e "${RED}✗${NC} Missing: $file"
    fi
done

echo ""
echo -e "${YELLOW}Step 2: Checking package.json for recharts...${NC}"
sleep 1

if grep -q "recharts" package.json; then
    echo -e "${GREEN}✓${NC} recharts dependency found in package.json"
else
    echo -e "${RED}✗${NC} recharts dependency not found in package.json"
fi

echo ""
echo -e "${YELLOW}Step 3: Checking Docker Compose configuration...${NC}"
sleep 1

if grep -q "planner-rmp-cron" docker-compose.yml; then
    echo -e "${GREEN}✓${NC} RMP cron service found in docker-compose.yml"
else
    echo -e "${RED}✗${NC} RMP cron service not found in docker-compose.yml"
fi

echo ""
echo -e "${YELLOW}Step 4: Checking database schema...${NC}"
sleep 1

if grep -q "isRMP" prisma/schema.prisma; then
    echo -e "${GREEN}✓${NC} RMP fields found in schema.prisma"
else
    echo -e "${RED}✗${NC} RMP fields not found in schema.prisma"
fi

echo ""
echo "================================================"
echo -e "${GREEN}Next Steps:${NC}"
echo "================================================"
echo ""
echo "1. Install dependencies:"
echo "   npm install"
echo ""
echo "2. Test Python scraper locally (optional):"
echo "   cd rmpscraper"
echo "   pip3 install -r requirements.txt"
echo "   python3 scraper.py"
echo ""
echo "3. Apply database migration:"
echo "   npx prisma migrate deploy"
echo ""
echo "4. Build and start Docker containers:"
echo "   docker-compose build"
echo "   docker-compose up -d"
echo ""
echo "5. Monitor RMP scraper logs:"
echo "   docker logs -f planner-rmp-cron"
echo ""
echo "6. Test the UI:"
echo "   - Visit http://localhost:3000/profs"
echo "   - Click on a professor"
echo "   - Look for RMP badges and rating graph"
echo ""
echo "================================================"
echo -e "${YELLOW}Important Notes:${NC}"
echo "================================================"
echo ""
echo "• The scraper runs automatically every hour"
echo "• RMP ratings are marked with a yellow badge"
echo "• Clicking the badge opens the RMP profile"
echo "• The rating graph shows data over time"
echo "• First run may take several minutes"
echo ""
echo "For more information, see:"
echo "  - rmpscraper/README.md"
echo "  - RMP_INTEGRATION_SUMMARY.md"
echo ""
echo "================================================"

