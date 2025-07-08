#!/bin/bash

# Platform setup script
echo "🚀 Setting up BlackNBrownStudios Platform..."

# Check Node version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo "❌ Node.js 18 or higher is required"
  exit 1
fi

# Check pnpm
if ! command -v pnpm &> /dev/null; then
  echo "📦 Installing pnpm..."
  npm install -g pnpm@8.15.6
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Build packages
echo "🔨 Building packages..."
pnpm build

echo "✅ Platform setup complete!"
echo ""
echo "Available commands:"
echo "  pnpm dev     - Run all apps in development mode"
echo "  pnpm build   - Build all packages and apps"
echo "  pnpm test    - Run tests"
echo "  pnpm lint    - Run linting"
echo ""
echo "To run a specific app:"
echo "  pnpm dev --filter=history-time-web"
echo ""