# Quick Fix for Backend Issues

## The Problem
Your backend isn't working because it's missing database configuration.

## Quick Solution

### Step 1: Create .env file in backend folder
Create a file called `.env` in the `backend` folder with this content:

```
# Development Database Configuration
DATABASE_URL=postgresql://postgres:password@localhost:5432/nafta_db

# Or if you prefer individual settings:
DB_HOST=localhost
DB_PORT=5432
DB_NAME=nafta_db
DB_USER=postgres
DB_PASSWORD=password

NODE_ENV=development
JWT_SECRET=your-secret-key-here
```

### Step 2: Update database credentials
Replace the values above with your actual PostgreSQL credentials:
- `postgres` → your PostgreSQL username
- `password` → your PostgreSQL password  
- `nafta_db` → your database name
- `localhost:5432` → your database host and port

### Step 3: Start the backend
```bash
cd backend
npm install
npm start
```

### Step 4: Test the connection
The backend should start and show:
- "Connected to PostgreSQL database"
- "All tables created successfully" 
- "Server is running on port 5000"

## Alternative: Use SQLite for Development

If you don't have PostgreSQL set up, I can quickly modify the app to use SQLite instead for development.

## Test Your Setup

Once the backend is running, test it by visiting:
- http://localhost:5000/api/health - Should return {"status":"OK"}

Then test your frontend - the places should load quickly now!

## If You're Still Having Issues

1. **PostgreSQL not installed?** - Install PostgreSQL or let me know if you want to switch to SQLite
2. **Wrong credentials?** - Double-check your database username/password
3. **Port conflicts?** - Try changing the port in server.js
4. **Firewall issues?** - Make sure localhost:5000 isn't blocked

Let me know what error messages you see and I'll help fix them!

