import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';

import userRoute from './routes/userRoutes.js';
import authRoutes from './routes/authRoutes.js';
import problemRoute from './routes/problemRoutes.js';
import userProgressRoutes from './routes/userProgressRoutes.js';
import geminiRoutes from './routes/geminiRoutes.js';
import runRoutes from './routes/runRoutes.js';

//admin
import adminRoutes from './routes/adminRoutes.js';
import devRoutes from './routes/devRoutes.js';


dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://devarena-leetcode-frontend.onrender.com",
    "https://devarena-leetcode-2.onrender.com"
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

app.use(express.json());

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is running!', timestamp: new Date().toISOString() });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Environment check endpoint for debugging
app.get('/api/env-check', (req, res) => {
  res.json({
    nodeEnv: process.env.NODE_ENV,
    mongoUri: process.env.MONGO_URI ? 'Set' : 'Missing',
    cloudName: process.env.CLOUD_NAME ? 'Set' : 'Missing',
    cloudApiKey: process.env.CLOUD_API_KEY ? 'Set' : 'Missing',
    cloudApiSecret: process.env.CLOUD_API_SECRET ? 'Set' : 'Missing',
    jwtSecret: process.env.JWT_SECRET ? 'Set' : 'Missing',
    googleClientId: process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Missing',
    razorpayKeyId: process.env.RAZORPAY_KEY_ID ? 'Set' : 'Missing',
    razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET ? 'Set' : 'Missing'
  });
});

// Mount Routes
app.use('/api/users', userRoute);
app.use('/api/auth', authRoutes);
app.use('/api/problems', problemRoute);
app.use('/api/user-progress', userProgressRoutes);
app.use('/api/gemini', geminiRoutes);
app.use('/api/run', runRoutes);

// admin 
app.use('/api/admin', adminRoutes);
app.use('/api/dev', devRoutes);

export default app;