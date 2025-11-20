#!/bin/bash

echo "🔍 MediFlow - Application Verification Checklist"
echo "=================================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check 1: Node version
echo "1️⃣  Checking Node.js version..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✓${NC} Node.js $NODE_VERSION installed"
else
    echo -e "${RED}✗${NC} Node.js not found"
fi

# Check 2: npm dependencies
echo ""
echo "2️⃣  Checking npm dependencies..."
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓${NC} Dependencies installed"
else
    echo -e "${YELLOW}⚠${NC} Run: npm install"
fi

# Check 3: .env file
echo ""
echo "3️⃣  Checking .env file..."
if [ -f ".env" ]; then
    echo -e "${GREEN}✓${NC} .env file exists"
    if grep -q "DATABASE_URL" .env; then
        echo -e "${GREEN}✓${NC} DATABASE_URL configured"
    else
        echo -e "${RED}✗${NC} DATABASE_URL not found in .env"
    fi
else
    echo -e "${RED}✗${NC} .env file not found"
fi

# Check 4: Frontend pages
echo ""
echo "4️⃣  Checking frontend pages..."
PAGES=(
    "client/src/pages/landing.tsx"
    "client/src/pages/patient-overview.tsx"
    "client/src/pages/patient-dashboard.tsx"
    "client/src/pages/admin-dashboard.tsx"
    "client/src/pages/admin-patients.tsx"
)

for page in "${PAGES[@]}"; do
    if [ -f "$page" ]; then
        echo -e "${GREEN}✓${NC} $page"
    else
        echo -e "${RED}✗${NC} $page missing"
    fi
done

# Check 5: Backend files
echo ""
echo "5️⃣  Checking backend files..."
BACKEND=(
    "server/index.ts"
    "server/routes.ts"
    "server/db.ts"
    "server/storage.ts"
)

for file in "${BACKEND[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file"
    else
        echo -e "${RED}✗${NC} $file missing"
    fi
done

# Check 6: Shared schema
echo ""
echo "6️⃣  Checking shared schema..."
if [ -f "shared/schema.ts" ]; then
    echo -e "${GREEN}✓${NC} shared/schema.ts exists"
else
    echo -e "${RED}✗${NC} shared/schema.ts missing"
fi

# Check 7: Config files
echo ""
echo "7️⃣  Checking config files..."
CONFIG=(
    "vite.config.ts"
    "tsconfig.json"
    "tailwind.config.ts"
    "drizzle.config.ts"
)

for file in "${CONFIG[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file"
    else
        echo -e "${RED}✗${NC} $file missing"
    fi
done

echo ""
echo "=================================================="
echo "✅ Verification complete!"
echo ""
echo "📝 Next steps:"
echo "1. Verify .env file has DATABASE_URL"
echo "2. Run: npm install"
echo "3. Run: npm run dev"
echo "4. Open: http://localhost:5000"
