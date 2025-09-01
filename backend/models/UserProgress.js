import mongoose from "mongoose";

const userProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  solvedProblems: [{ type: mongoose.Schema.Types.ObjectId, ref: "Problem" }],
  problemAttempts: [{
    problemId: { type: mongoose.Schema.Types.ObjectId, ref: "Problem" },
    attempts: { type: Number, default: 1 },
    firstSolvedAt: { type: Date, default: Date.now },
    lastAttemptAt: { type: Date, default: Date.now },
    bestTime: { type: Number, default: null }, // in milliseconds
    language: { type: String, default: null }
  }],
  totalSubmissions: { type: Number, default: 0 },
  successfulSubmissions: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now }
});

const UserProgress = mongoose.model("UserProgress", userProgressSchema);
export default UserProgress;
