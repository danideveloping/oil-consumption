# Deployment Guide for Hostinger

This guide will help you deploy your Oil Tank Management System to your Hostinger domain at `shahiniconstuction.com/oil`.

## Option 1: Static Frontend Only (Recommended for Hostinger)

This option deploys only the frontend to Hostinger's static hosting, with the backend running elsewhere.

### Step 1: Build the Frontend

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies (if not already done)
npm install

# Build for production
npm run build
```

This will create a `dist` folder with your built application.

### Step 2: Upload to Hostinger

1. **Access Hostinger File Manager**:
   - Log into your Hostinger control panel
   - Go to "File Manager"
   - Navigate to your domain's public_html directory

2. **Create the oil directory**:
   - Create a new folder called `oil` in your public_html directory
   - This will be accessible at `shahiniconstuction.com/oil`

3. **Upload the built files**:
   - Upload all contents from the `frontend/dist` folder to the `oil` directory
   - Make sure the `index.html` file is in the root of the `oil` directory

### Step 3: Configure Backend (Separate Hosting)

Since Hostinger's shared hosting doesn't support Node.js, you'll need to host the backend elsewhere:

**Options for backend hosting:**
- **Railway** (recommended - free tier available)
- **Render** (free tier available)
- **Heroku** (paid)
- **DigitalOcean App Platform**
- **Vercel** (for serverless functions)

### Step 4: Update API Configuration

Once your backend is deployed, update the API base URL in your frontend:

1. Find your backend URL (e.g., `https://your-app.railway.app`)
2. Update the API configuration in `frontend/src/services/api.ts`

## Option 2: Full Stack with Hostinger VPS

If you have Hostinger VPS hosting, you can deploy both frontend and backend.

### Step 1: Set up VPS

1. **Access your VPS** via SSH
2. **Install Node.js and npm**:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. **Install PostgreSQL**:
   ```bash
   sudo apt update
   sudo apt install postgresql postgresql-contrib
   ```

### Step 2: Deploy the Application

1. **Upload your code** to the VPS
2. **Set up environment variables**:
   ```bash
   cd backend
   nano .env
   ```
   
   Add your production environment variables:
   ```env
   PORT=5000
   NODE_ENV=production
   JWT_SECRET=your-production-jwt-secret
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=oil_tank_management
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   ```

3. **Install dependencies and build**:
   ```bash
   npm run install:all
   npm run build
   ```

4. **Set up the database**:
   ```bash
   cd backend
   npm run init-db
   npm run create-superadmin
   ```

5. **Start the application**:
   ```bash
   npm start
   ```

### Step 3: Configure Nginx (for VPS)

Create an Nginx configuration to serve the frontend and proxy API requests:

```nginx
server {
    listen 80;
    server_name shahiniconstuction.com;

    # Serve frontend from /oil directory
    location /oil {
        alias /path/to/your/frontend/dist;
        try_files $uri $uri/ /oil/index.html;
    }

    # Proxy API requests to backend
    location /oil/api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Option 3: Hybrid Approach (Recommended)

1. **Deploy frontend to Hostinger static hosting** (Option 1)
2. **Deploy backend to Railway/Render** (free tier)
3. **Configure CORS and API endpoints**

### Backend Deployment to Railway

1. **Create Railway account** at railway.app
2. **Connect your GitHub repository**
3. **Set environment variables** in Railway dashboard
4. **Deploy automatically**

### Update Frontend API Configuration

Update `frontend/src/services/api.ts` to point to your Railway backend:

```typescript
const API_BASE_URL = 'https://your-app.railway.app/oil/api';
```

## Post-Deployment Checklist

- [ ] Frontend is accessible at `shahiniconstuction.com/oil`
- [ ] Backend API is responding at `your-backend-url/oil/api`
- [ ] Database is properly configured and accessible
- [ ] SuperAdmin user is created
- [ ] CORS is properly configured for your domain
- [ ] SSL certificate is active (https)
- [ ] All API endpoints are working
- [ ] User registration and login work
- [ ] Data entry and viewing functions work

## Troubleshooting

### Common Issues:

1. **404 errors on page refresh**: This is normal for SPA routing. Ensure your hosting supports URL rewriting.

2. **CORS errors**: Make sure your backend CORS configuration includes your domain.

3. **API connection issues**: Verify the API base URL is correct and the backend is running.

4. **Database connection**: Ensure your database credentials are correct and the database is accessible.

### Support

If you encounter issues, check:
- Hostinger's documentation for your specific hosting plan
- Railway/Render documentation for backend deployment
- Browser console for frontend errors
- Backend logs for API errors 