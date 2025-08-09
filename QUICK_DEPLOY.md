# Quick Deployment Guide for Hostinger

## 🚀 Deploy to shahiniconstuction.com/oil

### Step 1: Build Your Application

Run this command in your project root:

```bash
# Make the deployment script executable (Linux/Mac)
chmod +x deploy.sh

# Run the deployment script
./deploy.sh
```

Or manually:
```bash
npm run install:all
cd frontend
npm run build
```

### Step 2: Deploy Frontend to Hostinger

1. **Login to Hostinger Control Panel**
2. **Go to File Manager**
3. **Navigate to public_html**
4. **Create a folder called `oil`**
5. **Upload all files from `frontend/dist/` to the `oil` folder**

### Step 3: Deploy Backend (Choose One Option)

#### Option A: Railway (Recommended - Free)

1. **Go to [Railway.app](https://railway.app)**
2. **Sign up with GitHub**
3. **Click "New Project" → "Deploy from GitHub repo"**
4. **Select your repository**
5. **Add these environment variables:**
   ```
   NODE_ENV=production
   JWT_SECRET=your-super-secret-jwt-key
   DB_HOST=your-railway-postgres-host
   DB_PORT=5432
   DB_NAME=your-railway-db-name
   DB_USER=your-railway-db-user
   DB_PASSWORD=your-railway-db-password
   ```
6. **Railway will automatically deploy your backend**

#### Option B: Render (Free Tier)

1. **Go to [Render.com](https://render.com)**
2. **Sign up and create a new Web Service**
3. **Connect your GitHub repository**
4. **Set build command: `cd backend && npm install`**
5. **Set start command: `cd backend && npm start`**
6. **Add environment variables (same as Railway)**

### Step 4: Update API Configuration

After your backend is deployed, update the API URL:

1. **Find your backend URL** (e.g., `https://your-app.railway.app`)
2. **Edit `frontend/src/config/production.ts`**
3. **Update the API_BASE_URL:**
   ```typescript
   API_BASE_URL: 'https://your-app.railway.app/oil/api'
   ```
4. **Rebuild and re-upload the frontend**

### Step 5: Set Up Database

1. **Access your backend URL: `https://your-backend-url.com/oil/api/health`**
2. **If it's working, initialize the database:**
   ```bash
   # You'll need to run this locally or via Railway console
   cd backend
   npm run init-db
   npm run create-superadmin
   ```

### Step 6: Test Your Application

1. **Visit: `https://shahiniconstuction.com/oil`**
2. **Register a new account or login with superadmin**
3. **Test all features: places, machinery, data entry**

## 🔧 Troubleshooting

### Common Issues:

**404 Errors on Page Refresh:**
- Make sure the `.htaccess` file is uploaded to the `oil` folder
- Contact Hostinger support to enable URL rewriting

**CORS Errors:**
- Update your backend CORS configuration to include your domain
- Add this to your backend:
  ```javascript
  app.use(cors({
    origin: ['https://shahiniconstuction.com', 'http://localhost:3000'],
    credentials: true
  }));
  ```

**API Connection Issues:**
- Check that your backend URL is correct
- Verify the backend is running (check health endpoint)
- Ensure environment variables are set correctly

**Database Issues:**
- Make sure PostgreSQL is properly configured
- Check database connection credentials
- Verify database tables are created

## 📞 Support

If you need help:
1. Check the browser console for errors
2. Check your backend logs
3. Verify all environment variables are set
4. Test the health endpoint: `https://your-backend-url.com/oil/api/health`

## 🎉 Success!

Once everything is working, your oil management system will be available at:
**https://shahiniconstuction.com/oil** 