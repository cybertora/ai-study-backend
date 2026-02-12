// file: backend/src/controllers/examController.js
import Exam from '../models/Exam.js';
import Test from '../models/Test.js';
import { randomBytes } from 'crypto';

export const startExam = async (req, res, next) => {
  try {
    const { testId, forceNew = false } = req.body; // ← новый опциональный флаг

    const test = await Test.findOne({
      _id: testId,
      user: req.user._id,
    });

    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Test not found',
      });
    }

    // Проверяем активную сессию
    let existingExam = await Exam.findOne({
      test: testId,
      user: req.user._id,
      status: 'in_progress',
    });

    // Если есть активная сессия и пользователь хочет начать заново (forceNew=true)
    if (existingExam && forceNew) {
      existingExam.status = 'expired';
      existingExam.endTime = new Date();
      existingExam.timeSpent = Math.floor((Date.now() - existingExam.startTime.getTime()) / 1000);
      await existingExam.save();

      console.log(`Старая сессия ${existingExam._id} принудительно завершена как expired`);
      existingExam = null; // теперь можно создавать новую
    }

    // Если всё ещё есть активная — возвращаем ошибку
    if (existingExam) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active exam for this test. Finish or force new.',
        data: { examId: existingExam._id },
      });
    }

    // Создаём новую сессию
    const exam = await Exam.create({
      test: testId,
      user: req.user._id,
      socketRoomId: randomBytes(16).toString('hex'),
      status: 'in_progress',
      startTime: new Date(),
    });

    res.status(201).json({
      success: true,
      message: 'Exam started successfully',
      data: {
        examId: exam._id,
        socketRoomId: exam.socketRoomId,
        startTime: exam.startTime,
        timeLimit: test.timeLimit,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Принудительное завершение сессии (для фронта)
export const forceFinishExam = async (req, res, next) => {
  try {
    const { id: examId } = req.params;

    const exam = await Exam.findOne({
      _id: examId,
      user: req.user._id,
      status: 'in_progress',
    });

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Active exam not found',
      });
    }

    exam.status = 'expired';
    exam.endTime = new Date();
    exam.timeSpent = Math.floor((Date.now() - exam.startTime.getTime()) / 1000);
    await exam.save();

    res.status(200).json({
      success: true,
      message: 'Exam session expired successfully',
      data: { examId },
    });
  } catch (error) {
    next(error);
  }
};

export const getExamsByTest = async (req, res, next) => {
  try {
    const { testId } = req.params;

    const exams = await Exam.find({
      test: testId,
      user: req.user._id,
      status: { $in: ['completed', 'expired'] }
    })
      .populate('test', 'title topic questions')
      .select('score timeSpent endTime startTime answers status')
      .sort({ endTime: -1 });

    res.status(200).json({
      success: true,
      data: { exams }
    });
  } catch (error) {
    next(error);
  }
};

export const getExamResults = async (req, res, next) => {
  try {
    const { id } = req.params;

    const exam = await Exam.findOne({
      _id: id,
      user: req.user._id,
    }).populate('test');

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { exam },
    });
  } catch (error) {
    next(error);
  }
};

export const getUserExams = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const exams = await Exam.find({ user: req.user._id })
      .populate('test', 'title topic')
      .select('status score startTime endTime timeSpent test')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Exam.countDocuments({ user: req.user._id });

    res.status(200).json({
      success: true,
      data: {
        exams,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        total: count,
      },
    });
  } catch (error) {
    next(error);
  }
};