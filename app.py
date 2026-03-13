"""
Entry point for the application
This file starts the backend server
"""
import sys
import os

# Add backend folder to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

# Import the app from backend
from main import app

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
