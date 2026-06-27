@echo off
echo ===================================================
echo   Al Qua'a Pulse - Build, Push, and Run Script
echo ===================================================

echo.
echo [1/4] Installing dependencies...
call pnpm install --config.minimumReleaseAge=0 --no-frozen-lockfile
if %ERRORLEVEL% neq 0 (
    echo Error installing dependencies.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [2/4] Building the project...
call pnpm build
if %ERRORLEVEL% neq 0 (
    echo Error during build process.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [3/4] Pushing to GitHub...
:: Ensure the remote is set correctly
git remote set-url origin https://github.com/mo7ned-art/Challenge-3-Al-Qua-Pulse-Plan.git 2>nul || git remote add origin https://github.com/mo7ned-art/Challenge-3-Al-Qua-Pulse-Plan.git

git add .
:: Use a generic message, or skip commit if no changes
git commit -m "Auto-commit: Build and deploy"
git push -u origin main
if %ERRORLEVEL% neq 0 (
    echo Warning: Failed to push to GitHub (or no changes to push).
) else (
    echo Successfully pushed to GitHub!
)

echo.
echo [4/4] Starting the local server...
echo The application will now run on http://localhost:3000 (or the next available port).
echo Press Ctrl+C to stop the server.
call pnpm start
pause
