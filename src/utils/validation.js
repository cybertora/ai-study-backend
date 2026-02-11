// file: backend/src/utils/validation.js
import Joi from 'joi';

// Auth validation schemas
export const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters long',
    'any.required': 'Password is required',
  }),
  role: Joi.string().valid('student', 'teacher', 'admin').optional(),
  firstName: Joi.string().trim().optional(),
  lastName: Joi.string().trim().optional(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// Summary validation
export const summarySchema = Joi.object({
  lectureText: Joi.string().min(100).max(50000).required().messages({
    'string.min': 'Lecture text must be at least 100 characters',
    'string.max': 'Lecture text cannot exceed 50000 characters',
    'any.required': 'Lecture text is required',
  }),
  title: Joi.string().trim().max(200).optional(),
  subject: Joi.string().trim().max(100).optional(),
});

// Test generation validation
export const generateTestSchema = Joi.object({
  topic: Joi.string().trim().min(3).max(200).required().messages({
    'string.min': 'Topic must be at least 3 characters',
    'any.required': 'Topic is required',
  }),
  numQuestions: Joi.number().integer().min(3).max(50).default(10),
  difficulty: Joi.string().valid('easy', 'medium', 'hard').default('medium'),
  timeLimit: Joi.number().integer().min(5).max(180).default(30),
});

// Code check validation
export const codeCheckSchema = Joi.object({
  code: Joi.string().min(10).max(10000).required().messages({
    'string.min': 'Code must be at least 10 characters',
    'string.max': 'Code cannot exceed 10000 characters',
    'any.required': 'Code is required',
  }),
  language: Joi.string()
    .valid('javascript', 'python', 'java', 'cpp', 'csharp', 'go', 'rust', 'php', 'other')
    .required(),
  taskDescription: Joi.string().max(1000).optional(),
});

// Cheat sheet validation
export const cheatSheetSchema = Joi.object({
  text: Joi.string().min(100).max(20000).required().messages({
    'string.min': 'Text must be at least 100 characters',
    'string.max': 'Text cannot exceed 20000 characters',
    'any.required': 'Text is required',
  }),
  maxLength: Joi.number().integer().min(100).max(2000).default(500),
  format: Joi.string().valid('bullet', 'table', 'compact').default('bullet'),
});

// Exam validation
export const startExamSchema = Joi.object({
  testId: Joi.string().required().messages({
    'any.required': 'Test ID is required',
  }),
});

export const submitAnswerSchema = Joi.object({
  examId: Joi.string().required(),
  questionIndex: Joi.number().integer().min(0).required(),
  answer: Joi.string().required(),
});
