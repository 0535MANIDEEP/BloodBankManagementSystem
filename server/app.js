/**
 * @fileoverview Main entry point for the BloodGrid Express application.
 */

'use strict';

const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');
const User = require('./models/User');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB().then(() => {
  seedAdmin();
}).catch(() => {});

const app = express();

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS
app.use(cors());

// Set static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// File Upload Route integration using the refactored UploadService class
const uploadService = require('./services/uploadService');
const { protect } = require('./middleware/auth');
const asyncHandler = require('./utils/asyncHandler');
const ApiResponse = require('./utils/ApiResponse');
const { ValidationError } = require('./utils/AppError');

app.post('/api/upload', protect, uploadService.getMiddleware(), asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ValidationError('Please upload a file document');
  }

  const fileUrl = await uploadService.uploadToS3OrLocal(req.file);

  return ApiResponse.success(res, {
    data: fileUrl,
    message: 'Document uploaded successfully'
  });
}));

// Mount Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/donor', require('./routes/donorRoutes'));
app.use('/api/inventory', require('./routes/inventoryRoutes'));
app.use('/api/request', require('./routes/requestRoutes'));

// Root health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date() });
});

// Seed default administrator silently (without leaking credentials in logs)
const seedAdmin = async () => {
  try {
    const adminEmail = 'admin@bloodbank.com';
    const adminExists = await User.findOne({ email: adminEmail });
    if (!adminExists) {
      await User.create({
        email: adminEmail,
        password: 'adminpassword123',
        name: 'System Administrator',
        role: 'admin',
        phone: '123-456-7890'
      });
      console.log('Default Admin Account seeded.');
    }
  } catch (error) {
    console.error('Failed to seed default admin:', error.message);
  }
};

// Error Handler Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Only listen when not running on Vercel (local development)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
}

module.exports = app;
