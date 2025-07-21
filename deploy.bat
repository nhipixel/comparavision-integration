@echo off
setlocal enabledelayedexpansion

REM ComparaVision Integration Deployment Script for Windows
REM This script sets up and deploys the full-stack application

echo 🚀 Starting ComparaVision Integration Deployment...

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed. Please install Node.js 18+ first.
    exit /b 1
)

echo [SUCCESS] Node.js version: 
node --version

REM Check if Docker is installed (optional)
docker --version >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Docker not found. Will use local development mode.
    set DOCKER_AVAILABLE=false
) else (
    echo [SUCCESS] Docker is available
    set DOCKER_AVAILABLE=true
)

REM Parse command line arguments
set OPTION=%1

if "%OPTION%"=="--docker" goto :docker_deploy
if "%OPTION%"=="--configure" goto :setup_env
if "%OPTION%"=="--build" goto :build_app
if "%OPTION%"=="--start" goto :start_app
if "%OPTION%"=="--full" goto :full_deploy
goto :show_help

:install_dependencies
echo [INFO] Installing dependencies...
call npm install
cd backend
call npm install
cd ..
cd frontend
call npm install
cd ..
echo [SUCCESS] Dependencies installed successfully
goto :eof

:setup_env
echo [INFO] Setting up environment files...
if not exist "backend\env" (
    echo [WARNING] Backend environment file not found. Creating template...
    copy backend\env backend\env.example >nul 2>&1
)
if not exist "frontend\env.local" (
    echo [WARNING] Frontend environment file not found. Creating template...
    copy frontend\env.local frontend\env.local.example >nul 2>&1
)
echo [WARNING] Please configure your environment files:
echo [WARNING]   - backend\env
echo [WARNING]   - frontend\env.local
echo [WARNING] Then run this script again with --configure flag
goto :eof

:build_app
echo [INFO] Building the application...
cd frontend
call npm run build
cd ..
echo [SUCCESS] Application built successfully
goto :eof

:start_app
echo [INFO] Starting the application...
call npm run dev
echo [SUCCESS] Application started!
echo [SUCCESS] Frontend: http://localhost:3000
echo [SUCCESS] Backend: http://localhost:3001
echo [SUCCESS] Health Check: http://localhost:3001/health
goto :eof

:docker_deploy
if "%DOCKER_AVAILABLE%"=="false" (
    echo [ERROR] Docker is not available. Cannot deploy with Docker.
    exit /b 1
)
echo [INFO] Deploying with Docker...
docker-compose up --build -d
echo [SUCCESS] Docker deployment completed!
echo [SUCCESS] Frontend: http://localhost:3000
echo [SUCCESS] Backend: http://localhost:3001
echo [SUCCESS] Database: localhost:5432
goto :eof

:full_deploy
call :install_dependencies
call :setup_env
call :build_app
call :start_app
goto :eof

:show_help
echo Usage: %0 [OPTION]
echo.
echo Options:
echo   --docker     Deploy using Docker
echo   --configure  Setup environment files
echo   --build      Build the application
echo   --start      Start the application
echo   --full       Full deployment (recommended)
echo.
echo Examples:
echo   %0 --full        # Complete setup and start
echo   %0 --docker      # Deploy with Docker
echo   %0 --configure   # Setup environment only
goto :eof 