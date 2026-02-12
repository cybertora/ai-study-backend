import express from 'express';
import rateLimit from 'express-rate-limit';
import {
  createSummary,
  getUserLectures,
  getLectureById,
  deleteLecture,
} from '../controllers/summaryController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { summarySchema } from '../utils/validation.js';

const router = express.Router();

const aiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 15,
  message: {
    success: false,
    message: 'Too many AI requests. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.use(authenticateToken);

router.post('/', aiLimiter, validate(summarySchema), createSummary);
router.get('/', getUserLectures);
router.get('/:id', getLectureById);
router.delete('/:id', deleteLecture);

export default router;
