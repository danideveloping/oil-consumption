#!/bin/bash

# Oil Tank Management System Deployment Script
# This script builds the frontend for production deployment

echo "🚀 Starting deployment process..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm run install:all

# Build frontend
echo "🔨 Building frontend for production..."
cd frontend
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Frontend build completed successfully!"
    echo ""
    echo "📁 Build output is in: frontend/dist/"
    echo ""
    echo "📋 Next steps:"
    echo "1. Upload the contents of frontend/dist/ to your Hostinger public_html/oil/ directory"
    echo "2. Deploy your backend to Railway/Render/Heroku"
    echo "3. Update the API base URL in your frontend configuration"
    echo ""
    echo "🌐 Your app will be available at: https://shahiniconstuction.com/oil"
else
    echo "❌ Build failed! Please check the error messages above."
    exit 1
fi 