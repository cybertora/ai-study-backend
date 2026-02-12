import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import Exam from '../models/Exam.js';
import Test from '../models/Test.js';
import { evaluateAnswer } from './openaiService.js';

let io;
const activeTimers = new Map();

export const initializeSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || ['http://localhost:3000', 'https://*.vercel.app'],
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error: No token'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id} | User: ${socket.userId}`);

    socket.on('join-exam', async ({ examId }) => {
      try {
        if (!examId) throw new Error('examId required');

        const exam = await Exam.findById(examId).populate('test');
        if (!exam) {
          return socket.emit('error', { message: 'Exam not found' });
        }

        if (exam.user.toString() !== socket.userId) {
          return socket.emit('error', { message: 'Unauthorized' });
        }

        if (exam.status !== 'in_progress') {
          return socket.emit('error', { message: 'Exam is not active' });
        }

        const roomId = exam.socketRoomId || exam._id.toString();
        socket.join(roomId);

        const timeLimitMs = exam.test.timeLimit * 60 * 1000;
        const elapsedMs = Date.now() - exam.startTime.getTime();
        const remainingSeconds = Math.max(0, Math.floor((timeLimitMs - elapsedMs) / 1000));

        const safeTest = {
          _id: exam.test._id,
          title: exam.test.title,
          topic: exam.test.topic,
          difficulty: exam.test.difficulty,
          timeLimit: exam.test.timeLimit,
          questions: exam.test.questions.map(q => ({
            question: q.question,
            options: q.options,
          })),
        };

        socket.emit('exam-joined', {
          test: safeTest,
          remainingTime: remainingSeconds,
        });

        if (!activeTimers.has(examId)) {
          const interval = setInterval(async () => {
            try {
              const now = Date.now();
              const elapsed = now - exam.startTime.getTime();
              const remainingMs = timeLimitMs - elapsed;
              const remainingSec = Math.max(0, Math.floor(remainingMs / 1000));

              io.to(roomId).emit('time-update', { remainingTime: remainingSec });

              if (remainingSec <= 0) {
                clearInterval(interval);
                activeTimers.delete(examId);
                io.to(roomId).emit('exam-expired');
                await finishExam(examId);
              }
            } catch (err) {
              console.error('Timer error:', err);
            }
          }, 1000);

          activeTimers.set(examId, interval);
        }
      } catch (err) {
        console.error('join-exam error:', err);
        socket.emit('error', { message: err.message || 'Failed to join exam' });
      }
    });

    socket.on('submit-answer', async ({ examId, questionIndex, answer }) => {
      try {
        if (typeof questionIndex !== 'number' || !examId || !answer) {
          throw new Error('Invalid data');
        }

        const exam = await Exam.findById(examId).populate('test');
        if (!exam || exam.user.toString() !== socket.userId) {
          return socket.emit('error', { message: 'Invalid exam or unauthorized' });
        }

        const question = exam.test.questions[questionIndex];
        if (!question) {
          return socket.emit('error', { message: 'Question not found' });
        }

        const evaluation = await evaluateAnswer(
          question.question,
          question.correctAnswer,
          answer
        );

        exam.answers.push({
          questionIndex,
          studentAnswer: answer,
          isCorrect: evaluation.isCorrect,
          feedback: evaluation.feedback,
          timestamp: new Date(),
        });

        await exam.save();

        socket.emit('answer-feedback', {
          questionIndex,
          isCorrect: evaluation.isCorrect,
          feedback: evaluation.feedback,
        });
      } catch (err) {
        console.error('submit-answer error:', err);
        socket.emit('error', { message: 'Failed to process answer' });
      }
    });

    socket.on('finish-exam', async ({ examId }) => {
      try {
        await finishExam(examId, socket.userId);
        // Результаты придут через событие 'exam-finished'
      } catch (err) {
        console.error('finish-exam error:', err);
        socket.emit('error', { message: err.message || 'Failed to finish' });
      }
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

const finishExam = async (examId, requestingUserId = null) => {
  try {
    const exam = await Exam.findById(examId).populate('test');
    if (!exam || exam.status !== 'in_progress') return;

    if (requestingUserId && exam.user.toString() !== requestingUserId) {
      throw new Error('Unauthorized');
    }

    const totalQuestions = exam.test ? exam.test.questions.length : 0;
    const correctAnswers = exam.answers.filter(a => a.isCorrect).length;
    const score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

    exam.status = 'completed';
    exam.endTime = new Date();
    exam.score = score;
    exam.timeSpent = Math.floor((exam.endTime - exam.startTime) / 1000);

    await exam.save();

    const roomId = exam.socketRoomId || exam._id.toString();

    io.to(roomId).emit('exam-finished', {
      examId: exam._id.toString(),
      score,
      totalQuestions,
      correctAnswers,
      timeSpent: exam.timeSpent,
      status: exam.status
    });
  } catch (err) {
    console.error('finishExam error:', err);
  }
};

export const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};

export default { initializeSocket, getIO };