import React from "react";
import { FaCode, FaLightbulb, FaTrophy, FaUsers } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Features = ({ onLoginClick, isLoggedIn }) => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <FaCode className="text-emerald-400 text-4xl mb-4" />,
      title: "Practice Problems",
      description:
        "Sharpen your coding skills with hundreds of challenges across different difficulty levels.",
      link: "/problems",
      requiresAuth: true
    },
    {
      icon: <FaLightbulb className="text-blue-400 text-4xl mb-4" />,
      title: "Learn New Concepts",
      description:
        "Detailed explanations and hints to help you understand algorithms and data structures better.",
      link: "/problems",
      requiresAuth: true
    },
    {
      icon: <FaTrophy className="text-yellow-400 text-4xl mb-4" />,
      title: "Compete & Earn Badges",
      description:
        "Participate in coding contests and climb the leaderboard to showcase your skills.",
      link: "/problems",
      requiresAuth: true
    },
    {
      icon: <FaUsers className="text-purple-400 text-4xl mb-4" />,
      title: "Community Support",
      description:
        "Join an active developer community, discuss problems, and share solutions.",
      link: "/about",
      requiresAuth: false
    },
  ];

  const handleFeatureClick = (feature) => {
    if (feature.requiresAuth && !isLoggedIn) {
      onLoginClick();
    } else {
      navigate(feature.link);
    }
  };

  return (
    <section className="relative bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white py-24 px-6 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/3 via-blue-500/3 to-purple-500/3"></div>
      
      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-10 right-10 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 left-10 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.2, 0.4],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Heading */}
        <motion.div 
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">
            Why Choose DevArena?
          </h2>
          <p className="text-gray-300 text-xl max-w-2xl mx-auto">
            Everything you need to become a better programmer.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-8 text-center border border-gray-700/30 hover:border-emerald-500/50 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-emerald-500/20"
              onClick={() => handleFeatureClick(feature)}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -8, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.div
                whileHover={{ rotate: 5, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {feature.icon}
              </motion.div>
              <h3 className="text-xl font-semibold mb-3 text-white">{feature.title}</h3>
              <p className="text-gray-300 text-sm leading-relaxed mb-4">{feature.description}</p>
              <div className="mt-4">
                <span className="text-emerald-400 text-sm font-medium hover:text-emerald-300 transition-colors duration-200">
                  {feature.requiresAuth && !isLoggedIn ? "Login to Access" : "Learn More →"}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
