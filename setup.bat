@echo off
REM CollectiblesVault Setup Script for Windows
REM This script automates the setup process for the FastAPI backend

echo ======================================
echo CollectiblesVault Setup Script
echo ======================================
echo.

REM Check Python version
echo Checking Python version...
python --version >nul 2>&1
if errorlevel 1 (
    echo Python is not installed or not in PATH
    pause
    exit /b 1
)
python --version

REM Create virtual environment
echo.
echo Creating virtual environment...
if exist "venv" (
    echo Virtual environment already exists. Skipping...
) else (
    python -m venv venv
    echo Virtual environment created
)

REM Activate virtual environment
echo.
echo Activating virtual environment...
call venv\Scripts\activate.bat
if errorlevel 1 (
    echo Failed to activate virtual environment
    pause
    exit /b 1
)
echo Virtual environment activated

REM Upgrade pip
echo.
echo Upgrading pip...
python -m pip install --upgrade pip >nul 2>&1
echo Pip upgraded

REM Install dependencies
echo.
echo Installing dependencies...
pip install -r requirements.txt
if errorlevel 1 (
    echo Failed to install dependencies
    pause
    exit /b 1
)
echo Dependencies installed

REM Create .env file if it doesn't exist
echo.
echo Setting up environment variables...
if exist ".env" (
    echo .env file already exists. Skipping...
) else (
    copy .env.example .env
    echo Created .env from .env.example
    echo.
    echo WARNING: Please edit .env with your PostgreSQL credentials
)

REM Create uploads directory
echo.
echo Creating uploads directory...
if not exist "uploads" mkdir uploads
echo Uploads directory created

REM Summary
echo.
echo ======================================
echo Setup Complete!
echo ======================================
echo.
echo Next steps:
echo 1. Edit .env file with your PostgreSQL credentials
echo.
echo 2. Set up PostgreSQL database:
echo    - Create user: collectibles_user
echo    - Create database: collectibles_vault
echo.
echo 3. Run the server:
echo    python main.py
echo.
echo 4. Visit API documentation:
echo    http://localhost:8000/api/docs
echo.
echo For detailed setup instructions, see QUICKSTART.md
echo ======================================
echo.
pause
