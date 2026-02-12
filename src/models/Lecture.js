import mongoose from 'mongoose';

const lectureSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Lecture title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    content: {
      type: String,
      required: [true, 'Lecture content is required'],
      maxlength: [50000, 'Content cannot exceed 50000 characters'],
    },
    summary: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    subject: {
      type: String,
      trim: true,
    },
    wordCount: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

lectureSchema.index({ user: 1, createdAt: -1 });
lectureSchema.index({ title: 'text', subject: 'text' });

export default mongoose.model('Lecture', lectureSchema);
