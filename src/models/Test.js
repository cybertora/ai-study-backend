// file: backend/src/models/Test.js
import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  options: {
    type: [String],
    validate: {
      validator: function (arr) {
        return arr.length >= 2 && arr.length <= 6;
      },
      message: 'Options must contain between 2 and 6 items',
    },
  },
  correctAnswer: {
    type: String,
    required: true,
  },
  explanation: {
    type: String,
  },
});

const testSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Test title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    topic: {
      type: String,
      required: [true, 'Test topic is required'],
      trim: true,
    },
    questions: {
      type: [questionSchema],
      validate: {
        validator: function (arr) {
          return arr.length >= 3 && arr.length <= 50;
        },
        message: 'Test must contain between 3 and 50 questions',
      },
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    timeLimit: {
      type: Number, // in minutes
      min: 5,
      max: 180,
      default: 30,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

testSchema.index({ user: 1, createdAt: -1 });
testSchema.index({ topic: 'text', title: 'text' });

export default mongoose.model('Test', testSchema);
