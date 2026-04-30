import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path'
import { fileURLToPath } from 'url'
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/authRoute.js';
import userRoutes from './routes/userRoutes.js'
import notificationRoutes from './routes/notificationRoutes.js';
import adminRoutes from './routes/adminRoutes.js'
import projectRoute from './routes/projectRoutes.js'
import publicProjectRoutes from './routes/publicProjectRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import testmoniaRoutes from './routes/testimonialRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import faqRoutes from './routes/faqRoutes.js';
import chatRoutes from './routes/chatRoutes.js';

dotenv.config();


// __dirname እና __filename መፍጠር በES Modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: 'http://localhost:3000', //  process.env.FRONTEND_URL ||
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Routes
app.use('/api/upload', uploadRoutes) // አስመዘግብ
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/projects', projectRoute);
app.use('/api/public', publicProjectRoutes);
app.use('/api/testimonials', testmoniaRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/analytics', analyticsRoutes); 
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/faq', faqRoutes);
app.use('/api/chat', chatRoutes);


app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running!',
    timestamp: new Date().toISOString()
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

const server = app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

process.on('SIGTERM', async () => {
  console.log('SIGTERM received');
  server.close();
  await prisma.$disconnect();
});