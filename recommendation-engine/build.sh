#!/bin/bash
# Render Build Script - Force Python 3.11
set -e  # Exit on any error

echo "🐍 Python version check..."
python --version
python3 --version

echo "📦 Upgrading build tools..."
python -m pip install --upgrade pip==23.2.1
pip install setuptools==68.2.2 wheel==0.41.2

echo "📋 Installing requirements..."
pip install -r requirements.txt

echo "✅ Build completed successfully!"
echo "🔍 Final environment check:"
python -c "import sys; print(f'Python: {sys.version}')"
python -c "import fastapi; print(f'FastAPI: {fastapi.__version__}')"
