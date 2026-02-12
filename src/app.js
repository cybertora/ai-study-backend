import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/auth.js';
import summaryRoutes from './routes/summary.js';
import testRoutes from './routes/test.js';
import codeRoutes from './routes/code.js';
import cheatsheetRoutes from './routes/cheatsheet.js';
import examRoutes from './routes/exam.js';

dotenv.config();

const app = express();

app.options('*', (req, res) => {
  const origin = req.headers.origin;

  console.log(`[OPTIONS] Request from origin: ${origin || 'no origin'}`);

  res.header('Access-Control-Allow-Origin', origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400'); // кэшируем preflight на 24 часа

  return res.sendStatus(204);
});

app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      'https://prefil-study-frontend-aazlliaXj-cybertoras-projects.vercel.app',
      'https://ai-study-frontend-kz7o34tyj-cybertoras-projects.vercel.app',
      'https://ai-study-frontend-nine.vercel.app',
      'http://localhost:3000',
      'http://localhost:3001' // на всякий случай
    ];

    if (!origin || allowedOrigins.some(o => origin.startsWith(o)) || origin.includes('vercel.app')) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked for origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true,
  optionsSuccessStatus: 204,
  maxAge: 86400
}));

app.use(helmet());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/summary', summaryRoutes);
app.use('/api/test', testRoutes);
app.use('/api/code', codeRoutes);
app.use('/api/cheatsheet', cheatsheetRoutes);
app.use('/api/exam', examRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.use(errorHandler);

export default app;