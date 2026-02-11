// file: backend/src/controllers/examController.js
import Exam from '../models/Exam.js';
import Test from '../models/Test.js';
import { randomBytes } from 'crypto';

export const startExam = async (req, res, next) => {
  try {
    const { testId } = req.body;

    // Find test
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

    // Check for existing active exam
    const existingExam = await Exam.findOne({
      test: testId,
      user: req.user._id,
      status: 'in_progress',
    });

    if (existingExam) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active exam for this test',
        data: { examId: existingExam._id },
      });
    }

    // Create exam session
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
      .select('status score startTime endTime timeSpent')
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
