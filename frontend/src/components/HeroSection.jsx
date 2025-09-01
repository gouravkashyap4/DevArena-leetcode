import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const HeroSection = ({ onLoginClick, isLoggedIn }) => {
  const navigate = useNavigate();
  
  const fullText = `$ devarena run --mode competitive
→ Loading 3,248 problems...
→ Compiling your solutions...
→ Running test cases...
✓ All test cases passed! Rank up and claim your rewards.`;

  const handleStartSolving = () => {
    if (isLoggedIn) {
      navigate("/problems");
    } else {
      onLoginClick();
    }
  };

  const handleJoinArena = () => {
    if (isLoggedIn) {
      navigate("/problems");
    } else {
      onLoginClick();
    }
  };

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white py-20 px-6 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-blue-500/5 to-purple-500/5"></div>
      
      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-40 right-20 w-24 h-24 bg-blue-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.6, 0.3, 0.6],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-40 left-1/4 w-20 h-20 bg-purple-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
        {/* Title */}
        <motion.h1 
          className="text-5xl md:text-7xl font-extrabold leading-tight"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Level Up Your{" "}
          <span className="bg-gradient-to-r from-emerald-400 via-green-400 to-blue-500 bg-clip-text text-transparent">
            Coding Skills
          </span>
        </motion.h1>
        
        {/* Subtitle */}
        <motion.p 
          className="text-gray-300 max-w-3xl mx-auto text-lg leading-relaxed"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          DevArena is the ultimate competitive programming platform. Solve challenging problems,
          climb the leaderboard, and sharpen your coding skills with real-time feedback.
        </motion.p>

        {/* Buttons */}
        <motion.div 
          className="flex flex-col sm:flex-row justify-center gap-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <motion.button
            className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-emerald-500/25"
            whileHover={{ scale: 1.05, y: -3 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleStartSolving}
          >
            🚀 Start Solving
          </motion.button>
          <motion.button
            className="px-8 py-4 bg-gradient-to-r from-gray-700/50 to-gray-800/50 hover:from-gray-600/50 hover:to-gray-700/50 rounded-xl font-semibold text-lg transition-all duration-300 border border-gray-600/30 hover:border-emerald-500/50"
            whileHover={{ scale: 1.05, y: -3 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleJoinArena}
          >
            ⚔️ Join the Arena
          </motion.button>
        </motion.div>

        {/* Floating Code Box */}
        <motion.div
          className="mt-16 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/30 text-left font-mono text-green-400 text-sm shadow-2xl"
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          whileHover={{ y: -5, scale: 1.02 }}
        >
          <div className="flex gap-2 mb-4">
            <span className="w-3 h-3 rounded-full bg-red-500"></span>
            <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
            <span className="w-3 h-3 rounded-full bg-green-500"></span>
          </div>
          <pre className="whitespace-pre-wrap text-gray-300 leading-relaxed">
            {fullText}
            <motion.span 
              className="text-emerald-400"
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              |
            </motion.span>
          </pre>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
