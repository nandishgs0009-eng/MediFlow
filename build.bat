@echo off
REM MediFlow - Build and Deployment Helper Script
REM Run this to build for deployment

setlocal enabledelayedexpansion

:menu
cls
echo.
echo ========================================
echo   MediFlow - Build & Deploy Helper
echo ========================================
echo.
echo Choose what you want to do:
echo.
echo 1. Build Web App for Production
echo 2. Build Mobile APK for Android
echo 3. Build Mobile AAB for Play Store
echo 4. Run Local Development Server
echo 5. Install Dependencies
echo 6. Run Backend Tests
echo 7. Clean Build Artifacts
echo 8. Exit
echo.
set /p choice="Enter your choice (1-8): "

if "%choice%"=="1" goto build_web
if "%choice%"=="2" goto build_apk
if "%choice%"=="3" goto build_aab
if "%choice%"=="4" goto dev_server
if "%choice%"=="5" goto install_deps
if "%choice%"=="6" goto run_tests
if "%choice%"=="7" goto clean_build
if "%choice%"=="8" goto end

echo Invalid choice. Please try again.
pause
goto menu

:build_web
echo.
echo Building web app for production...
echo.
cd client
call npm run build
if %errorlevel% equ 0 (
    echo.
    echo ✓ Web build successful!
    echo.
    echo Build location: client\dist
    echo Ready to deploy to Vercel or Render
) else (
    echo.
    echo ✗ Web build failed!
    echo Check the errors above
)
cd ..
pause
goto menu

:build_apk
echo.
echo Building Android APK...
echo.
echo Make sure you have:
echo - Expo CLI installed (npm install -g expo-cli)
echo - Expo account created (expo login)
echo.
pause
cd mobile
call eas build --platform android --type apk
if %errorlevel% equ 0 (
    echo.
    echo ✓ APK build successful!
    echo.
    echo Download link provided above
    echo Install on Android device with Unknown Sources enabled
) else (
    echo.
    echo ✗ APK build failed!
)
cd ..
pause
goto menu

:build_aab
echo.
echo Building Android AAB for Play Store...
echo.
cd mobile
call eas build --platform android --type app-bundle
if %errorlevel% equ 0 (
    echo.
    echo ✓ AAB build successful!
    echo.
    echo Ready to submit to Google Play Store
) else (
    echo.
    echo ✗ AAB build failed!
)
cd ..
pause
goto menu

:dev_server
echo.
echo Starting development server...
echo.
echo Frontend: http://localhost:5173
echo Backend: http://localhost:5000
echo.
call npm run dev
pause
goto menu

:install_deps
echo.
echo Installing dependencies...
echo.
call npm install
echo.
echo ✓ Dependencies installed
echo.
pause
goto menu

:run_tests
echo.
echo Running backend tests...
echo.
cd server
call npm test
cd ..
pause
goto menu

:clean_build
echo.
echo Cleaning build artifacts...
echo.
if exist "client\dist" (
    rmdir /s /q client\dist
    echo ✓ Removed client\dist
)
if exist "server\dist" (
    rmdir /s /q server\dist
    echo ✓ Removed server\dist
)
if exist "mobile\.eas" (
    rmdir /s /q mobile\.eas
    echo ✓ Removed mobile\.eas
)
echo.
echo ✓ Clean complete
echo.
pause
goto menu

:end
echo.
echo Goodbye!
echo.
exit /b 0
