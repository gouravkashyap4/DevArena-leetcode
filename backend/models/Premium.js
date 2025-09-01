import mongoose from 'mongoose';

const premiumSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['course', 'workshop', 'challenge', 'resource'],
    default: 'course'
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  fileUrl: {
    type: String,
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number
  },
  fileType: {
    type: String
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },


}, {
  timestamps: true
});

// Index for better query performance
premiumSchema.index({ category: 1, difficulty: 1 });
premiumSchema.index({ uploadedBy: 1 });
premiumSchema.index({ isActive: 1 });

const Premium = mongoose.model('Premium', premiumSchema);

export default Premium;
