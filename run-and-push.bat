@echo off
echo ===================================================
echo   Al Qua'a Pulse - Build, Push, and Run Script
echo ===================================================

echo.
echo [1/3] Installing dependencies...
call pnpm install --config.minimumReleaseAge=0 --no-frozen-lockfile
if %ERRORLEVEL% neq 0 (
    echo Error installing dependencies.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [2/3] Building the project...
call pnpm build
if %ERRORLEVEL% neq 0 (
    echo Error during build process.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [3/3] Starting the local server...
echo The application will now run on http://localhost:3000 (or the next available port).
echo Press Ctrl+C to stop the server.
cmd /k "pnpm start"
