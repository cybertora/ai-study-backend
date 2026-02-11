// file: backend/src/services/socketService.js
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import Exam from '../models/Exam.js';
import Test from '../models/Test.js';
import { evaluateAnswer } from './openaiService.js';

let io;

export const initializeSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
    },
  });

  // Socket authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`✅ Socket connected: ${socket.id} (User: ${socket.userId})`);

    // Join exam room
    socket.on('join-exam', async (data) => {
      try {
        const { examId } = data;

        const exam = await Exam.findById(examId).populate('test');

        if (!exam) {
          socket.emit('error', { message: 'Exam not found' });
          return;
        }

        if (exam.user.toString() !== socket.userId) {
          socket.emit('error', { message: 'Unauthorized access to exam' });
          return;
        }

        if (exam.status !== 'in_progress') {
          socket.emit('error', { message: 'Exam is not active' });
          return;
        }

        const roomId = exam.socketRoomId || examId;
        socket.join(roomId);

        // Calculate remaining time
        const timeLimit = exam.test.timeLimit * 60 * 1000; // Convert to ms
        const elapsed = Date.now() - exam.startTime.getTime();
        const remaining = Math.max(0, timeLimit - elapsed);

        socket.emit('exam-joined', {
          examId: exam._id,
          test: exam.test,
          startTime: exam.startTime,
          remainingTime: remaining,
        });

        // Start timer
        const timerInterval = setInterval(() => {
          const elapsed = Date.now() - exam.startTime.getTime();
          const remaining = Math.max(0, timeLimit - elapsed);

          io.to(roomId).emit('time-update', { remainingTime: remaining });

          if (remaining === 0) {
            clearInterval(timerInterval);
            io.to(roomId).emit('exam-expired');
            finishExam(examId);
          }
        }, 1000);

        socket.on('disconnect', () => {
          clearInterval(timerInterval);
        });
      } catch (error) {
        console.error('join-exam error:', error);
        socket.emit('error', { message: 'Failed to join exam' });
      }
    });

    // Submit answer with real-time feedback
    socket.on('submit-answer', async (data) => {
      try {
        const { examId, questionIndex, answer } = data;

        const exam = await Exam.findById(examId).populate('test');

        if (!exam || exam.user.toString() !== socket.userId) {
          socket.emit('error', { message: 'Invalid exam' });
          return;
        }

        const question = exam.test.questions[questionIndex];
        if (!question) {
          socket.emit('error', { message: 'Invalid question index' });
          return;
        }

        // Evaluate answer using AI
        const evaluation = await evaluateAnswer(
          question.question,
          question.correctAnswer,
          answer
        );

        // Save answer
        exam.answers.push({
          questionIndex,
          studentAnswer: answer,
          isCorrect: evaluation.isCorrect,
          feedback: evaluation.feedback,
        });

        await exam.save();

        // Send feedback
        socket.emit('answer-feedback', {
          questionIndex,
          isCorrect: evaluation.isCorrect,
          feedback: evaluation.feedback,
          correctAnswer: question.correctAnswer,
        });
      } catch (error) {
        console.error('submit-answer error:', error);
        socket.emit('error', { message: 'Failed to submit answer' });
      }
    });

    // Finish exam manually
    socket.on('finish-exam', async (data) => {
      try {
        const { examId } = data;
        await finishExam(examId, socket.userId);
        socket.emit('exam-finished', { message: 'Exam completed successfully' });
      } catch (error) {
        console.error('finish-exam error:', error);
        socket.emit('error', { message: 'Failed to finish exam' });
      }
    });

    socket.on('disconnect', () => {
      console.log(`❌ Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

// Helper function to finish exam
const finishExam = async (examId, userId = null) => {
  const exam = await Exam.findById(examId);

  if (!exam || exam.status !== 'in_progress') {
    return;
  }

  if (userId && exam.user.toString() !== userId) {
    throw new Error('Unauthorized');
  }

  const totalQuestions = exam.answers.length;
  const correctAnswers = exam.answers.filter((a) => a.isCorrect).length;
  const score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

  exam.status = 'completed';
  exam.endTime = new Date();
  exam.score = score;
  exam.timeSpent = Math.floor((exam.endTime - exam.startTime) / 1000);

  await exam.save();
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

export default { initializeSocket, getIO };
