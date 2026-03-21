import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

// Import routes
import authRoutes from './src/routes/authRoute';

// Use routes - THIS IS CRITICAL
app.use('/api/auth', authRoutes);

// Initialize Prisma
export const prisma = new PrismaClient();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    data: { 
      status: 'ok', 
      timestamp: new Date().toISOString()
    } 
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Portfolio Platform API',
    version: '1.0.0'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  prisma.$disconnect();
});