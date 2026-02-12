// file: backend/src/routes/exam.js
import express from 'express';
import rateLimit from 'express-rate-limit';
import {
  startExam,
  getExamResults,
  getUserExams,
  getExamsByTest,
  forceFinishExam,               // ← вот она
} from '../controllers/examController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { startExamSchema } from '../utils/validation.js';

const router = express.Router();

const aiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 15,
  message: {
    success: false,
    message: 'Too many AI requests. Please try again later.',
  },
});

router.use(authenticateToken);

router.post('/start', validate(startExamSchema), startExam);
router.get('/results/:id', getExamResults);
router.get('/', getUserExams);
router.get('/test/:testId', getExamsByTest);
router.post('/force-finish/:id', forceFinishExam);  // ← теперь работает

export default router;