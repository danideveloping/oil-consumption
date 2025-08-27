const express = require('express');
const cors = require('cors');
const path = require('path');
const database = require('./config/database');
const authRoutes = require('./routes/auth');
const machineryRoutes = require('./routes/machinery');
const dataRoutes = require('./routes/data');
const placesRoutes = require('./routes/places');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'https://shahiniconstruction.com',
      'https://www.shahiniconstruction.com',
      'http://localhost:3000',
      'http://localhost:5173',
      'https://oil-consumption-kg14.onrender.com'  // Add your Render domain
    ];
    
    // Add your Hostinger domain here
    if (process.env.NODE_ENV === 'production') {
      allowedOrigins.push(process.env.FRONTEND_URL || 'https://yourdomain.com');
    }
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Handle React Router - serve index.html for all non-API routes
app.get('*', (req, res) => {
  if (!req.path.startsWith('/oil/api') && !req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  }
});

// Routes
app.use('/oil/api/auth', authRoutes);
app.use('/oil/api/machinery', machineryRoutes);
app.use('/oil/api/data', dataRoutes);
app.use('/oil/api/places', placesRoutes);

// Health check endpoint for Render
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Health check
app.get('/oil/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Oil Tank Management API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Initialize database and start server
async function startServer() {
  try {
    await database.connect();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app; 