@echo off
echo 🚀 Deploying to Hostinger...

echo 📦 Building frontend...
cd frontend
call npm run build

echo 📁 Creating deployment package...
cd ..
if exist hostinger-deploy rmdir /s /q hostinger-deploy
mkdir hostinger-deploy
xcopy "frontend\dist\*" "hostinger-deploy\" /E /I /Y
copy "frontend\.htaccess" "hostinger-deploy\"

echo ✅ Frontend built successfully!
echo.
echo 📋 Next steps:
echo 1. Upload the contents of 'hostinger-deploy' folder to your Hostinger hosting
echo 2. Make sure to upload to the public_html directory or your domain's root
echo 3. The .htaccess file will handle React Router routing
echo.
echo 🔗 Your backend will be deployed separately on Render
echo 📝 Don't forget to update the backend URL in frontend/src/config/production.ts
echo.
pause
