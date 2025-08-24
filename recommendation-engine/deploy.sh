#!/bin/bash

# Render Deploy Script - Simple and Bulletproof
set -e

echo "🚀 Starting BITSPARK Backend Build..."

# Force Python 3.11
echo "🐍 Using Python 3.11..."
python3.11 --version || python3 --version || python --version

# Upgrade core tools
echo "🔧 Upgrading build tools..."
python3 -m pip install --upgrade pip==23.2.1 setuptools==68.2.2 wheel==0.41.2

# Install dependencies
echo "📦 Installing dependencies..."
python3 -m pip install -r requirements.txt

echo "✅ Build complete! Starting application..."
