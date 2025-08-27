#!/bin/bash

echo "🚀 Deploying to Hostinger..."

# Build the frontend
echo "📦 Building frontend..."
cd frontend
npm run build

# Create deployment package
echo "📁 Creating deployment package..."
cd ..
mkdir -p hostinger-deploy
cp -r frontend/dist/* hostinger-deploy/
cp frontend/.htaccess hostinger-deploy/

echo "✅ Frontend built successfully!"
echo "📋 Next steps:"
echo "1. Upload the contents of 'hostinger-deploy' folder to your Hostinger hosting"
echo "2. Make sure to upload to the public_html directory or your domain's root"
echo "3. The .htaccess file will handle React Router routing"
echo ""
echo "🔗 Your backend will be deployed separately on Render"
echo "📝 Don't forget to update the backend URL in frontend/src/config/production.ts"
