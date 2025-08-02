const express = require('express');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/auth');
const machineryRoutes = require('./routes/machinery');
const dataRoutes = require('./routes/data');
const placesRoutes = require('./routes/places');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/oil/api/auth', authRoutes);
app.use('/oil/api/machinery', machineryRoutes);
app.use('/oil/api/data', dataRoutes);
app.use('/oil/api/places', placesRoutes);

// Health check
app.get('/oil/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Oil Tank Management API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app; 