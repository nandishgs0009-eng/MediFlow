@echo off
setlocal enabledelayedexpansion

echo.
echo 🔍 MediFlow - Application Verification Checklist
echo ==================================================
echo.

REM Check 1: Node version
echo 1️⃣  Checking Node.js version...
node -v >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
    echo ✓ Node.js !NODE_VERSION! installed
) else (
    echo ✗ Node.js not found
)

REM Check 2: npm dependencies
echo.
echo 2️⃣  Checking npm dependencies...
if exist "node_modules" (
    echo ✓ Dependencies installed
) else (
    echo ⚠ Run: npm install
)

REM Check 3: .env file
echo.
echo 3️⃣  Checking .env file...
if exist ".env" (
    echo ✓ .env file exists
    findstr /M "DATABASE_URL" .env >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✓ DATABASE_URL configured
    ) else (
        echo ✗ DATABASE_URL not found in .env
    )
) else (
    echo ✗ .env file not found
)

REM Check 4: Frontend pages
echo.
echo 4️⃣  Checking frontend pages...
setlocal enabledelayedexpansion
set "PAGES[0]=client\src\pages\landing.tsx"
set "PAGES[1]=client\src\pages\patient-overview.tsx"
set "PAGES[2]=client\src\pages\patient-dashboard.tsx"
set "PAGES[3]=client\src\pages\admin-dashboard.tsx"
set "PAGES[4]=client\src\pages\admin-patients.tsx"

for /l %%i in (0,1,4) do (
    if exist "!PAGES[%%i]!" (
        echo ✓ !PAGES[%%i]!
    ) else (
        echo ✗ !PAGES[%%i]! missing
    )
)

REM Check 5: Backend files
echo.
echo 5️⃣  Checking backend files...
setlocal enabledelayedexpansion
set "BACKEND[0]=server\index.ts"
set "BACKEND[1]=server\routes.ts"
set "BACKEND[2]=server\db.ts"
set "BACKEND[3]=server\storage.ts"

for /l %%i in (0,1,3) do (
    if exist "!BACKEND[%%i]!" (
        echo ✓ !BACKEND[%%i]!
    ) else (
        echo ✗ !BACKEND[%%i]! missing
    )
)

REM Check 6: Shared schema
echo.
echo 6️⃣  Checking shared schema...
if exist "shared\schema.ts" (
    echo ✓ shared\schema.ts exists
) else (
    echo ✗ shared\schema.ts missing
)

REM Check 7: Config files
echo.
echo 7️⃣  Checking config files...
setlocal enabledelayedexpansion
set "CONFIG[0]=vite.config.ts"
set "CONFIG[1]=tsconfig.json"
set "CONFIG[2]=tailwind.config.ts"
set "CONFIG[3]=drizzle.config.ts"

for /l %%i in (0,1,3) do (
    if exist "!CONFIG[%%i]!" (
        echo ✓ !CONFIG[%%i]!
    ) else (
        echo ✗ !CONFIG[%%i]! missing
    )
)

echo.
echo ==================================================
echo ✅ Verification complete!
echo.
echo 📝 Next steps:
echo 1. Verify .env file has DATABASE_URL
echo 2. Run: npm install
echo 3. Run: npm run dev
echo 4. Open: http://localhost:5000
echo.
pause
