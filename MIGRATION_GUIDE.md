# 🗄️ Database Migration Guide for Render

## 🎯 **Migration Strategy: Fresh Start on Render**

This guide will help you migrate your existing data to the new Render database.

## 📋 **Prerequisites**

- ✅ Your current database is running
- ✅ You have access to your current database credentials
- ✅ Node.js installed locally

## 🚀 **Step 1: Export Current Data**

### **1.1 Update Database Configuration**
Edit `scripts/migrateToRender.js` and update these values:
```javascript
const currentDbConfig = {
  host: 'localhost',        // Your current DB host
  port: 5432,              // Your current DB port  
  database: 'nafta',       // Your current DB name
  user: 'postgres',        // Your current DB user
  password: 'your_password' // Your current DB password
};
```

### **1.2 Run Migration Script**
```bash
cd scripts
node migrateToRender.js
```

This will create a `migrations/` folder with:
- `places.json` & `places.sql`
- `machinery.json` & `machinery.sql`
- `users.json` & `users.sql`
- `oil_data.json` & `oil_data.sql`
- `init_database.sql` (database structure)

## 🌐 **Step 2: Deploy to Render**

### **2.1 Deploy Backend**
1. Push your code to GitHub
2. Deploy to Render using your `render.yaml`
3. Render will automatically create the database

### **2.2 Get Database Connection Details**
After deployment, in Render dashboard:
- Go to your database service
- Copy the connection string
- Update environment variables in your backend service

## 📊 **Step 3: Import Data to Render**

### **3.1 Option A: Using psql (Recommended)**
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

### **3.2 Option B: Using Render Dashboard**
1. Go to your database in Render
2. Use the SQL Editor
3. Copy and paste the contents of each SQL file

### **3.3 Option C: Using a Database Client**
- Use pgAdmin, DBeaver, or similar
- Connect to your Render database
- Execute the SQL files

## 🔍 **Step 4: Verify Migration**

### **4.1 Check Data Counts**
```sql
SELECT COUNT(*) FROM places;
SELECT COUNT(*) FROM machinery;
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM oil_data;
```

### **4.2 Test Your Application**
- Visit your deployed frontend
- Try to log in with existing credentials
- Verify all data is displaying correctly

## 🛠️ **Troubleshooting**

### **Common Issues:**

1. **Connection Errors**
   - Verify your Render database is running
   - Check connection string format
   - Ensure IP whitelist allows your connection

2. **Data Import Errors**
   - Check for foreign key constraints
   - Verify table structure matches
   - Look for duplicate key violations

3. **Missing Data**
   - Verify export script ran successfully
   - Check file permissions in migrations folder
   - Ensure all tables were exported

### **Debug Commands:**
```bash
# Check migration files
ls -la migrations/

# Verify database connection
psql "your_connection_string" -c "SELECT version();"

# Check table structure
psql "your_connection_string" -c "\d+ places"
```

## 📁 **File Structure After Migration**

```
migrations/
├── places.json          # Exported data (JSON format)
├── places.sql           # SQL INSERT statements
├── machinery.json
├── machinery.sql
├── users.json
├── users.sql
├── oil_data.json
├── oil_data.sql
└── init_database.sql    # Database structure
```

## 🎉 **Success Indicators**

- ✅ All tables created successfully
- ✅ Data counts match between old and new databases
- ✅ Application works with new database
- ✅ No error messages in logs

## 🔄 **Rollback Plan**

If something goes wrong:
1. Your original database remains untouched
2. You can delete the Render database and start over
3. Re-run the migration script
4. Check the troubleshooting section above

---

**Happy Migrating! 🚀**
