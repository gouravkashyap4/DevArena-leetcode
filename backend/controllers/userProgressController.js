import UserProgress from "../models/UserProgress.js";
import User from "../models/User.js";
import Problem from "../models/Problem.js";

// Add solved problem
export const addSolvedProblem = async (req, res) => {
  try {
    let { userId, username, problemId, language, solveTime } = req.body;

    // Validate input
    if ((!userId && !username) || !problemId) {
      return res.status(400).json({ message: "userId or username and problemId are required" });
    }

    // Check if user exists
    // Resolve user by either userId or username
    let user = null;
    if (userId) {
      user = await User.findById(userId);
    } else if (username) {
      user = await User.findOne({ username });
      if (user) userId = user._id;
    }
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if problem exists
    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }

    // Find or create user progress document
    let progress = await UserProgress.findOne({ userId });
    if (!progress) {
      progress = new UserProgress({ 
        userId, 
        solvedProblems: [],
        problemAttempts: [],
        totalSubmissions: 0,
        successfulSubmissions: 0
      });
    }

    // Check if problem was already solved
    const wasAlreadySolved = progress.solvedProblems.map(id => id.toString()).includes(problemId.toString());
    
    if (!wasAlreadySolved) {
      // Add to solved problems
      progress.solvedProblems.push(problemId);
      
      // Add problem attempt record
      progress.problemAttempts.push({
        problemId,
        attempts: 1,
        firstSolvedAt: new Date(),
        lastAttemptAt: new Date(),
        bestTime: solveTime || null,
        language: language || null
      });
      
      // Update submission counts
      progress.successfulSubmissions += 1;
      progress.updatedAt = new Date();
      
      // Update user statistics
      console.log('Before update - User problemsSolved:', user.problemsSolved);
      user.problemsSolved += 1;
      user.successfulSubmissions += 1;
      user.lastSolvedAt = new Date();
      console.log('After update - User problemsSolved:', user.problemsSolved);
      
      // Calculate streak
      const today = new Date();
      const lastSolved = user.lastSolvedAt;
      if (lastSolved) {
        const daysDiff = Math.floor((today - lastSolved) / (1000 * 60 * 60 * 24));
        if (daysDiff <= 1) {
          user.currentStreak += 1;
          if (user.currentStreak > user.streakDays) {
            user.streakDays = user.currentStreak;
          }
        } else {
          user.currentStreak = 1;
        }
      } else {
        user.currentStreak = 1;
        user.streakDays = 1;
      }
      
      await user.save();
      console.log('User saved successfully. New problemsSolved:', user.problemsSolved);
    } else {
      // Problem was already solved, just update attempt count and time if better
      const attemptRecord = progress.problemAttempts.find(
        attempt => attempt.problemId.toString() === problemId.toString()
      );
      
      if (attemptRecord) {
        attemptRecord.attempts += 1;
        attemptRecord.lastAttemptAt = new Date();
        
        // Update best time if current solve time is better
        if (solveTime && (!attemptRecord.bestTime || solveTime < attemptRecord.bestTime)) {
          attemptRecord.bestTime = solveTime;
        }
        
        // Update language if provided
        if (language) {
          attemptRecord.language = language;
        }
      }
      
      // Update submission counts
      progress.totalSubmissions += 1;
      progress.updatedAt = new Date();
      
      // Update user total submissions
      user.totalSubmissions += 1;
      await user.save();
    }

    await progress.save();

    // Populate solvedProblems for frontend
    const populatedProgress = await progress.populate("solvedProblems");

    res.json({ 
      message: wasAlreadySolved ? "Problem attempt recorded" : "Problem marked as solved", 
      progress: populatedProgress,
      userStats: {
        problemsSolved: user.problemsSolved,
        totalSubmissions: user.totalSubmissions,
        successfulSubmissions: user.successfulSubmissions,
        currentStreak: user.currentStreak,
        streakDays: user.streakDays
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get solved problems for a user by userId
export const getSolvedProblems = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate input
    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const progress = await UserProgress.findOne({ userId }).populate("solvedProblems");

    if (!progress) return res.json({ solvedProblems: [] });

    res.json({ solvedProblems: progress.solvedProblems });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get solved problems for a user by username
export const getSolvedProblemsByUsername = async (req, res) => {
  try {
    const { username } = req.params;
    console.log('Looking for user with username:', username);

    // Validate input
    if (!username) {
      return res.status(400).json({ message: "username is required" });
    }

    // Find user by username OR email (since frontend might be using either)
    let user = await User.findOne({ username });
    if (!user) {
      user = await User.findOne({ email: username });
      console.log('Trying email search, found user:', user ? user._id : 'Not found');
    }
    console.log('Found user:', user ? user._id : 'Not found');
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const progress = await UserProgress.findOne({ userId: user._id }).populate("solvedProblems");
    console.log('Found progress:', progress ? progress.solvedProblems.length : 'No progress');

    if (!progress) return res.json({ solvedProblems: [] });

    res.json({ solvedProblems: progress.solvedProblems });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get user statistics and achievements
export const getUserStats = async (req, res) => {
  try {
    const { username } = req.params;
    console.log('Getting stats for user:', username);

    // Validate input
    if (!username) {
      return res.status(400).json({ message: "username is required" });
    }

    // Find user by username OR email
    let user = await User.findOne({ username });
    if (!user) {
      user = await User.findOne({ email: username });
    }
    
    if (!user) {
      console.log('User not found for username/email:', username);
      return res.status(404).json({ message: "User not found" });
    }

    console.log('Found user:', user.username, 'with ID:', user._id);

    // Get user progress
    const progress = await UserProgress.findOne({ userId: user._id }).populate("solvedProblems");
    
    console.log('Progress found:', progress ? 'Yes' : 'No');
    if (progress) {
      console.log('Progress details:', {
        solvedProblems: progress.solvedProblems.length,
        problemAttempts: progress.problemAttempts.length,
        totalSubmissions: progress.totalSubmissions,
        successfulSubmissions: progress.successfulSubmissions
      });
    }
    
    // Calculate additional statistics
    const totalProblems = progress ? progress.solvedProblems.length : 0;
    const successRate = user.totalSubmissions > 0 ? 
      ((user.successfulSubmissions / user.totalSubmissions) * 100).toFixed(1) : 0;
    
    // Get difficulty breakdown
    const difficultyStats = {};
    
    if (progress && progress.solvedProblems.length > 0) {
      console.log('Processing solved problems:', progress.solvedProblems.length);
      progress.solvedProblems.forEach(problem => {
        const difficulty = problem.difficulty || 'unknown';
        difficultyStats[difficulty] = (difficultyStats[difficulty] || 0) + 1;
        console.log(`Adding problem ${problem.title} with difficulty ${difficulty}`);
      });
    }
    
    console.log('Final difficultyStats:', difficultyStats);

    // Calculate achievements
    const achievements = [];
    if (totalProblems >= 1) achievements.push({ name: "First Problem", description: "Solved your first problem", unlocked: true });
    if (totalProblems >= 5) achievements.push({ name: "Getting Started", description: "Solved 5 problems", unlocked: true });
    if (totalProblems >= 10) achievements.push({ name: "Problem Solver", description: "Solved 10 problems", unlocked: true });
    if (totalProblems >= 25) achievements.push({ name: "Code Warrior", description: "Solved 25 problems", unlocked: true });
    if (totalProblems >= 50) achievements.push({ name: "Algorithm Master", description: "Solved 50 problems", unlocked: true });
    if (totalProblems >= 100) achievements.push({ name: "Coding Legend", description: "Solved 100 problems", unlocked: true });
    
    if (user.currentStreak >= 3) achievements.push({ name: "Streak Starter", description: "3-day solving streak", unlocked: true });
    if (user.currentStreak >= 7) achievements.push({ name: "Week Warrior", description: "7-day solving streak", unlocked: true });
    if (user.currentStreak >= 30) achievements.push({ name: "Monthly Master", description: "30-day solving streak", unlocked: true });
    
    if (parseFloat(successRate) >= 80) achievements.push({ name: "High Achiever", description: "80%+ success rate", unlocked: true });
    if (parseFloat(successRate) >= 95) achievements.push({ name: "Perfectionist", description: "95%+ success rate", unlocked: true });

    const responseData = {
      user: {
        username: user.username,
        email: user.email,
        joinedAt: user.joinedAt,
        isPremium: user.isPremium,
        profilePhoto: user.profilePhoto // Add profile photo to response
      },
      stats: {
        problemsSolved: totalProblems, // Use actual solved problems count instead of user.problemsSolved
        totalSubmissions: user.totalSubmissions,
        successfulSubmissions: user.successfulSubmissions,
        successRate: parseFloat(successRate),
        currentStreak: user.currentStreak,
        streakDays: user.streakDays,
        lastSolvedAt: user.lastSolvedAt
      },
      progress: {
        totalProblems,
        difficultyStats,
        recentProblems: progress ? progress.solvedProblems.slice(-5) : [] // Last 5 solved problems
      },
      achievements
    };
    
    console.log('getUserStats response for', username, ':', responseData);
    res.json(responseData);
  } catch (err) {
    console.error('getUserStats error:', err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Fix user statistics by syncing with progress data
export const fixUserStats = async (req, res) => {
  try {
    const { username } = req.params;
    console.log('Fixing stats for user:', username);

    // Find user
    let user = await User.findOne({ username });
    if (!user) {
      user = await User.findOne({ email: username });
    }
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get user progress
    const progress = await UserProgress.findOne({ userId: user._id }).populate("solvedProblems");
    
    if (!progress) {
      return res.json({ message: "No progress found for user" });
    }

    // Calculate correct stats from progress
    const solvedCount = progress.solvedProblems.length;
    const totalSubmissions = progress.totalSubmissions || 0;
    const successfulSubmissions = progress.successfulSubmissions || 0;
    
    console.log('Current user stats:', {
      problemsSolved: user.problemsSolved,
      totalSubmissions: user.totalSubmissions,
      successfulSubmissions: user.successfulSubmissions
    });
    
    console.log('Progress stats:', {
      solvedCount,
      totalSubmissions,
      successfulSubmissions
    });

    // Update user model with correct stats
    user.problemsSolved = solvedCount;
    user.totalSubmissions = totalSubmissions;
    user.successfulSubmissions = successfulSubmissions;
    
    await user.save();
    
    console.log('Updated user stats:', {
      problemsSolved: user.problemsSolved,
      totalSubmissions: user.totalSubmissions,
      successfulSubmissions: user.successfulSubmissions
    });

    res.json({ 
      message: "User stats fixed successfully",
      oldStats: {
        problemsSolved: user.problemsSolved,
        totalSubmissions: user.totalSubmissions,
        successfulSubmissions: user.successfulSubmissions
      },
      newStats: {
        problemsSolved: solvedCount,
        totalSubmissions,
        successfulSubmissions
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
