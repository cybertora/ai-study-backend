// file: backend/src/app.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler.js';

// Routes
import authRoutes from './routes/auth.js';
import summaryRoutes from './routes/summary.js';
import testRoutes from './routes/test.js';
import codeRoutes from './routes/code.js';
import cheatsheetRoutes from './routes/cheatsheet.js';
import examRoutes from './routes/exam.js';

dotenv.config();

const app = express();

app.use(cors({
  origin: [
    'https://ai-study-frontend-kz7o34tyj-cybertoras-projects.vercel.app/',  // ← скопируй точно из браузера (твой фронт-домен)
    'https://ai-study-frontend-nine.vercel.app/',  // если есть основной/alias
    'http://localhost:3000',                 // локал
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 204
}));

// Явный хендлер для preflight — это спасает на Render/Vercel/Netlify
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(204);  // 204 No Content — стандарт для preflight
});

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })
);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/summary', summaryRoutes);
app.use('/api/test', testRoutes);
app.use('/api/code', codeRoutes);
app.use('/api/cheatsheet', cheatsheetRoutes);
app.use('/api/exam', examRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler (must be last)
app.use(errorHandler);

export default app;
