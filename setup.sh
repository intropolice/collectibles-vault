#!/bin/bash

# CollectiblesVault Setup Script
# This script automates the setup process for the FastAPI backend

set -e

echo "======================================"
echo "CollectiblesVault Setup Script"
echo "======================================"
echo ""

# Check Python version
echo "Checking Python version..."
python3 --version || { echo "Python 3 is not installed"; exit 1; }

# Create virtual environment
echo ""
echo "Creating virtual environment..."
if [ -d "venv" ]; then
    echo "Virtual environment already exists. Skipping..."
else
    python3 -m venv venv
    echo "✓ Virtual environment created"
fi

# Activate virtual environment
echo ""
echo "Activating virtual environment..."
source venv/bin/activate || { echo "Failed to activate venv"; exit 1; }
echo "✓ Virtual environment activated"

# Upgrade pip
echo ""
echo "Upgrading pip..."
pip install --upgrade pip >/dev/null 2>&1
echo "✓ Pip upgraded"

# Install dependencies
echo ""
echo "Installing dependencies..."
pip install -r requirements.txt
echo "✓ Dependencies installed"

# Create .env file if it doesn't exist
echo ""
echo "Setting up environment variables..."
if [ -f ".env" ]; then
    echo ".env file already exists. Skipping..."
else
    cp .env.example .env
    echo "✓ Created .env from .env.example"
    echo "⚠ Please edit .env with your PostgreSQL credentials"
fi

# Create uploads directory
echo ""
echo "Creating uploads directory..."
mkdir -p uploads
echo "✓ Uploads directory created"

# Summary
echo ""
echo "======================================"
echo "Setup Complete!"
echo "======================================"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your PostgreSQL credentials:"
echo "   nano .env"
echo ""
echo "2. Set up PostgreSQL database:"
echo "   - Create user: collectibles_user"
echo "   - Create database: collectibles_vault"
echo ""
echo "3. Run the server:"
echo "   python main.py"
echo ""
echo "4. Visit API documentation:"
echo "   http://localhost:8000/api/docs"
echo ""
echo "For detailed setup instructions, see QUICKSTART.md"
echo "======================================"
