import express from 'express';
import rateLimit from 'express-rate-limit';
import { createCheatSheet } from '../controllers/cheatSheetController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { cheatSheetSchema } from '../utils/validation.js';

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

router.post('/', aiLimiter, validate(cheatSheetSchema), createCheatSheet);

export default router;
