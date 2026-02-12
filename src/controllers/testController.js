// file: backend/src/controllers/testController.js
import Test from '../models/Test.js';
import { generateTest } from '../services/openaiService.js';

export const createTest = async (req, res, next) => {
  try {
    const { topic, numQuestions, difficulty, timeLimit } = req.body;

    // Generate test questions using OpenAI
    const questions = await generateTest(
      topic,
      numQuestions || 10,
      difficulty || 'medium'
    );

    // Save to database
    const test = await Test.create({
      title: `Test: ${topic}`,
      topic,
      questions,
      difficulty: difficulty || 'medium',
      timeLimit: timeLimit || 30,
      user: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: 'Test generated successfully',
      data: {
        test: {
          id: test._id,
          title: test.title,
          topic: test.topic,
          questions: test.questions,
          difficulty: test.difficulty,
          timeLimit: test.timeLimit,
          createdAt: test.createdAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getUserTests = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const tests = await Test.find({ user: req.user._id })
      .select('title topic difficulty timeLimit createdAt questions')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Test.countDocuments({ user: req.user._id });

    res.status(200).json({
      success: true,
      data: {
        tests,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        total: count,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getTestById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const test = await Test.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Test not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { test },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTest = async (req, res, next) => {
  try {
    const { id } = req.params;

    const test = await Test.findOneAndDelete({
      _id: id,
      user: req.user._id,
    });

    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Test not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Test deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
