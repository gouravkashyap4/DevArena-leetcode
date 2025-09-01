import React from "react";
import { motion } from "framer-motion";

const KnowledgeSection = () => {
  return (
    <section className="relative bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white py-24 px-6 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/3 via-blue-500/3 to-purple-500/3"></div>
      
      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 right-20 w-36 h-36 bg-emerald-500/8 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 left-20 w-28 h-28 bg-blue-500/8 rounded-full blur-3xl"
          animate={{
            scale: [1.4, 1, 1.4],
            opacity: [0.3, 0.1, 0.3],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        
        {/* ✅ Heading Animation */}
        <motion.h2
          className="text-5xl md:text-6xl font-bold mb-8 text-center bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: false, amount: 0.2 }}  // Repeats every time
        >
          Unlock Your Coding Potential
        </motion.h2>

        {/* ✅ Subheading Animation */}
        <motion.p
          className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto mb-20 text-center leading-relaxed"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: false, amount: 0.2 }} // Repeats
        >
          Thousands of developers struggle to prepare for interviews and improve problem-solving skills.
          Most resources are scattered, locked, or poorly structured. DevArena brings everything together:
          structured practice, real-world challenges, and premium learning paths.
        </motion.p>
      </div>

      {/* ✅ Content Blocks */}
      <div className="relative z-10 max-w-7xl mx-auto grid md:grid-cols-2 gap-12">
        
        {/* ✅ Card 1 */}
        <motion.div
          className="flex flex-col gap-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700/30 
                     transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/20 hover:border-emerald-500/50"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: false, amount: 0.2 }} // Repeats
          whileHover={{ y: -5 }}
        >
          <div className="flex items-center gap-3">
            <span className="text-3xl">💻</span>
            <h3 className="text-2xl font-semibold text-white">Practice Hundreds of Problems</h3>
          </div>
          <p className="text-gray-300 text-lg leading-relaxed">
            From easy to hard, DevArena offers a wide range of problems to sharpen your coding
            and algorithmic skills. Compete with others and climb the leaderboard.
          </p>
          <ul className="space-y-3 text-gray-300">
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
              500+ coding problems
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
              Real interview-style questions
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
              Daily coding challenges
            </li>
          </ul>
          <div className="bg-gradient-to-br from-gray-700/50 to-gray-800/50 text-sm rounded-xl p-5 font-mono border border-gray-600/30 shadow-inner">
            <p className="text-emerald-400">Problem: Two Sum ✅</p>
            <p className="text-emerald-400">Problem: Longest Substring ✅</p>
            <p className="text-yellow-400">Problem: LRU Cache ⏳</p>
            <p className="text-yellow-400">Problem: Word Ladder ⏳</p>
            <p className="text-blue-400">Leaderboard Rank: #42</p>
          </div>
        </motion.div>

        {/* ✅ Card 2 */}
        <motion.div
          className="flex flex-col gap-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm p-8 rounded-2xl border border-gray-700/30 
                     transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-emerald-500/20 hover:border-emerald-500/50"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: false, amount: 0.2 }}
          whileHover={{ y: -5 }}
        >
          <div className="flex items-center gap-3">
            <span className="text-3xl">🚀</span>
            <h3 className="text-2xl font-semibold text-white">Go Premium, Level Up Faster</h3>
          </div>
          <p className="text-gray-300 text-lg leading-relaxed">
            Unlock advanced features, curated problem sets, and in-depth tutorials designed
            by industry experts to help you ace your coding interviews and build projects.
          </p>
          <ul className="space-y-3 text-gray-300">
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
              Exclusive premium problems
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
              Mock interviews & AI feedback
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
              Detailed editorial solutions
            </li>
          </ul>
          <div className="bg-gradient-to-br from-gray-700/50 to-gray-800/50 text-sm rounded-xl p-5 font-mono border border-gray-600/30 shadow-inner">
            <p className="text-emerald-400">Premium Unlocked ✅</p>
            <p className="text-yellow-400">Mock Interview Session: Scheduled ⏳</p>
            <p className="text-blue-400">AI Assistant: Active</p>
            <p className="text-pink-400">Exclusive Problems: 120+</p>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default KnowledgeSection;
