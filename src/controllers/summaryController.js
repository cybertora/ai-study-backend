// file: backend/src/controllers/summaryController.js
import Lecture from '../models/Lecture.js';
import { generateSummary } from '../services/openaiService.js';

export const createSummary = async (req, res, next) => {
  try {
    const { lectureText, title, subject } = req.body;

    // Generate summary using OpenAI
    const summary = await generateSummary(
      lectureText,
      title || 'Untitled Lecture'
    );

    // Calculate word count
    const wordCount = lectureText.split(/\s+/).length;

    // Save to database
    const lecture = await Lecture.create({
      title: title || 'Untitled Lecture',
      content: lectureText,
      summary,
      subject,
      wordCount,
      user: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: 'Summary generated successfully',
      data: {
        lecture: {
          id: lecture._id,
          title: lecture.title,
          summary: lecture.summary,
          wordCount: lecture.wordCount,
          subject: lecture.subject,
          createdAt: lecture.createdAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getUserLectures = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const lectures = await Lecture.find({ user: req.user._id })
      .select('title subject wordCount createdAt')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Lecture.countDocuments({ user: req.user._id });

    res.status(200).json({
      success: true,
      data: {
        lectures,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        total: count,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getLectureById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const lecture = await Lecture.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!lecture) {
      return res.status(404).json({
        success: false,
        message: 'Lecture not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { lecture },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteLecture = async (req, res, next) => {
  try {
    const { id } = req.params;

    const lecture = await Lecture.findOneAndDelete({
      _id: id,
      user: req.user._id,
    });

    if (!lecture) {
      return res.status(404).json({
        success: false,
        message: 'Lecture not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Lecture deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
