import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username:
    {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        minlength: 6,
        default : null // gogle or github users ke liiye null
    },
    githubId: {
        type: String,
        unique: true,
        sparse: true
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    isPremium: {
        type: Boolean,
        default: false
    },
    joinedAt: {
        type: Date,
        default: Date.now
    },
    profilePhoto: {
        type: String,
        default: null
    },
    premiumPlan: {
        type: String,
        default: null
    },
    premiumSince: {
        type: Date,
        default: null
    },
    lastPaymentId: {
        type: String,
        default: null
    },
    lastOrderId: {
        type: String,
        default: null
    },
    lastPaymentAmount: {
        type: Number,
        default: null
    },
    // Problem solving statistics
    problemsSolved: {
        type: Number,
        default: 0
    },
    totalSubmissions: {
        type: Number,
        default: 0
    },
    successfulSubmissions: {
        type: Number,
        default: 0
    },
    lastSolvedAt: {
        type: Date,
        default: null
    },
    streakDays: {
        type: Number,
        default: 0
    },
    currentStreak: {
        type: Number,
        default: 0
    }
});

const userModel = mongoose.model('User', userSchema);
export default userModel;

