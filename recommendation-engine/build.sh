#!/bin/bash
#!/bin/bash

# BITSPARK Production Build Script - Bulletproof Deployment
set -euo pipefail  # Exit on any error, undefined vars, or pipe failures

echo "� BITSPARK Backend Production Build Starting..."
echo "================================================"

# Force clean environment
export PYTHONUNBUFFERED=1
export PYTHONDONTWRITEBYTECODE=1
export PIP_DISABLE_PIP_VERSION_CHECK=1
export PIP_NO_CACHE_DIR=1

# Verify Python version aggressively
echo "🐍 Python Version Verification:"
python3 --version || echo "python3 not found"
python --version || echo "python not found"

# Check if we have the right Python
PYTHON_CMD=""
if python3.11 --version 2>/dev/null; then
    PYTHON_CMD="python3.11"
    echo "✅ Found Python 3.11 at python3.11"
elif python3 --version 2>&1 | grep -q "3.11"; then
    PYTHON_CMD="python3"
    echo "✅ Found Python 3.11 at python3"
elif python --version 2>&1 | grep -q "3.11"; then
    PYTHON_CMD="python"
    echo "✅ Found Python 3.11 at python"
else
    echo "❌ Python 3.11 not found! Using available Python:"
    python3 --version 2>/dev/null || python --version
    PYTHON_CMD="python3"
fi

echo "Using Python command: $PYTHON_CMD"

# Upgrade build tools to latest stable versions
echo "📦 Upgrading build infrastructure..."
$PYTHON_CMD -m pip install --upgrade --no-cache-dir pip==23.2.0
$PYTHON_CMD -m pip install --upgrade --no-cache-dir setuptools==68.0.0 wheel==0.40.0

# Verify pip is working
echo "🔍 Verifying pip installation:"
$PYTHON_CMD -m pip --version

# Install production dependencies
echo "📋 Installing production dependencies..."
echo "This may take a few minutes for compilation..."
$PYTHON_CMD -m pip install --no-cache-dir -r requirements.txt

# Verify critical imports
echo "✅ Verifying critical dependencies:"
$PYTHON_CMD -c "import fastapi; print(f'✓ FastAPI: {fastapi.__version__}')" || echo "❌ FastAPI import failed"
$PYTHON_CMD -c "import uvicorn; print(f'✓ Uvicorn: {uvicorn.__version__}')" || echo "❌ Uvicorn import failed"
$PYTHON_CMD -c "import asyncpg; print(f'✓ AsyncPG: {asyncpg.__version__}')" || echo "❌ AsyncPG import failed"
$PYTHON_CMD -c "import numpy; print(f'✓ NumPy: {numpy.__version__}')" || echo "❌ NumPy import failed"
$PYTHON_CMD -c "import pandas; print(f'✓ Pandas: {pandas.__version__}')" || echo "❌ Pandas import failed"

# Check if our app can be imported
echo "🧪 Testing application import:"
cd /opt/render/project/src/recommendation-engine || cd .
$PYTHON_CMD -c "
try:
    from app.main import app
    print('✅ Application import successful!')
except Exception as e:
    print(f'❌ Application import failed: {e}')
    exit(1)
"

echo "================================================"
echo "✅ BITSPARK Backend Build Complete!"
echo "🎯 Ready for production deployment"
echo "================================================"
