import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema({
  questionIndex: Number,
  studentAnswer: String,
  isCorrect: Boolean,
  feedback: String,
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const examSchema = new mongoose.Schema(
  {
    test: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Test',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    startTime: {
      type: Date,
      default: Date.now,
    },
    endTime: {
      type: Date,
    },
    answers: [answerSchema],
    score: {
      type: Number,
      min: 0,
      max: 100,
    },
    status: {
      type: String,
      enum: ['in_progress', 'completed', 'expired'],
      default: 'in_progress',
    },
    timeSpent: {
      type: Number, // in seconds
    },
    socketRoomId: {
      type: String,
      unique: true,
      sparse: true,
    },
  },
  {
    timestamps: true,
  }
);

examSchema.index({ user: 1, status: 1, createdAt: -1 });
examSchema.index({ socketRoomId: 1 });

export default mongoose.model('Exam', examSchema);
