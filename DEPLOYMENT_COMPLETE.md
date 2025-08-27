# 🚀 Complete Deployment Guide for Nafta Oil Management System

## 🎯 **Deployment Strategy**

- **Frontend**: Deploy to Hostinger (static hosting)
- **Backend**: Deploy to Render (Node.js hosting)
- **Database**: Use Render's PostgreSQL service

## 📋 **Prerequisites**

- Hostinger hosting account
- Render account
- Git repository with your code
- Node.js installed locally

## 🔧 **Step 1: Deploy Backend to Render**

### **1.1 Connect to Render**

1. Go to [render.com](https://render.com) and sign up/login
2. Click "New +" and select "Web Service"
3. Connect your GitHub repository

### **1.2 Configure Backend Service**

- **Name**: `nafta-backend`
- **Environment**: `Node`
- **Build Command**: `cd backend && npm install`
- **Start Command**: `cd backend && npm start`
- **Plan**: Free (or choose paid plan)

### **1.3 Environment Variables**

Add these environment variables in Render:

```
NODE_ENV=production
PORT=10000
DATABASE_URL=your_render_postgres_url
JWT_SECRET=your_jwt_secret_key
FRONTEND_URL=https://yourdomain.com
```

### **1.4 Database Setup**

1. Create a new PostgreSQL database in Render
2. Copy the connection string
3. Update the `DATABASE_URL` environment variable

### **1.5 Deploy**

Click "Create Web Service" and wait for deployment.

## 🌐 **Step 2: Deploy Frontend to Hostinger**

### **2.1 Build Frontend**

```bash
cd frontend
npm install
npm run build
```

### **2.2 Update Backend URL**

Update `frontend/src/config/production.ts` with your Render backend URL:

```typescript
export const config = {
  apiBaseUrl: 'https://your-backend-name.onrender.com',
  environment: 'production'
};
```

### **2.3 Upload to Hostinger**

1. Log into your Hostinger control panel
2. Go to File Manager
3. Navigate to `public_html` (or your domain's root)
4. Upload all files from `frontend/dist/` folder
5. Upload the `.htaccess` file to the root

### **2.4 Domain Configuration**

1. Point your domain to Hostinger's nameservers
2. Wait for DNS propagation (24-48 hours)

## 🗄️ **Step 3: Database Migration (Optional)**

If you have existing data, use the migration script:

### **3.1 Export Current Data**

```bash
cd scripts
node migrateToRender.js
```

### **3.2 Import to Render Database**

```bash
# Connect to your Render database
psql "postgres://nafta_user:password@host:port/nafta_db"

# Run the initialization script
\i migrations/init_database.sql

# Import your data
\i migrations/places.sql
\i migrations/machinery.sql
\i migrations/users.sql
\i migrations/oil_data.sql
```

## 🚀 **Alternative: Quick Deploy Scripts**

### **Windows Users:**
```bash
deploy-hostinger.bat
```

### **Linux/Mac Users:**
```bash
chmod +x deploy-hostinger.sh
./deploy-hostinger.sh
```

## 🔍 **Step 4: Testing**

### **4.1 Test Backend**

Visit: `https://your-backend-name.onrender.com/api/health`

Should return: `{"status":"OK","timestamp":"..."}`

### **4.2 Test Frontend**

Visit your domain and test:
- User registration/login
- API connectivity
- All features working

## 🛠️ **Troubleshooting**

### **Common Issues**

1. **CORS Errors**: Ensure backend allows your frontend domain
2. **404 on Refresh**: Verify `.htaccess` is uploaded correctly
3. **Database Connection**: Check `DATABASE_URL` in Render environment variables
4. **Build Errors**: Ensure all dependencies are in `package.json`

### **Debug Commands**

```bash
# Check backend logs in Render dashboard
# Check frontend build output
npm run build

# Test API locally
curl http://localhost:5000/api/health
```

## 📱 **Environment-Specific Configs**

### **Development**
- Backend: `http://localhost:5000`
- Frontend: `http://localhost:3000`

### **Production**
- Backend: `https://your-backend-name.onrender.com`
- Frontend: `https://yourdomain.com`

## 🔐 **Security Considerations**

1. **JWT Secret**: Use a strong, unique secret
2. **Environment Variables**: Never commit secrets to Git
3. **HTTPS**: Both platforms provide SSL certificates
4. **CORS**: Configure properly for production domains

## 📊 **Monitoring**

### **Render Dashboard**
- View logs
- Monitor performance
- Check database status

### **Hostinger**
- Monitor bandwidth usage
- Check error logs
- Domain health

## 🔄 **Updates & Maintenance**

### **Backend Updates**
1. Push changes to Git
2. Render auto-deploys on push
3. Monitor deployment logs

### **Frontend Updates**
1. Build new version: `npm run build`
2. Upload new files to Hostinger
3. Clear browser cache

## 📞 **Support**

- **Render**: [docs.render.com](https://docs.render.com)
- **Hostinger**: [hostinger.com/support](https://hostinger.com/support)
- **Project Issues**: Check your repository issues

---

**Happy Deploying! 🎉**
