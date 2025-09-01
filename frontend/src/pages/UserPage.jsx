import React, { useState, useEffect, useRef } from "react"; 
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaCode, FaCheck, FaCamera, FaUpload, FaTimes, FaTrophy, FaFire, FaStar, FaCrown, FaRocket } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { toast } from "react-hot-toast";
import Footer from "../components/Footer";

const UserPage = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user, getUserStats } = useAuth();
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const fileInputRef = useRef(null);

  // Determine which user to display
  const targetUsername = username || user;

  const fetchUserStats = async () => {
    if (!targetUsername) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('Fetching stats for user:', targetUsername);
      
      // Force fresh data by adding timestamp
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/user-progress/stats/${targetUsername}?t=${Date.now()}`,
        { withCredentials: true }
      );
      
      console.log('API Response:', response.data);
      setUserStats(response.data);
      
      // Also try getUserStats as backup
      const stats = await getUserStats();
      if (stats) {
        console.log('getUserStats response:', stats);
        // Use the more complete data
        if (stats.progress && stats.progress.difficultyStats) {
          setUserStats(stats);
        }
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
      toast.error('Failed to load user statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserStats();
  }, [targetUsername]);

  // Photo upload functions
  const handlePhotoUpload = async (file) => {
    if (!file) return;
    
    const formData = new FormData();
    formData.append('profilePhoto', file);
    
    try {
      setUploadingPhoto(true);
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/users/upload-profile-photo`,
        formData,
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      toast.success('Profile photo updated successfully! 📸');
      
      // Update local state with new photo
      setUserStats(prev => ({
        ...prev,
        user: {
          ...prev.user,
          profilePhoto: response.data.profilePhoto
        }
      }));
      
      // Refresh user stats to get updated data
      await fetchUserStats();
      
      setShowPhotoModal(false);
    } catch (error) {
      console.error('Photo upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      
      handlePhotoUpload(file);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex items-center justify-center">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div 
            className="w-32 h-32 border-4 border-transparent border-t-emerald-500 rounded-full mb-6"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">
            Loading profile...
          </h2>
        </motion.div>
      </div>
    );
  }

  if (!userStats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex items-center justify-center">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-24 h-24 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaTimes className="text-white text-3xl" />
          </div>
          <h1 className="text-3xl font-bold mb-4">User Not Found</h1>
          <p className="text-gray-400 mb-6">The requested user could not be found</p>
          <motion.button
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-emerald-500/25"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            🏠 Go Home
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // Extract stats and progress from userStats with fallbacks
  const stats = userStats?.stats || {
    problemsSolved: 0,
    totalSubmissions: 0,
    successfulSubmissions: 0,
    successRate: 0,
    currentStreak: 0,
    streakDays: 0
  };

  const progress = userStats?.progress || {
    totalProblems: 0,
    difficultyStats: {},
    recentProblems: []
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <motion.div 
          className="relative bg-gradient-to-br from-gray-800/50 via-gray-900/50 to-black/50 backdrop-blur-sm rounded-3xl p-8 mb-8 text-center border border-gray-700/30 overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-blue-500/5 to-purple-500/5"></div>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500"></div>
          
          <div className="relative z-10">
            <div className="relative w-28 h-28 mx-auto mb-6">
              {/* Profile Picture */}
              {userStats.user.profilePhoto ? (
                <motion.div 
                  className="w-28 h-28 rounded-full overflow-hidden border-4 border-emerald-500 shadow-2xl"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <img 
                    src={userStats.user.profilePhoto} 
                    alt={userStats.user.username}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.log('Image failed to load:', userStats.user.profilePhoto);
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  {/* Fallback if image fails to load */}
                  <div 
                    className="w-full h-full bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full flex items-center justify-center border-4 border-emerald-500"
                    style={{ display: 'none' }}
                  >
                    <span className="text-5xl font-bold text-white">
                      {userStats.user.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  className="w-28 h-28 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full flex items-center justify-center border-4 border-emerald-500 shadow-2xl"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <span className="text-5xl font-bold text-white">
                    {userStats.user.username.charAt(0).toUpperCase()}
                  </span>
                </motion.div>
              )}
              
              {/* Upload Button - Only show for current user */}
              {targetUsername === user && (
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={openFileDialog}
                  disabled={uploadingPhoto}
                  className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full flex items-center justify-center hover:from-emerald-600 hover:to-green-700 transition-all duration-200 disabled:opacity-50 shadow-lg"
                  title="Upload Profile Photo"
                >
                  {uploadingPhoto ? (
                    <motion.div 
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                  ) : (
                    <FaCamera className="text-white text-sm" />
                  )}
                </motion.button>
              )}
            </div>
            
            <motion.h1 
              className="text-5xl font-bold mb-3 bg-gradient-to-r from-white via-emerald-100 to-blue-100 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              {userStats.user.username}
            </motion.h1>
            
            <motion.p 
              className="text-gray-300 text-lg mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              Member since {new Date(userStats.user.joinedAt).toLocaleDateString()}
            </motion.p>
            
            {/* Premium Badge */}
            {userStats.user.isPremium && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                className="inline-block"
              >
                <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-black px-6 py-3 rounded-full font-bold text-sm flex items-center gap-3 shadow-lg">
                  <FaCrown className="text-lg" />
                  Premium Member
                  <FaStar className="text-lg" />
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Questions Solved */}
          <motion.div 
            className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/30 hover:border-emerald-500/50 transition-all duration-300 group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            whileHover={{ y: -5, scale: 1.02 }}
          >
            <div className="text-center">
              <motion.div 
                className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-emerald-500/25 transition-all duration-300"
                whileHover={{ rotate: 5, scale: 1.1 }}
              >
                <FaCode className="text-white text-2xl" />
              </motion.div>
              <h3 className="text-4xl font-bold text-emerald-400 mb-2">{stats.problemsSolved}</h3>
              <p className="text-gray-300 font-medium">Problems Solved</p>
            </div>
          </motion.div>

          {/* Easy Problems */}
          <motion.div 
            className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/30 hover:border-green-500/50 transition-all duration-300 group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            whileHover={{ y: -5, scale: 1.02 }}
          >
            <div className="text-center">
              <motion.div 
                className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-green-500/25 transition-all duration-300"
                whileHover={{ rotate: 5, scale: 1.1 }}
              >
                <span className="text-white text-2xl font-bold">E</span>
              </motion.div>
              <h3 className="text-4xl font-bold text-green-400 mb-2">
                {progress.difficultyStats?.Easy || 0}
              </h3>
              <p className="text-gray-300 font-medium">Easy Problems</p>
            </div>
          </motion.div>

          {/* Medium Problems */}
          <motion.div 
            className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/30 hover:border-yellow-500/50 transition-all duration-300 group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            whileHover={{ y: -5, scale: 1.02 }}
          >
            <div className="text-center">
              <motion.div 
                className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-yellow-500/25 transition-all duration-300"
                whileHover={{ rotate: 5, scale: 1.1 }}
              >
                <span className="text-white text-2xl font-bold">M</span>
              </motion.div>
              <h3 className="text-4xl font-bold text-yellow-400 mb-2">
                {progress.difficultyStats?.Medium || 0}
              </h3>
              <p className="text-gray-300 font-medium">Medium Problems</p>
            </div>
          </motion.div>

          {/* Hard Problems */}
          <motion.div 
            className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/30 hover:border-red-500/50 transition-all duration-300 group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            whileHover={{ y: -5, scale: 1.02 }}
          >
            <div className="text-center">
              <motion.div 
                className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-red-500/25 transition-all duration-300"
                whileHover={{ rotate: 5, scale: 1.1 }}
              >
                <span className="text-white text-2xl font-bold">H</span>
              </motion.div>
              <h3 className="text-4xl font-bold text-red-400 mb-2">
                {progress.difficultyStats?.Hard || 0}
              </h3>
              <p className="text-gray-300 font-medium">Hard Problems</p>
            </div>
          </motion.div>
        </div>

        {/* Solved Problems List */}
        <motion.div 
          className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-3xl p-8 border border-gray-700/30 mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
              <FaTrophy className="text-white text-xl" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">
              Solved Problems
            </h2>
          </div>
          
          {progress.recentProblems && progress.recentProblems.length > 0 ? (
            <div className="space-y-4">
              {progress.recentProblems.map((problem, index) => (
                <motion.div
                  key={problem._id || index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="bg-gradient-to-r from-gray-700/50 to-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-600/30 hover:border-emerald-500/50 transition-all duration-300 group hover:shadow-lg hover:shadow-emerald-500/10"
                  whileHover={{ x: 5, scale: 1.01 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <motion.div 
                        className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg"
                        whileHover={{ rotate: 10, scale: 1.1 }}
                      >
                        <FaCheck className="text-white text-lg" />
                      </motion.div>
                      <div>
                        <h3 className="font-bold text-white text-xl mb-2">{problem.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                          problem.difficulty === "Easy" ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white" :
                          problem.difficulty === "Medium" ? "bg-gradient-to-r from-yellow-500 to-orange-600 text-white" :
                          "bg-gradient-to-r from-red-500 to-pink-600 text-white"
                        }`}>
                          {problem.difficulty}
                        </span>
                      </div>
                    </div>
                    <motion.button
                      onClick={() => navigate(`/problems/${problem._id}`)}
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-blue-500/25"
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      View Problem
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div 
              className="text-center py-12"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <div className="w-20 h-20 bg-gradient-to-r from-gray-600 to-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaCode className="text-gray-300 text-3xl" />
              </div>
              <h3 className="text-2xl font-bold text-gray-200 mb-3">No Problems Solved Yet</h3>
              <p className="text-gray-400 mb-6 text-lg">Start your coding journey and see your progress here!</p>
              <motion.button
                onClick={() => navigate('/problems')}
                className="bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-emerald-500/25"
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.95 }}
              >
                🚀 Start Solving Problems
              </motion.button>
            </motion.div>
          )}
        </motion.div>

        {/* Premium Features Section */}
        {userStats.user.isPremium && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="bg-gradient-to-br from-yellow-900/20 via-yellow-800/20 to-yellow-900/20 border border-yellow-500/40 rounded-3xl p-8 mb-8 backdrop-blur-sm"
          >
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-6">
                <FaStar className="text-3xl text-yellow-400" />
                <h3 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                  Premium Features
                </h3>
                <FaStar className="text-3xl text-yellow-400" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div 
                  className="bg-gradient-to-br from-yellow-900/30 to-yellow-800/30 rounded-2xl p-6 border border-yellow-500/30 hover:border-yellow-400/50 transition-all duration-300"
                  whileHover={{ y: -5, scale: 1.02 }}
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <FaTrophy className="text-white text-xl" />
                  </div>
                  <p className="text-yellow-300 font-bold text-lg mb-2">🎯 Advanced Analytics</p>
                  <p className="text-gray-300">Detailed progress tracking & insights</p>
                </motion.div>
                <motion.div 
                  className="bg-gradient-to-br from-yellow-900/30 to-yellow-800/30 rounded-2xl p-6 border border-yellow-500/30 hover:border-yellow-400/50 transition-all duration-300"
                  whileHover={{ y: -5, scale: 1.02 }}
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <FaRocket className="text-white text-xl" />
                  </div>
                  <p className="text-yellow-300 font-bold text-lg mb-2">🚀 Priority Support</p>
                  <p className="text-gray-300">Get help faster with premium support</p>
                </motion.div>
                <motion.div 
                  className="bg-gradient-to-br from-yellow-900/30 to-yellow-800/30 rounded-2xl p-6 border border-yellow-500/30 hover:border-yellow-400/50 transition-all duration-300"
                  whileHover={{ y: -5, scale: 1.02 }}
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <FaCrown className="text-white text-xl" />
                  </div>
                  <p className="text-yellow-300 font-bold text-lg mb-2">💎 Exclusive Content</p>
                  <p className="text-gray-300">Premium problems & advanced features</p>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        {/* Photo Upload Modal */}
        <AnimatePresence>
          {showPhotoModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4"
              onClick={() => setShowPhotoModal(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-gradient-to-br from-gray-900 to-black p-8 rounded-3xl shadow-2xl border border-emerald-500/20 w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button */}
                <motion.button
                  onClick={() => setShowPhotoModal(false)}
                  className="absolute top-4 right-4 w-8 h-8 bg-gray-800/50 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-full flex items-center justify-center transition-all duration-200"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FaTimes className="text-lg" />
                </motion.button>

                {/* Header */}
                <div className="text-center mb-8">
                  <motion.div 
                    className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
                    whileHover={{ scale: 1.05, rotate: 5 }}
                  >
                    <FaCamera className="text-white text-3xl" />
                  </motion.div>
                  <h2 className="text-3xl font-bold text-white mb-2">Update Profile Photo</h2>
                  <p className="text-gray-400">Choose a new profile picture</p>
                </div>

                {/* Upload Options */}
                <div className="space-y-4">
                  <motion.button
                    onClick={openFileDialog}
                    disabled={uploadingPhoto}
                    className="w-full bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white py-4 rounded-xl font-semibold text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-3"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <FaUpload className="text-xl" />
                    {uploadingPhoto ? 'Uploading...' : 'Choose Photo'}
                  </motion.button>
                  
                  <div className="text-center">
                    <p className="text-gray-400 text-sm">
                      Supported formats: JPG, PNG, GIF (Max 5MB)
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <Footer />
      </div>
    </div>
  );
};

export default UserPage;
