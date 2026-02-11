// file: backend/src/routes/exam.js
import express from 'express';
import {
  startExam,
  getExamResults,
  getUserExams,
} from '../controllers/examController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { startExamSchema } from '../utils/validation.js';

const router = express.Router();

router.use(authenticateToken);

router.post('/start', validate(startExamSchema), startExam);
router.get('/results/:id', getExamResults);
router.get('/', getUserExams);

export default router;
