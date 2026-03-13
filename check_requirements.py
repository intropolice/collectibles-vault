#!/usr/bin/env python3
"""
CollectiblesVault Requirements Verification Script
Verifies that all dependencies can be installed and basic imports work
"""

import sys
import subprocess

def check_python_version():
    """Check if Python version is 3.9 or higher"""
    print("Checking Python version...")
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 9):
        print(f"❌ Python 3.9+ required, but got {version.major}.{version.minor}")
        return False
    print(f"✓ Python {version.major}.{version.minor}.{version.micro}")
    return True


def check_dependencies():
    """Check if key dependencies are available"""
    requirements = [
        'fastapi',
        'uvicorn',
        'sqlalchemy',
        'psycopg2',
        'pydantic',
        'passlib',
        'jose',
        'reportlab',
    ]
    
    print("\nChecking dependencies...")
    missing = []
    
    for package in requirements:
        try:
            __import__(package.replace('-', '_'))
            print(f"✓ {package}")
        except ImportError:
            missing.append(package)
            print(f"❌ {package}")
    
    return len(missing) == 0, missing


def check_postgresql():
    """Try to check if PostgreSQL client is available"""
    print("\nChecking PostgreSQL client...")
    try:
        result = subprocess.run(['psql', '--version'], capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✓ PostgreSQL client: {result.stdout.strip()}")
            return True
    except FileNotFoundError:
        print("⚠ PostgreSQL client not found (you can still use remote PostgreSQL)")
    return None


def check_docker():
    """Check if Docker is available"""
    print("\nChecking Docker...")
    try:
        result = subprocess.run(['docker', '--version'], capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✓ {result.stdout.strip()}")
            return True
    except FileNotFoundError:
        print("⚠ Docker not found (optional for development)")
    return None


def main():
    """Main verification function"""
    print("=" * 50)
    print("CollectiblesVault Requirements Verification")
    print("=" * 50)
    
    all_ok = True
    
    # Check Python version
    if not check_python_version():
        all_ok = False
    
    # Check dependencies
    deps_ok, missing = check_dependencies()
    if not deps_ok:
        all_ok = False
        print(f"\n⚠ Missing packages: {', '.join(missing)}")
        print("Run: pip install -r requirements.txt")
    
    # Check PostgreSQL (optional)
    postgres_available = check_postgresql()
    
    # Check Docker (optional)
    docker_available = check_docker()
    
    # Print summary
    print("\n" + "=" * 50)
    if all_ok:
        print("✅ All basic requirements met!")
        print("\nNext steps:")
        print("1. Configure .env file with your database credentials")
        print("2. Set up PostgreSQL database")
        print("3. Run: python main.py")
    else:
        print("❌ Some requirements are missing")
        print("\nPlease install missing packages:")
        print("pip install -r requirements.txt")
    
    if postgres_available is False:
        print("\n⚠ PostgreSQL client not found locally")
        print("You can still use a remote PostgreSQL server")
    
    if docker_available is True:
        print("\n✓ Docker available - you can use docker-compose!")
        print("Run: docker-compose up")
    
    print("=" * 50)
    
    return 0 if all_ok else 1


if __name__ == "__main__":
    sys.exit(main())
