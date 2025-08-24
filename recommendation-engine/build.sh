# Render Build Script
# This ensures compatibility with Render's build system

set -e  # Exit on any error

echo "🐍 Python version check..."
python --version

echo "📦 Upgrading pip and setuptools..."
pip install --upgrade pip setuptools wheel

echo "📋 Installing requirements..."
pip install -r requirements.txt

echo "✅ Build completed successfully!"
