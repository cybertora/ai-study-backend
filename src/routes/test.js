import express from 'express';
import rateLimit from 'express-rate-limit';
import {
  createTest,
  getUserTests,
  getTestById,
  deleteTest,
} from '../controllers/testController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { generateTestSchema } from '../utils/validation.js';

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

router.post('/generate', aiLimiter, validate(generateTestSchema), createTest);
router.get('/', getUserTests);
router.get('/:id', getTestById);
router.delete('/:id', deleteTest);

export default router;
